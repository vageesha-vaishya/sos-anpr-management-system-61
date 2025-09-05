-- Fix circular dependency in profiles RLS policies - Create secure admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a secure function to check admin status without circular dependencies
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
  );
$$;

-- Create secure admin policies that prevent circular dependency
CREATE POLICY "Admins can view all profiles in organization" 
ON profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  (is_admin_user() AND organization_id = get_user_organization_id())
);

CREATE POLICY "Admins can update profiles in organization" 
ON profiles 
FOR UPDATE 
USING (
  id = auth.uid() OR 
  (is_admin_user() AND organization_id = get_user_organization_id())
);

-- Add audit logging for role changes
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_role user_role,
  new_role user_role NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamp with time zone DEFAULT now(),
  reason text
);

ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role change audit" 
ON role_change_audit 
FOR SELECT 
USING (is_admin_user());