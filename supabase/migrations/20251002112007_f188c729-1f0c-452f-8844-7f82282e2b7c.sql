-- Allow franchise and society admins to manage society units within their organization
-- This fixes updates (e.g., status changes) failing for non-platform admins due to missing RLS policies

-- Create a permissive policy that grants INSERT/UPDATE/DELETE/SELECT to specific roles
-- but only for units whose building belongs to the user's organization
CREATE POLICY "Society admins can manage society units"
ON public.society_units
AS PERMISSIVE
FOR ALL
TO public
USING (
  get_user_role() = ANY (ARRAY[
    'franchise_admin'::user_role,
    'customer_admin'::user_role,
    'society_president'::user_role,
    'society_secretary'::user_role
  ])
  AND building_id IN (
    SELECT b.id
    FROM public.buildings b
    JOIN public.locations l ON b.location_id = l.id
    WHERE l.organization_id = get_user_organization_id()
  )
)
WITH CHECK (
  get_user_role() = ANY (ARRAY[
    'franchise_admin'::user_role,
    'customer_admin'::user_role,
    'society_president'::user_role,
    'society_secretary'::user_role
  ])
  AND building_id IN (
    SELECT b.id
    FROM public.buildings b
    JOIN public.locations l ON b.location_id = l.id
    WHERE l.organization_id = get_user_organization_id()
  )
);
