-- Fix RLS enabled but no policy warnings
-- These are for tables that have RLS enabled but may be missing policies

-- Check what tables need policies by looking at tables with RLS enabled
-- The warnings are likely for digital_id_cards and community_documents tables

-- Add missing policies for digital_id_cards
CREATE POLICY "Users can view their own digital id cards" 
ON digital_id_cards FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage digital id cards" 
ON digital_id_cards FOR ALL
USING (
  organization_id = get_user_organization_id() 
  AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

-- Add missing policies for community_documents
CREATE POLICY "Users can view community documents in their organization" 
ON community_documents FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage community documents" 
ON community_documents FOR ALL
USING (
  organization_id = get_user_organization_id() 
  AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);