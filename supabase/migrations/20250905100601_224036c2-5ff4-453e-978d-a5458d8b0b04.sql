-- Add admin-only RLS policies for geographical master data tables

-- Continents table policies
CREATE POLICY "Platform admins can insert continents" 
ON public.continents 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Platform admins can update continents" 
ON public.continents 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Platform admins can delete continents" 
ON public.continents 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

-- Countries table policies
CREATE POLICY "Platform admins can insert countries" 
ON public.countries 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Platform admins can update countries" 
ON public.countries 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Platform admins can delete countries" 
ON public.countries 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

-- States table policies
CREATE POLICY "Platform admins can insert states" 
ON public.states 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Platform admins can update states" 
ON public.states 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Platform admins can delete states" 
ON public.states 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

-- Cities table policies
CREATE POLICY "Platform admins can insert cities" 
ON public.cities 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Platform admins can update cities" 
ON public.cities 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

CREATE POLICY "Platform admins can delete cities" 
ON public.cities 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'platform_admin'
  )
);

-- Add unique constraints for data integrity
ALTER TABLE public.continents ADD CONSTRAINT unique_continent_code UNIQUE (code);
ALTER TABLE public.countries ADD CONSTRAINT unique_country_code UNIQUE (code);
ALTER TABLE public.states ADD CONSTRAINT unique_state_code_per_country UNIQUE (code, country_id);

-- Add proper foreign key constraints
ALTER TABLE public.countries ADD CONSTRAINT fk_countries_continent 
  FOREIGN KEY (continent_id) REFERENCES public.continents(id) ON DELETE RESTRICT;
  
ALTER TABLE public.states ADD CONSTRAINT fk_states_country 
  FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE RESTRICT;
  
ALTER TABLE public.cities ADD CONSTRAINT fk_cities_state 
  FOREIGN KEY (state_id) REFERENCES public.states(id) ON DELETE RESTRICT;