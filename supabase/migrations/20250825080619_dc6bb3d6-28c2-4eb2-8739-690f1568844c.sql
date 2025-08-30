-- Create themes table for custom themes
CREATE TABLE public.themes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  colors jsonb NOT NULL,
  dark_colors jsonb,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_preferences table for storing user theme preferences
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  theme_id text NOT NULL DEFAULT 'default',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for themes table
CREATE POLICY "Platform admins can manage all themes" 
ON public.themes 
FOR ALL 
USING (get_user_role(auth.uid()) = 'platform_admin');

CREATE POLICY "Users can view themes from their organization or parents" 
ON public.themes 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = 'platform_admin' OR 
  created_by IN (
    SELECT profiles.id 
    FROM profiles 
    WHERE profiles.organization_id = get_user_organization(auth.uid()) 
    OR profiles.organization_id IN (
      SELECT organizations.id 
      FROM organizations 
      WHERE organizations.parent_id = get_user_organization(auth.uid())
    )
  )
);

-- Create policies for user_preferences table
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Platform admins can view all preferences" 
ON public.user_preferences 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'platform_admin');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();