-- Add comprehensive charge categories and master data tables
CREATE TABLE public.charge_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  category_name TEXT NOT NULL,
  category_type TEXT NOT NULL, -- maintenance, utility, amenity, parking, security, etc.
  description TEXT,
  default_amount NUMERIC DEFAULT 0,
  billing_frequency TEXT DEFAULT 'monthly', -- monthly, quarterly, annually, one_time
  is_mandatory BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Household members/residents with detailed personal and professional info
CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL,
  member_type TEXT NOT NULL, -- owner, tenant, family_member, guest
  relationship TEXT, -- head, spouse, child, parent, sibling, other
  
  -- Personal Information
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  marital_status TEXT,
  blood_group TEXT,
  
  -- Contact Information
  primary_phone TEXT,
  secondary_phone TEXT,
  email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Professional Information
  occupation TEXT,
  employer_name TEXT,
  employer_address TEXT,
  work_phone TEXT,
  annual_income NUMERIC,
  
  -- Identification Documents
  id_type TEXT, -- passport, driving_license, national_id, voter_id, etc.
  id_number TEXT,
  id_expiry_date DATE,
  
  -- Vehicle Information
  vehicle_count INTEGER DEFAULT 0,
  vehicle_details JSONB DEFAULT '[]'::jsonb,
  
  -- Status and Dates
  move_in_date DATE,
  move_out_date DATE,
  is_primary_resident BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- active, inactive, moved_out
  
  -- Additional Information
  special_needs TEXT,
  pets JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service type master data
CREATE TABLE public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL, -- anpr, maintenance, security, cleaning, etc.
  description TEXT,
  unit_type TEXT, -- per_detection, per_camera, per_hour, flat_rate
  default_rate NUMERIC DEFAULT 0,
  billing_model TEXT DEFAULT 'usage_based', -- usage_based, fixed, tiered
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Utility readings table
CREATE TABLE public.utility_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL,
  utility_type TEXT NOT NULL, -- electricity, water, gas, internet
  reading_date DATE NOT NULL,
  previous_reading NUMERIC DEFAULT 0,
  current_reading NUMERIC NOT NULL,
  units_consumed NUMERIC GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  rate_per_unit NUMERIC NOT NULL DEFAULT 0,
  fixed_charges NUMERIC DEFAULT 0,
  total_amount NUMERIC GENERATED ALWAYS AS ((current_reading - previous_reading) * rate_per_unit + fixed_charges) STORED,
  reading_by TEXT, -- meter_reader, resident, automated
  meter_number TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- pending, verified, billed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced maintenance charges with more categories
ALTER TABLE public.maintenance_charges 
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS late_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS penalty_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS due_reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS overdue_days INTEGER DEFAULT 0;

-- Parking management
CREATE TABLE public.parking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  slot_number TEXT NOT NULL,
  slot_type TEXT NOT NULL, -- covered, open, reserved, visitor
  location TEXT,
  monthly_rate NUMERIC DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  assigned_to_unit UUID,
  vehicle_type TEXT, -- car, bike, truck, etc.
  dimensions TEXT,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Amenity management
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  amenity_name TEXT NOT NULL,
  amenity_type TEXT NOT NULL, -- clubhouse, gym, pool, playground, etc.
  description TEXT,
  capacity INTEGER,
  hourly_rate NUMERIC DEFAULT 0,
  advance_booking_days INTEGER DEFAULT 7,
  max_booking_hours INTEGER DEFAULT 4,
  booking_rules JSONB DEFAULT '{}'::jsonb,
  maintenance_schedule TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.charge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for charge_categories
CREATE POLICY "Charge categories access by organization" ON public.charge_categories
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations 
    WHERE parent_id = get_user_organization(auth.uid())
  )
);

-- RLS Policies for household_members
CREATE POLICY "Household members via unit access" ON public.household_members
FOR ALL USING (
  unit_id IN (
    SELECT su.id FROM society_units su
    WHERE get_user_role(auth.uid()) = 'platform_admin' OR
    su.organization_id = get_user_organization(auth.uid()) OR
    su.organization_id IN (
      SELECT id FROM organizations 
      WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

-- RLS Policies for service_types
CREATE POLICY "Service types access by organization" ON public.service_types
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations 
    WHERE parent_id = get_user_organization(auth.uid())
  )
);

-- RLS Policies for utility_readings
CREATE POLICY "Utility readings via unit access" ON public.utility_readings
FOR ALL USING (
  unit_id IN (
    SELECT su.id FROM society_units su
    WHERE get_user_role(auth.uid()) = 'platform_admin' OR
    su.organization_id = get_user_organization(auth.uid()) OR
    su.organization_id IN (
      SELECT id FROM organizations 
      WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

-- RLS Policies for parking_slots
CREATE POLICY "Parking slots access by organization" ON public.parking_slots
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations 
    WHERE parent_id = get_user_organization(auth.uid())
  )
);

-- RLS Policies for amenities
CREATE POLICY "Amenities access by organization" ON public.amenities
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations 
    WHERE parent_id = get_user_organization(auth.uid())
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_charge_categories_updated_at 
  BEFORE UPDATE ON public.charge_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_household_members_updated_at 
  BEFORE UPDATE ON public.household_members 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_types_updated_at 
  BEFORE UPDATE ON public.service_types 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_utility_readings_updated_at 
  BEFORE UPDATE ON public.utility_readings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parking_slots_updated_at 
  BEFORE UPDATE ON public.parking_slots 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_amenities_updated_at 
  BEFORE UPDATE ON public.amenities 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_charge_categories_organization ON public.charge_categories(organization_id);
CREATE INDEX idx_household_members_unit ON public.household_members(unit_id);
CREATE INDEX idx_service_types_organization ON public.service_types(organization_id);
CREATE INDEX idx_utility_readings_unit ON public.utility_readings(unit_id);
CREATE INDEX idx_parking_slots_organization ON public.parking_slots(organization_id);
CREATE INDEX idx_amenities_organization ON public.amenities(organization_id);