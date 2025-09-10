-- Add password management fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS requires_password_change boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_password_change timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS password_changed_by_admin uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS admin_set_password boolean DEFAULT false;

-- Create password change audit table for comprehensive logging
CREATE TABLE IF NOT EXISTS public.password_change_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type character varying NOT NULL CHECK (action_type IN ('reset_link', 'temporary_password', 'permanent_password')),
  ip_address inet,
  user_agent text,
  organization_id uuid REFERENCES public.organizations(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on the audit table
ALTER TABLE public.password_change_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for password change audit
CREATE POLICY "Platform admins can manage all password audit logs"
ON public.password_change_audit
FOR ALL
TO authenticated
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Admins can view password audit logs in their organization"
ON public.password_change_audit
FOR SELECT
TO authenticated
USING (
  organization_id = get_user_organization_id() 
  AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_audit_user_id ON public.password_change_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_password_audit_admin_id ON public.password_change_audit(admin_id);
CREATE INDEX IF NOT EXISTS idx_password_audit_created_at ON public.password_change_audit(created_at);

-- Create function to check if user can manage passwords
CREATE OR REPLACE FUNCTION public.can_manage_user_passwords()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'society_president'::user_role])
  );
$function$;