-- PHASE 1: Foundation Enhancement - Enhanced User Role System and Core Tables

-- 1. Enhanced User Role System - Expand to 10 specialized roles
DO $$ BEGIN
    CREATE TYPE user_role_new AS ENUM (
        'platform_admin',
        'franchise_admin', 
        'society_president',
        'society_secretary',
        'treasurer',
        'property_manager',
        'security_staff',
        'maintenance_staff',
        'committee_member',
        'customer_admin',
        'operator',
        'resident',
        'tenant'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to use new role enum
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;
DROP TYPE IF EXISTS user_role CASCADE;
ALTER TYPE user_role_new RENAME TO user_role;

-- 2. Advanced Permission System
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    module VARCHAR NOT NULL, -- 'financial', 'maintenance', 'security', etc.
    action VARCHAR NOT NULL, -- 'create', 'read', 'update', 'delete', 'approve'
    resource VARCHAR, -- specific resource or '*' for all
    conditions JSONB DEFAULT '{}', -- additional conditions
    granted_by UUID REFERENCES profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, module, action, resource)
);

-- 3. Financial Management - Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'income', 'expense'
    account_category VARCHAR(100), -- 'current_asset', 'fixed_asset', etc.
    parent_account_id UUID REFERENCES chart_of_accounts_enhanced(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Financial Transactions (Double Entry)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'maintenance_fee', 'expense', 'income', 'transfer'
    reference_type VARCHAR(50), -- 'invoice', 'payment', 'journal'
    reference_id UUID,
    description TEXT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'posted', 'cancelled'
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES profiles(id),
    posted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Transaction Line Items (Double Entry Details)
CREATE TABLE IF NOT EXISTS transaction_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES financial_transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts_enhanced(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Enhanced Maintenance Charges
CREATE TABLE IF NOT EXISTS maintenance_billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    billing_period VARCHAR(20) NOT NULL, -- 'YYYY-MM' format
    unit_id UUID REFERENCES society_units(id),
    resident_id UUID REFERENCES profiles(id),
    base_maintenance DECIMAL(10,2) NOT NULL,
    additional_charges JSONB DEFAULT '{}', -- {parking: 500, generator: 200}
    penalties DECIMAL(10,2) DEFAULT 0,
    late_fees DECIMAL(10,2) DEFAULT 0,
    adjustments DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'overdue'
    paid_amount DECIMAL(10,2) DEFAULT 0,
    paid_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Communication System - Notices and Announcements
CREATE TABLE IF NOT EXISTS society_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    notice_type VARCHAR(50) NOT NULL, -- 'general', 'emergency', 'meeting', 'maintenance', 'financial'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'residents', 'owners', 'tenants', 'committee'
    target_roles TEXT[], -- specific roles to target
    target_buildings UUID[], -- specific buildings
    target_units UUID[], -- specific units
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    attachment_urls TEXT[],
    read_receipt_required BOOLEAN DEFAULT false,
    emergency_alert BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending_approval', 'published', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Notice Read Receipts
CREATE TABLE IF NOT EXISTS notice_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID REFERENCES society_notices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(notice_id, user_id)
);

-- 9. Communication Channels
CREATE TABLE IF NOT EXISTS communication_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    channel_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'whatsapp'
    channel_name VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL, -- provider config, API keys, etc.
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Message Queue for Multi-channel Communication
CREATE TABLE IF NOT EXISTS message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id),
    channel_type VARCHAR(50) NOT NULL,
    recipient_address VARCHAR(255) NOT NULL, -- email, phone, device_token
    subject VARCHAR(255),
    message_content TEXT NOT NULL,
    template_name VARCHAR(100),
    template_variables JSONB,
    priority INTEGER DEFAULT 1,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status VARCHAR(20) DEFAULT 'queued', -- 'queued', 'sending', 'sent', 'failed', 'retrying'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20), -- 'delivered', 'bounced', 'opened', 'clicked'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    reference_type VARCHAR(50), -- 'notice', 'bill', 'alert'
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Enhanced Dashboard Analytics
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- 'financial', 'maintenance', 'occupancy', 'community'
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    metric_data JSONB, -- complex metric data
    calculation_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(organization_id, metric_type, metric_name, calculation_date, period_type)
);

-- 12. User Activity Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
-- User Permissions
CREATE POLICY "Admins can manage user permissions" ON user_permissions
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role]));

CREATE POLICY "Users can view their own permissions" ON user_permissions
    FOR SELECT USING (user_id = auth.uid());

-- Chart of Accounts Enhanced
CREATE POLICY "Admins can manage chart of accounts" ON chart_of_accounts_enhanced
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role]));

CREATE POLICY "Users can view chart of accounts" ON chart_of_accounts_enhanced
    FOR SELECT USING (organization_id = get_user_organization_id());

-- Financial Transactions
CREATE POLICY "Financial admins can manage transactions" ON financial_transactions
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role]));

CREATE POLICY "Users can view approved transactions" ON financial_transactions
    FOR SELECT USING (organization_id = get_user_organization_id() AND status = 'posted');

-- Transaction Line Items
CREATE POLICY "Financial admins can manage line items" ON transaction_line_items
    FOR ALL USING (transaction_id IN (SELECT id FROM financial_transactions WHERE organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role])));

CREATE POLICY "Users can view line items" ON transaction_line_items
    FOR SELECT USING (transaction_id IN (SELECT id FROM financial_transactions WHERE organization_id = get_user_organization_id()));

-- Maintenance Billing
CREATE POLICY "Admins can manage maintenance billing" ON maintenance_billing
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role, 'society_secretary'::user_role]));

CREATE POLICY "Residents can view their bills" ON maintenance_billing
    FOR SELECT USING (organization_id = get_user_organization_id() AND (resident_id = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'treasurer'::user_role, 'society_president'::user_role, 'society_secretary'::user_role])));

-- Society Notices
CREATE POLICY "Admins can manage notices" ON society_notices
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role, 'committee_member'::user_role]));

CREATE POLICY "Users can view published notices" ON society_notices
    FOR SELECT USING (organization_id = get_user_organization_id() AND status = 'published' AND (expires_at IS NULL OR expires_at > now()));

-- Notice Read Receipts
CREATE POLICY "Users can manage their read receipts" ON notice_read_receipts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all read receipts" ON notice_read_receipts
    FOR SELECT USING (notice_id IN (SELECT id FROM society_notices WHERE organization_id = get_user_organization_id()) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role]));

-- Communication Channels
CREATE POLICY "Admins can manage communication channels" ON communication_channels
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role]));

-- Message Queue
CREATE POLICY "Admins can view message queue" ON message_queue
    FOR SELECT USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'society_secretary'::user_role]));

CREATE POLICY "Users can view their messages" ON message_queue
    FOR SELECT USING (recipient_id = auth.uid());

-- Dashboard Metrics
CREATE POLICY "Users can view dashboard metrics" ON dashboard_metrics
    FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage dashboard metrics" ON dashboard_metrics
    FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role, 'treasurer'::user_role]));

-- User Activity Logs
CREATE POLICY "Admins can view activity logs" ON user_activity_logs
    FOR SELECT USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'society_president'::user_role]));

CREATE POLICY "Users can view their own activity" ON user_activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
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