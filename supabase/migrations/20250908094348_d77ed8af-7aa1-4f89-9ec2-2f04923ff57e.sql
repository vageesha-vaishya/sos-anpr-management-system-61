-- PHASE 1: Foundation Enhancement - New Table RLS Policies Only

-- Create RLS policies only for the new tables we created

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

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_permissions_updated_at BEFORE UPDATE ON user_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chart_of_accounts_enhanced_updated_at BEFORE UPDATE ON chart_of_accounts_enhanced FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_billing_updated_at BEFORE UPDATE ON maintenance_billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_society_notices_updated_at BEFORE UPDATE ON society_notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_channels_updated_at BEFORE UPDATE ON communication_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_queue_updated_at BEFORE UPDATE ON message_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_permissions_user_org ON user_permissions(user_id, organization_id);
CREATE INDEX idx_financial_transactions_org_date ON financial_transactions(organization_id, transaction_date);
CREATE INDEX idx_maintenance_billing_org_period ON maintenance_billing(organization_id, billing_period);
CREATE INDEX idx_society_notices_org_status ON society_notices(organization_id, status);
CREATE INDEX idx_message_queue_status_scheduled ON message_queue(status, scheduled_at);
CREATE INDEX idx_dashboard_metrics_org_type_date ON dashboard_metrics(organization_id, metric_type, calculation_date);
CREATE INDEX idx_user_activity_logs_org_user ON user_activity_logs(organization_id, user_id, created_at);