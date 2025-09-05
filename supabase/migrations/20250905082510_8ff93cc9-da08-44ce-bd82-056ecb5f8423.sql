-- Fix circular dependency in profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create simple, direct policies that don't depend on helper functions
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
USING (id = auth.uid());

-- Keep admin policies but make them work without circular dependencies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" 
ON profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
  )
);