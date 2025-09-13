-- Add missing foreign key constraints for helpdesk_tickets table

-- Add foreign key constraint for created_by -> profiles.id
ALTER TABLE public.helpdesk_tickets 
ADD CONSTRAINT helpdesk_tickets_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Add foreign key constraint for assigned_to -> staff_members.id  
ALTER TABLE public.helpdesk_tickets 
ADD CONSTRAINT helpdesk_tickets_assigned_to_fkey 
FOREIGN KEY (assigned_to) 
REFERENCES public.staff_members(id) 
ON DELETE SET NULL;