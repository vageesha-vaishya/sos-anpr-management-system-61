-- Create platform organization if it doesn't exist
INSERT INTO organizations (name, organization_type, contact_email, is_active) 
VALUES ('ADDA Platform', 'platform', 'admin@adda.com', true)
ON CONFLICT (name) DO NOTHING;

-- Create the admin user trigger that will automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  platform_org_id uuid;
BEGIN
  -- Get platform organization ID
  SELECT id INTO platform_org_id 
  FROM organizations 
  WHERE organization_type = 'platform' 
  LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, role, organization_id, status, permissions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'bahuguna.vimal@gmail.com' THEN 'platform_admin'::user_role
      ELSE 'resident'::user_role
    END,
    CASE 
      WHEN NEW.email = 'bahuguna.vimal@gmail.com' THEN platform_org_id
      ELSE NULL
    END,
    'active'::user_status,
    CASE 
      WHEN NEW.email = 'bahuguna.vimal@gmail.com' THEN ARRAY['*']
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();