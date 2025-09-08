-- PHASE 1: Foundation Enhancement - Complete Implementation

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

-- Safely update profiles table role column
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING 
    CASE 
        WHEN role::text = 'platform_admin' THEN 'platform_admin'::user_role_new
        WHEN role::text = 'franchise_admin' THEN 'franchise_admin'::user_role_new  
        WHEN role::text = 'customer_admin' THEN 'customer_admin'::user_role_new
        WHEN role::text = 'operator' THEN 'operator'::user_role_new
        WHEN role::text = 'resident' THEN 'resident'::user_role_new
        ELSE 'resident'::user_role_new
    END;

-- Drop old type and rename new one
DROP TYPE IF EXISTS user_role CASCADE;
ALTER TYPE user_role_new RENAME TO user_role;

-- Reset default for role column
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'resident'::user_role;

-- Update get_user_role function to handle new roles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM profiles WHERE id = auth.uid();
$function$;

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

-- 3. Financial Management - Enhanced Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'income', 'expense'
    account_category VARCHAR(100), -- 'current_asset', 'fixed_asset', etc.
    parent_account_id UUID REFERENCES chart_of_accounts_enhanced(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(organization_id, account_code)
);

-- 4. Financial Transactions (Double Entry)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_number VARCHAR(50) NOT NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(organization_id, transaction_number)
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

-- 6. Enhanced Maintenance Billing
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

-- 7. Communication System - Enhanced Notices
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