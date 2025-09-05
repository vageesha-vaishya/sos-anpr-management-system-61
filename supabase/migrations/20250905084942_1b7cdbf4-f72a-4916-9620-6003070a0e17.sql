-- Drop the problematic platform admin policy with circular dependency
DROP POLICY IF EXISTS "Platform admins can manage all profiles" ON profiles;

-- Create a proper platform admin policy using security definer function
CREATE POLICY "Platform admins can manage all profiles" 
ON profiles 
FOR ALL 
USING (
  id = auth.uid() OR 
  get_user_role() = 'platform_admin'::user_role
);