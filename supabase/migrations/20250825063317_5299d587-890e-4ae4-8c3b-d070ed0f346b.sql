-- Create admin user in auth.users if not exists
-- First, let's insert the admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@anpr.com',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "ANPR Admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Admin@123', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now();

-- Ensure the admin user profile exists with correct details
INSERT INTO public.profiles (
  id,
  organization_id,
  email,
  full_name,
  role,
  permissions,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@anpr.com',
  'ANPR Admin',
  'platform_admin',
  ARRAY['all'],
  'active'
) ON CONFLICT (id) DO UPDATE SET
  role = 'platform_admin',
  full_name = 'ANPR Admin',
  permissions = ARRAY['all'],
  status = 'active';