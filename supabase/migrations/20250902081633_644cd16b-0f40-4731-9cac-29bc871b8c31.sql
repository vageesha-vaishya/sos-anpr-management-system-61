-- Create missing tables for remaining features

-- Premise types table
CREATE TABLE public.premise_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ANPR detections table
CREATE TABLE public.anpr_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  camera_id UUID REFERENCES cameras(id),
  license_plate VARCHAR NOT NULL,
  confidence NUMERIC NOT NULL,
  detection_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  image_url TEXT,
  vehicle_type VARCHAR,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advertisement campaigns table
CREATE TABLE public.advertisement_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID,
  campaign_name VARCHAR NOT NULL,
  campaign_type VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget NUMERIC,
  status VARCHAR DEFAULT 'active',
  description TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Forum discussions table
CREATE TABLE public.forum_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  author_id UUID,
  category VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'active',
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Amenities table
CREATE TABLE public.amenities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  amenity_type VARCHAR NOT NULL,
  building_id UUID REFERENCES buildings(id),
  capacity INTEGER,
  operating_hours JSONB,
  booking_required BOOLEAN DEFAULT true,
  pricing JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Billing customers table  
CREATE TABLE public.billing_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  address TEXT,
  billing_plan VARCHAR,
  payment_method JSONB,
  organization_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Camera subscriptions table
CREATE TABLE public.camera_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  camera_id UUID REFERENCES cameras(id),
  subscription_plan VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_cost NUMERIC,
  features JSONB,
  organization_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Charge categories table
CREATE TABLE public.charge_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  charge_type VARCHAR NOT NULL,
  base_amount NUMERIC,
  billing_cycle VARCHAR,
  organization_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.premise_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anpr_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisement_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charge_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for premise_types (public access)
CREATE POLICY "Anyone can view premise types" 
ON public.premise_types FOR SELECT USING (true);

-- Create RLS policies for ANPR detections
CREATE POLICY "Users can view ANPR detections in their organization"
ON public.anpr_detections FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage ANPR detections in their organization"
ON public.anpr_detections FOR ALL 
USING (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

-- Create RLS policies for advertisement campaigns
CREATE POLICY "Users can view advertisement campaigns in their organization"
ON public.advertisement_campaigns FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage advertisement campaigns in their organization"
ON public.advertisement_campaigns FOR ALL 
USING (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

-- Create RLS policies for forum discussions
CREATE POLICY "Users can view forum discussions in their organization"
ON public.forum_discussions FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create forum discussions in their organization"
ON public.forum_discussions FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update their own forum discussions"
ON public.forum_discussions FOR UPDATE 
USING (author_id = auth.uid());

-- Create RLS policies for amenities
CREATE POLICY "Users can view amenities in their organization"
ON public.amenities FOR SELECT 
USING (building_id IN (
  SELECT b.id FROM buildings b 
  JOIN locations l ON b.location_id = l.id 
  WHERE l.organization_id = get_user_organization_id()
));

CREATE POLICY "Admins can manage amenities in their organization"
ON public.amenities FOR ALL 
USING (
  building_id IN (
    SELECT b.id FROM buildings b 
    JOIN locations l ON b.location_id = l.id 
    WHERE l.organization_id = get_user_organization_id()
  ) AND 
  get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

-- Create RLS policies for billing customers
CREATE POLICY "Users can view billing customers in their organization"
ON public.billing_customers FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage billing customers in their organization"
ON public.billing_customers FOR ALL 
USING (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

-- Create RLS policies for camera subscriptions
CREATE POLICY "Users can view camera subscriptions in their organization"
ON public.camera_subscriptions FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage camera subscriptions in their organization"
ON public.camera_subscriptions FOR ALL 
USING (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

-- Create RLS policies for charge categories
CREATE POLICY "Users can view charge categories in their organization"
ON public.charge_categories FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage charge categories in their organization"
ON public.charge_categories FOR ALL 
USING (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_premise_types_updated_at
  BEFORE UPDATE ON public.premise_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advertisement_campaigns_updated_at
  BEFORE UPDATE ON public.advertisement_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_discussions_updated_at
  BEFORE UPDATE ON public.forum_discussions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_amenities_updated_at
  BEFORE UPDATE ON public.amenities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_customers_updated_at
  BEFORE UPDATE ON public.billing_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_camera_subscriptions_updated_at
  BEFORE UPDATE ON public.camera_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_charge_categories_updated_at
  BEFORE UPDATE ON public.charge_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();