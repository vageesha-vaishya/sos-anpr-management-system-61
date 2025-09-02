-- First, let's check if we have organizations
INSERT INTO organizations (name, organization_type, contact_email, is_active) 
VALUES ('ADDA Platform', 'platform', 'admin@adda.com', true)
ON CONFLICT DO NOTHING;

-- Create the admin user profile (we'll need to manually create the auth user via Supabase dashboard)
-- For now, let's create a placeholder profile that will be linked when the user signs up
INSERT INTO profiles (id, email, full_name, role, organization_id, status, permissions)
SELECT 
  gen_random_uuid(),
  'bahuguna.vimal@gmail.com',
  'Vimal Bahuguna',
  'platform_admin',
  o.id,
  'active',
  ARRAY['*']
FROM organizations o 
WHERE o.organization_type = 'platform'
LIMIT 1
ON CONFLICT (email) DO NOTHING;