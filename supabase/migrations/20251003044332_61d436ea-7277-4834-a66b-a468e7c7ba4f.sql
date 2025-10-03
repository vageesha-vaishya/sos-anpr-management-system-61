-- Add active_from and active_until columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN active_from timestamp with time zone,
ADD COLUMN active_until timestamp with time zone;