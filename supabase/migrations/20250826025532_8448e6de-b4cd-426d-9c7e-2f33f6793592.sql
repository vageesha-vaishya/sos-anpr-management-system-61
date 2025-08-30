-- Add user account management fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_from timestamp with time zone,
ADD COLUMN IF NOT EXISTS active_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret text,
ADD COLUMN IF NOT EXISTS preferred_2fa_method text DEFAULT 'email',
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS password_reset_token text,
ADD COLUMN IF NOT EXISTS password_reset_expires timestamp with time zone,
ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until timestamp with time zone;

-- Create user sessions table for 2FA tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  two_factor_verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  ip_address text,
  user_agent text
);

-- Enable RLS on user sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user sessions
CREATE POLICY "Users can manage their own sessions"
ON public.user_sessions
FOR ALL
USING (user_id = auth.uid());

-- Create function to check if user is active within date range
CREATE OR REPLACE FUNCTION public.is_user_active(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN p.active_from IS NOT NULL AND p.active_from > now() THEN false
      WHEN p.active_until IS NOT NULL AND p.active_until < now() THEN false
      WHEN p.account_locked_until IS NOT NULL AND p.account_locked_until > now() THEN false
      ELSE true
    END
  FROM profiles p
  WHERE p.id = user_id;
$$;

-- Create function to increment failed login attempts
CREATE OR REPLACE FUNCTION public.increment_failed_login(user_email text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE profiles 
  SET 
    failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
    account_locked_until = CASE 
      WHEN COALESCE(failed_login_attempts, 0) + 1 >= 5 
      THEN now() + interval '30 minutes'
      ELSE account_locked_until
    END
  WHERE email = user_email;
$$;

-- Create function to reset failed login attempts
CREATE OR REPLACE FUNCTION public.reset_failed_login(user_email text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE profiles 
  SET 
    failed_login_attempts = 0,
    account_locked_until = NULL
  WHERE email = user_email;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_active_dates ON profiles(active_from, active_until);
CREATE INDEX IF NOT EXISTS idx_profiles_2fa ON profiles(two_factor_enabled);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);