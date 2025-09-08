-- PHASE 1: Foundation Enhancement - Enhanced User Role System and Core Tables (Fixed)

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