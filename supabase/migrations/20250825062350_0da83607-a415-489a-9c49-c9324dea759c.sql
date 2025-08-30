-- Fix the admin user profile role and details
UPDATE profiles 
SET 
  role = 'platform_admin',
  full_name = 'ANPR Admin',
  permissions = ARRAY['all']
WHERE email = 'admin@anpr.com';