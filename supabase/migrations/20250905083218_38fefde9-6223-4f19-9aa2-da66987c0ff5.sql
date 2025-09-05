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

-- Add role change protection - only platform admins can change roles
CREATE POLICY "Only platform admins can change roles" 
ON profiles 
FOR UPDATE 
USING (
  CASE 
    WHEN OLD.role IS DISTINCT FROM NEW.role THEN
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'platform_admin'::user_role)
    ELSE true
  END
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

-- Create trigger for role change auditing
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO role_change_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.id, OLD.role, NEW.role, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER role_change_audit_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_role_changes();