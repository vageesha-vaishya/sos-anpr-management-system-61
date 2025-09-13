-- Fix RLS policies for helpdesk_tickets table to allow proper access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Platform admins can manage all helpdesk tickets" ON public.helpdesk_tickets;
DROP POLICY IF EXISTS "Users can view helpdesk tickets in their organization" ON public.helpdesk_tickets;

-- Create comprehensive RLS policies for helpdesk_tickets

-- Allow users to view tickets they created
CREATE POLICY "Users can view their own tickets" 
ON public.helpdesk_tickets 
FOR SELECT 
USING (created_by = auth.uid());

-- Allow users to create tickets in their organization
CREATE POLICY "Users can create tickets in their organization" 
ON public.helpdesk_tickets 
FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id());

-- Allow users to update their own tickets
CREATE POLICY "Users can update their own tickets" 
ON public.helpdesk_tickets 
FOR UPDATE 
USING (created_by = auth.uid());

-- Allow admins to view all tickets in their organization
CREATE POLICY "Organization admins can view all tickets in their organization" 
ON public.helpdesk_tickets 
FOR SELECT 
USING (
  organization_id = get_user_organization_id() 
  AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'society_admin'::user_role, 'society_president'::user_role])
);

-- Allow admins to manage all tickets in their organization
CREATE POLICY "Organization admins can manage tickets in their organization" 
ON public.helpdesk_tickets 
FOR ALL 
USING (
  organization_id = get_user_organization_id() 
  AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'society_admin'::user_role, 'society_president'::user_role])
)
WITH CHECK (
  organization_id = get_user_organization_id() 
  AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'society_admin'::user_role, 'society_president'::user_role])
);

-- Allow staff to view and update tickets assigned to them
CREATE POLICY "Staff can view and update assigned tickets" 
ON public.helpdesk_tickets 
FOR ALL 
USING (
  assigned_to IN (
    SELECT id FROM staff_members 
    WHERE user_id = auth.uid() AND organization_id = get_user_organization_id()
  )
)
WITH CHECK (
  assigned_to IN (
    SELECT id FROM staff_members 
    WHERE user_id = auth.uid() AND organization_id = get_user_organization_id()
  )
);

-- Platform admins can manage everything
CREATE POLICY "Platform admins can manage all helpdesk tickets" 
ON public.helpdesk_tickets 
FOR ALL 
USING (get_user_role() = 'platform_admin'::user_role)
WITH CHECK (get_user_role() = 'platform_admin'::user_role);

-- Ensure staff_members table has proper RLS for joins
-- Check if policies exist and create if needed
DO $$ 
BEGIN
  -- Check if the policy already exists for staff_members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'staff_members' 
    AND policyname = 'Users can view staff in their organization'
  ) THEN
    CREATE POLICY "Users can view staff in their organization" 
    ON public.staff_members 
    FOR SELECT 
    USING (organization_id = get_user_organization_id());
  END IF;
END $$;