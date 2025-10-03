-- Add phone_number column to profiles table (the table currently has 'phone' column)
ALTER TABLE public.profiles 
ADD COLUMN phone_number character varying;