-- Add foreign key constraint between hosts and profiles
ALTER TABLE public.hosts 
ADD CONSTRAINT fk_hosts_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;