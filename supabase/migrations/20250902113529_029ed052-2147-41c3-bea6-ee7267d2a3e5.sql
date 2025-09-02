-- Enable extended ADDA features with additional tables

-- Create community_events table for event management
CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title VARCHAR NOT NULL,
  description TEXT,
  event_type VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location VARCHAR,
  max_capacity INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline DATE,
  created_by UUID REFERENCES profiles(id),
  status VARCHAR DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create community_assets table for asset management
CREATE TABLE IF NOT EXISTS public.community_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  asset_name VARCHAR NOT NULL,
  asset_type VARCHAR NOT NULL,
  description TEXT,
  location VARCHAR,
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  current_value DECIMAL(12,2),
  condition VARCHAR DEFAULT 'good',
  maintenance_schedule JSONB,
  warranty_expires DATE,
  assigned_to UUID REFERENCES staff_members(id),
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create community_documents table for document management
CREATE TABLE IF NOT EXISTS public.community_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  document_name VARCHAR NOT NULL,
  document_type VARCHAR NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  mime_type VARCHAR,
  description TEXT,
  category VARCHAR NOT NULL,
  access_level VARCHAR DEFAULT 'public',
  uploaded_by UUID REFERENCES profiles(id),
  version_number INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create parking_slots table for parking management
CREATE TABLE IF NOT EXISTS public.parking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  building_id UUID REFERENCES buildings(id),
  slot_number VARCHAR NOT NULL,
  slot_type VARCHAR DEFAULT 'standard',
  floor_level INTEGER,
  area VARCHAR,
  is_reserved BOOLEAN DEFAULT false,
  assigned_unit_id UUID REFERENCES society_units(id),
  monthly_fee DECIMAL(10,2),
  status VARCHAR DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event_registrations table for event tracking
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(id),
  user_id UUID REFERENCES profiles(id),
  registration_date TIMESTAMPTZ DEFAULT now(),
  status VARCHAR DEFAULT 'registered',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_events
CREATE POLICY "Users can view events in their organization" ON public.community_events
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage events in their organization" ON public.community_events
  FOR ALL USING (
    organization_id = get_user_organization_id() AND 
    get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
  );

-- RLS policies for community_assets
CREATE POLICY "Users can view assets in their organization" ON public.community_assets
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage assets in their organization" ON public.community_assets
  FOR ALL USING (
    organization_id = get_user_organization_id() AND 
    get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
  );

-- RLS policies for community_documents
CREATE POLICY "Users can view public documents in their organization" ON public.community_documents
  FOR SELECT USING (
    organization_id = get_user_organization_id() AND 
    (access_level = 'public' OR get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]))
  );

CREATE POLICY "Admins can manage documents in their organization" ON public.community_documents
  FOR ALL USING (
    organization_id = get_user_organization_id() AND 
    get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
  );

-- RLS policies for parking_slots
CREATE POLICY "Users can view parking slots in their organization" ON public.parking_slots
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage parking slots in their organization" ON public.parking_slots
  FOR ALL USING (
    organization_id = get_user_organization_id() AND 
    get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
  );

-- RLS policies for event_registrations
CREATE POLICY "Users can view their own event registrations" ON public.event_registrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all event registrations" ON public.event_registrations
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM community_events WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_events_org_id ON public.community_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_community_events_date ON public.community_events(start_date);
CREATE INDEX IF NOT EXISTS idx_community_assets_org_id ON public.community_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_community_assets_type ON public.community_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_community_documents_org_id ON public.community_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_community_documents_category ON public.community_documents(category);
CREATE INDEX IF NOT EXISTS idx_parking_slots_org_id ON public.parking_slots(organization_id);
CREATE INDEX IF NOT EXISTS idx_parking_slots_building ON public.parking_slots(building_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_community_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_assets_updated_at
  BEFORE UPDATE ON public.community_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_documents_updated_at
  BEFORE UPDATE ON public.community_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_slots_updated_at
  BEFORE UPDATE ON public.parking_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();