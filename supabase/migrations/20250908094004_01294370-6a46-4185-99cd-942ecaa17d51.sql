-- PHASE 1: Foundation Enhancement - Role System Fix (Step 2: Update role type)

-- 1. Enhanced User Role System - Expand to 10 specialized roles
DO $$ BEGIN
    CREATE TYPE user_role_new AS ENUM (
        'platform_admin',
        'franchise_admin', 
        'society_president',
        'society_secretary',
        'treasurer',
        'property_manager',
        'security_staff',
        'maintenance_staff',
        'committee_member',
        'customer_admin',
        'operator',
        'resident',
        'tenant'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Safely update profiles table role column
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING 
    CASE 
        WHEN role::text = 'platform_admin' THEN 'platform_admin'::user_role_new
        WHEN role::text = 'franchise_admin' THEN 'franchise_admin'::user_role_new  
        WHEN role::text = 'customer_admin' THEN 'customer_admin'::user_role_new
        WHEN role::text = 'operator' THEN 'operator'::user_role_new
        WHEN role::text = 'resident' THEN 'resident'::user_role_new
        ELSE 'resident'::user_role_new
    END;

-- Drop old type and rename new one
DROP TYPE IF EXISTS user_role CASCADE;
ALTER TYPE user_role_new RENAME TO user_role;

-- Reset default for role column
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'resident'::user_role;

-- Update get_user_role function to handle new roles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM profiles WHERE id = auth.uid();
$function$;

-- Recreate the dropped policies with updated role references
CREATE POLICY "Platform admins can insert continents" ON continents
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform admins can update continents" ON continents
    FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform admins can delete continents" ON continents
    FOR DELETE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform admins can insert countries" ON countries
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform admins can update countries" ON countries
    FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform admins can delete countries" ON countries
    FOR DELETE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform admins can insert cities" ON cities
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform admins can update cities" ON cities
    FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform admins can delete cities" ON cities
    FOR DELETE 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform Admins can Select buildings" ON buildings
    FOR SELECT 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));

CREATE POLICY "Platform Admins can manage buildings" ON buildings
    FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'platform_admin'::user_role));