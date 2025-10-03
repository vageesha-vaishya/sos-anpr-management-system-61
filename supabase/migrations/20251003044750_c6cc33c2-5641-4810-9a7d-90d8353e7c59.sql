-- Add 2FA related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN two_factor_enabled boolean DEFAULT false,
ADD COLUMN preferred_2fa_method character varying DEFAULT 'email';