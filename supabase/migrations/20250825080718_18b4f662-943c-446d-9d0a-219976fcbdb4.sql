-- Create helper functions to manage themes and user preferences

-- Function to get custom themes
CREATE OR REPLACE FUNCTION public.get_custom_themes()
RETURNS TABLE(
  id uuid,
  name text,
  colors jsonb,
  dark_colors jsonb,
  created_by uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name, t.colors, t.dark_colors, t.created_by
  FROM themes t
  ORDER BY t.created_at DESC;
$$;

-- Function to get user theme preference
CREATE OR REPLACE FUNCTION public.get_user_theme_preference(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT theme_id FROM user_preferences WHERE user_preferences.user_id = $1;
$$;

-- Function to upsert user theme preference
CREATE OR REPLACE FUNCTION public.upsert_user_theme_preference(user_id uuid, theme_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO user_preferences (user_id, theme_id)
  VALUES ($1, $2)
  ON CONFLICT (user_id)
  DO UPDATE SET theme_id = $2, updated_at = now();
$$;

-- Function to create custom theme
CREATE OR REPLACE FUNCTION public.create_custom_theme(
  theme_name text,
  theme_colors jsonb,
  theme_dark_colors jsonb,
  creator_id uuid
)
RETURNS TABLE(
  id uuid,
  name text,
  colors jsonb,
  dark_colors jsonb,
  created_by uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO themes (name, colors, dark_colors, created_by)
  VALUES (theme_name, theme_colors, theme_dark_colors, creator_id)
  RETURNING themes.id, themes.name, themes.colors, themes.dark_colors, themes.created_by;
$$;

-- Function to delete custom theme
CREATE OR REPLACE FUNCTION public.delete_custom_theme(theme_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM themes WHERE id = theme_id;
$$;