-- Update bahuguna.vimal@gmail.com to platform_admin role
UPDATE profiles 
SET 
  role = 'platform_admin',
  permissions = ARRAY['all']
WHERE email = 'bahuguna.vimal@gmail.com';