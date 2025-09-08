-- PHASE 1: Foundation Enhancement - Complete RLS Policies

-- Recreate all comprehensive RLS policies for existing and new tables

-- 1. User Permissions
CREATE POLICY "Admins can manage user permissions" ON user_permissions
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role]));

CREATE POLICY "Users can view their own permissions" ON user_permissions
    FOR SELECT USING (user_id = auth.uid());

-- 2. Chart of Accounts Enhanced
CREATE POLICY "Financial admins can manage chart of accounts" ON chart_of_accounts_enhanced
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role]));

CREATE POLICY "Users can view chart of accounts" ON chart_of_accounts_enhanced
    FOR SELECT USING (organization_id = get_user_organization_id());

-- 3. Financial Transactions
CREATE POLICY "Financial admins can manage transactions" ON financial_transactions
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role]));

CREATE POLICY "Users can view approved transactions" ON financial_transactions
    FOR SELECT USING (organization_id = get_user_organization_id() AND status = 'posted');

-- 4. Transaction Line Items
CREATE POLICY "Financial admins can manage line items" ON transaction_line_items
    FOR ALL USING (transaction_id IN (SELECT id FROM financial_transactions WHERE organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role])));

CREATE POLICY "Users can view line items" ON transaction_line_items
    FOR SELECT USING (transaction_id IN (SELECT id FROM financial_transactions WHERE organization_id = get_user_organization_id()));

-- 5. Maintenance Billing
CREATE POLICY "Admins can manage maintenance billing" ON maintenance_billing
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role, 'society_secretary'::user_role]));

CREATE POLICY "Residents can view their bills" ON maintenance_billing
    FOR SELECT USING (organization_id = get_user_organization_id() AND (resident_id = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role, 'society_secretary'::user_role])));

-- 6. Society Notices
CREATE POLICY "Admins can manage notices" ON society_notices
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role, 'committee_member'::user_role]));

CREATE POLICY "Users can view published notices" ON society_notices
    FOR SELECT USING (organization_id = get_user_organization_id() AND status = 'published' AND (expires_at IS NULL OR expires_at > now()));

-- 7. Notice Read Receipts
CREATE POLICY "Users can manage their read receipts" ON notice_read_receipts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all read receipts" ON notice_read_receipts
    FOR SELECT USING (notice_id IN (SELECT id FROM society_notices WHERE organization_id = get_user_organization_id()) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role]));

-- 8. Communication Channels
CREATE POLICY "Admins can manage communication channels" ON communication_channels
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role]));

CREATE POLICY "Users can view communication channels" ON communication_channels
    FOR SELECT USING (organization_id = get_user_organization_id());

-- 9. Message Queue
CREATE POLICY "Admins can manage message queue" ON message_queue
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role]));

CREATE POLICY "Users can view their messages" ON message_queue
    FOR SELECT USING (recipient_id = auth.uid());

-- 10. Dashboard Metrics
CREATE POLICY "Users can view dashboard metrics" ON dashboard_metrics
    FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage dashboard metrics" ON dashboard_metrics
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'treasurer'::user_role]));

-- 11. User Activity Logs
CREATE POLICY "Admins can view activity logs" ON user_activity_logs
    FOR SELECT USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role]));

CREATE POLICY "Users can view their own activity" ON user_activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- Recreate all previously existing policies for other tables

-- Access Cards
CREATE POLICY "Admins can manage access cards in their organization" ON access_cards
    FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'security_staff'::user_role, 'property_manager'::user_role])));

CREATE POLICY "Users can view access cards in their organization" ON access_cards
    FOR SELECT USING (organization_id = get_user_organization_id());

-- Advertisement Campaigns
CREATE POLICY "Admins can manage advertisement campaigns in their organization" ON advertisement_campaigns
    FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])));

CREATE POLICY "Users can view advertisement campaigns in their organization" ON advertisement_campaigns
    FOR SELECT USING (organization_id = get_user_organization_id());

-- Alerts
CREATE POLICY "Admins can manage alerts in their organization" ON alerts
    FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'operator'::user_role, 'security_staff'::user_role, 'property_manager'::user_role])));

CREATE POLICY "Users can view alerts in their organization" ON alerts
    FOR SELECT USING (organization_id = get_user_organization_id());

-- Continue with remaining tables...
-- AMC Contracts
CREATE POLICY "Admins can manage AMC contracts in their organization" ON amc_contracts
    FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'property_manager'::user_role])));

CREATE POLICY "Users can view AMC contracts in their organization" ON amc_contracts
    FOR SELECT USING (organization_id = get_user_organization_id());

-- Amenities  
CREATE POLICY "Admins can manage amenities in their organization" ON amenities
    FOR ALL USING ((building_id IN ( SELECT b.id FROM (buildings b JOIN locations l ON ((b.location_id = l.id))) WHERE (l.organization_id = get_user_organization_id()))) AND (get_user_role() = ANY (ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'property_manager'::user_role])));

CREATE POLICY "Users can view amenities in their organization" ON amenities
    FOR SELECT USING (building_id IN ( SELECT b.id FROM (buildings b JOIN locations l ON ((b.location_id = l.id))) WHERE (l.organization_id = get_user_organization_id())));

-- Announcements
CREATE POLICY "Admins can manage announcements in their organization" ON announcements
    FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role])));

CREATE POLICY "Users can view announcements in their organization" ON announcements
    FOR SELECT USING (organization_id = get_user_organization_id());

-- ANPR Detections
CREATE POLICY "Admins can manage ANPR detections in their organization" ON anpr_detections
    FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'security_staff'::user_role])));

CREATE POLICY "Users can view ANPR detections in their organization" ON anpr_detections
    FOR SELECT USING (organization_id = get_user_organization_id());

-- Badge Templates
CREATE POLICY "Admins can manage badge templates in their organization" ON badge_templates
    FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'security_staff'::user_role])));

CREATE POLICY "Users can view badge templates in their organization" ON badge_templates
    FOR SELECT USING (organization_id = get_user_organization_id());