-- Remove ALL problematic RLS policies that cause circular dependencies
DROP POLICY IF EXISTS "Franchise admins can view profiles in their organization tree" ON profiles;
DROP POLICY IF EXISTS "Platform admins can manage all profiles" ON profiles;

-- Create simple, direct policies only
DROP POLICY IF EXISTS "Admins can view all profiles in organization" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in organization" ON profiles;

-- Create simple admin policies that work
CREATE POLICY "Admins can view profiles in their org" 
ON profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  (organization_id = get_user_organization_id() AND is_admin_user())
);

CREATE POLICY "Admins can update profiles in their org" 
ON profiles 
FOR UPDATE 
USING (
  id = auth.uid() OR 
  (organization_id = get_user_organization_id() AND is_admin_user())
);

-- Create platform admin policy using security definer function
CREATE POLICY "Platform admins can manage all profiles" 
ON profiles 
FOR ALL 
USING (
  id = auth.uid() OR 
  get_user_role() = 'platform_admin'::user_role
);