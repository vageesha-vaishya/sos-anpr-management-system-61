-- Add society-specific roles to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'society_president';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'society_secretary';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'society_treasurer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'society_committee_member';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'resident';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tenant';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'family_member';

-- Add RLS policies for society member management access
CREATE POLICY "Society admins can manage members" ON public.profiles
FOR ALL
USING (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY (ARRAY[
    'platform_admin'::user_role, 
    'franchise_admin'::user_role, 
    'customer_admin'::user_role,
    'society_president'::user_role, 
    'society_secretary'::user_role
  ])
);

-- Enable society users to access user management
CREATE POLICY "Society admins can insert new members" ON public.profiles
FOR INSERT
WITH CHECK (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY (ARRAY[
    'platform_admin'::user_role, 
    'franchise_admin'::user_role, 
    'customer_admin'::user_role,
    'society_president'::user_role, 
    'society_secretary'::user_role
  ])
);

-- Update society units table to link with user profiles
ALTER TABLE public.society_units 
ADD COLUMN IF NOT EXISTS primary_resident_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS secondary_residents jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS owner_details jsonb DEFAULT '{}'::jsonb;

-- Create a table for household members to support family management
CREATE TABLE IF NOT EXISTS public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.society_units(id) ON DELETE CASCADE,
  primary_resident_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name varchar NOT NULL,
  relationship varchar NOT NULL, -- 'spouse', 'child', 'parent', 'sibling', 'other'
  age integer,
  phone_number varchar,
  email varchar,
  is_emergency_contact boolean DEFAULT false,
  access_permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id)
);

-- Enable RLS on household_members
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for household_members
CREATE POLICY "Users can view household members in their organization" 
ON public.household_members 
FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Society admins can manage household members" 
ON public.household_members 
FOR ALL 
USING (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY (ARRAY[
    'platform_admin'::user_role, 
    'franchise_admin'::user_role, 
    'customer_admin'::user_role,
    'society_president'::user_role, 
    'society_secretary'::user_role
  ])
);

-- Add unit assignment tracking
CREATE TABLE IF NOT EXISTS public.unit_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.society_units(id) ON DELETE CASCADE,
  resident_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_type varchar NOT NULL DEFAULT 'owner', -- 'owner', 'tenant', 'family_member'
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_primary boolean DEFAULT false,
  move_in_date date,
  move_out_date date,
  status varchar DEFAULT 'active', -- 'active', 'inactive', 'terminated'
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  UNIQUE(unit_id, resident_id, assignment_type) -- Prevent duplicate assignments
);

-- Enable RLS on unit_assignments
ALTER TABLE public.unit_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for unit_assignments
CREATE POLICY "Users can view unit assignments in their organization" 
ON public.unit_assignments 
FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Society admins can manage unit assignments" 
ON public.unit_assignments 
FOR ALL 
USING (
  organization_id = get_user_organization_id() AND 
  get_user_role() = ANY (ARRAY[
    'platform_admin'::user_role, 
    'franchise_admin'::user_role, 
    'customer_admin'::user_role,
    'society_president'::user_role, 
    'society_secretary'::user_role
  ])
);

-- Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_household_members_updated_at ON public.household_members;
CREATE TRIGGER update_household_members_updated_at
  BEFORE UPDATE ON public.household_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_unit_assignments_updated_at ON public.unit_assignments;
CREATE TRIGGER update_unit_assignments_updated_at
  BEFORE UPDATE ON public.unit_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();