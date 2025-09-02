
-- Create missing tables that are referenced in the code

-- Create visitors table
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  visitor_name VARCHAR NOT NULL,
  visitor_email VARCHAR,
  visitor_phone VARCHAR,
  company VARCHAR,
  purpose TEXT NOT NULL,
  host_id UUID REFERENCES hosts(id),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  visit_count INTEGER DEFAULT 1,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create maintenance_charges table
CREATE TABLE IF NOT EXISTS public.maintenance_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  unit_id UUID REFERENCES society_units(id),
  charge_category_id UUID REFERENCES charge_categories(id),
  amount DECIMAL NOT NULL DEFAULT 0,
  billing_period VARCHAR NOT NULL,
  due_date DATE,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to existing tables
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

ALTER TABLE society_units 
ADD COLUMN IF NOT EXISTS monthly_rate_per_sqft DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_flat_rate DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS parking_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';

ALTER TABLE pre_registrations 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Enable RLS on new tables
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_charges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for visitors table
CREATE POLICY "Admins can manage visitors in their organization" 
  ON public.visitors 
  FOR ALL 
  USING (
    organization_id = get_user_organization_id() AND 
    get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'operator'::user_role])
  );

CREATE POLICY "Users can view visitors in their organization" 
  ON public.visitors 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create RLS policies for maintenance_charges table
CREATE POLICY "Admins can manage maintenance charges in their organization" 
  ON public.maintenance_charges 
  FOR ALL 
  USING (
    organization_id = get_user_organization_id() AND 
    get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
  );

CREATE POLICY "Users can view maintenance charges in their organization" 
  ON public.maintenance_charges 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create triggers for updated_at columns
CREATE TRIGGER update_visitors_updated_at 
  BEFORE UPDATE ON visitors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_charges_updated_at 
  BEFORE UPDATE ON maintenance_charges 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitors_organization_id ON visitors(organization_id);
CREATE INDEX IF NOT EXISTS idx_visitors_host_id ON visitors(host_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_charges_organization_id ON maintenance_charges(organization_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_charges_unit_id ON maintenance_charges(unit_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_charges_status ON maintenance_charges(status);
