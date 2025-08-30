-- Add platform admin CRUD policies for continents
CREATE POLICY "Platform admins can manage continents" 
ON public.continents 
FOR ALL 
USING (get_user_role(auth.uid()) = 'platform_admin');

-- Add platform admin CRUD policies for countries  
CREATE POLICY "Platform admins can manage countries" 
ON public.countries 
FOR ALL
USING (get_user_role(auth.uid()) = 'platform_admin');

-- Add platform admin CRUD policies for states
CREATE POLICY "Platform admins can manage states" 
ON public.states 
FOR ALL
USING (get_user_role(auth.uid()) = 'platform_admin');

-- Add platform admin CRUD policies for cities
CREATE POLICY "Platform admins can manage cities" 
ON public.cities 
FOR ALL
USING (get_user_role(auth.uid()) = 'platform_admin');