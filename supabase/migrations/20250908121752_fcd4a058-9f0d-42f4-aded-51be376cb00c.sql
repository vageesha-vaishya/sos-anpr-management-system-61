-- Add platform admin policy for charge_categories table
CREATE POLICY "Platform admins can manage all charge categories" 
ON charge_categories FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);