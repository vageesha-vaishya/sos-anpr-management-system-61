-- Fix function search path security issues
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.get_user_organization(UUID);
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create security definer function to get user role with proper search path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to get user organization with proper search path
CREATE OR REPLACE FUNCTION public.get_user_organization(user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create trigger function to automatically create profile on signup with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, organization_id, email, full_name, role)
  VALUES (
    NEW.id,
    '00000000-0000-0000-0000-000000000001', -- Default to platform organization
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'customer_user' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on remaining tables that were missed
ALTER TABLE continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for location hierarchy tables (these can be public read-only)
CREATE POLICY "Anyone can read continents" ON continents FOR SELECT USING (true);
CREATE POLICY "Anyone can read countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Anyone can read states" ON states FOR SELECT USING (true);
CREATE POLICY "Anyone can read cities" ON cities FOR SELECT USING (true);

-- Only platform admins can modify location hierarchy
CREATE POLICY "Platform admins can modify continents" ON continents
  FOR ALL USING (public.get_user_role(auth.uid()) = 'platform_admin');

CREATE POLICY "Platform admins can modify countries" ON countries
  FOR ALL USING (public.get_user_role(auth.uid()) = 'platform_admin');

CREATE POLICY "Platform admins can modify states" ON states
  FOR ALL USING (public.get_user_role(auth.uid()) = 'platform_admin');

CREATE POLICY "Platform admins can modify cities" ON cities
  FOR ALL USING (public.get_user_role(auth.uid()) = 'platform_admin');