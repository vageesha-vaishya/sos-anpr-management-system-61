-- First ensure we have a platform organization
DO $$
DECLARE
  platform_org_id uuid;
BEGIN
  -- Check if platform organization exists
  SELECT id INTO platform_org_id 
  FROM organizations 
  WHERE organization_type = 'platform' 
  LIMIT 1;
  
  -- If not found, create it
  IF platform_org_id IS NULL THEN
    INSERT INTO organizations (name, organization_type, contact_email, is_active) 
    VALUES ('ADDA Platform', 'platform', 'admin@adda.com', true);
  END IF;
END $$;

-- Update the trigger function to handle user creation
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

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();