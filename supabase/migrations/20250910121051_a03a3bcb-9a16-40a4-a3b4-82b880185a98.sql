-- Add email verification tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;

-- Create a function to sync email verification status from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_user_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles table when auth.users email verification changes
  UPDATE public.profiles 
  SET 
    email_confirmed_at = NEW.email_confirmed_at,
    confirmed_at = NEW.confirmed_at,
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically sync email verification status
CREATE TRIGGER sync_email_verification_trigger
  AFTER UPDATE OF email_confirmed_at, confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_email_verification();

-- Initial sync of existing data from auth.users to profiles
UPDATE public.profiles 
SET 
  email_confirmed_at = auth_users.email_confirmed_at,
  confirmed_at = auth_users.confirmed_at,
  updated_at = now()
FROM auth.users as auth_users
WHERE profiles.id = auth_users.id;