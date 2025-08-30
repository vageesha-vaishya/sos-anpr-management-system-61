-- Core Billing Infrastructure Tables

-- Billing Plans Configuration
CREATE TABLE public.billing_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL, -- 'anpr_franchise', 'society_management', 'advertiser'
    pricing_model TEXT NOT NULL, -- 'subscription', 'usage_based', 'hybrid', 'fixed'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pricing Tiers for flexible pricing models
CREATE TABLE public.pricing_tiers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES public.billing_plans(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    unit_price DECIMAL(10,2) NOT NULL,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Billing Customers (extends existing organizations but for billing-specific data)
CREATE TABLE public.billing_customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_type TEXT NOT NULL, -- 'franchise', 'society', 'advertiser'
    billing_name TEXT NOT NULL,
    billing_address JSONB NOT NULL,
    tax_info JSONB DEFAULT '{}',
    payment_terms INTEGER DEFAULT 30, -- days
    credit_limit DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer Subscriptions
CREATE TABLE public.customer_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.billing_customers(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.billing_plans(id),
    subscription_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annually'
    next_billing_date DATE,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    auto_renew BOOLEAN DEFAULT true,
    proration_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices
CREATE TABLE public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.billing_customers(id),
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    outstanding_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    billing_period_start DATE,
    billing_period_end DATE,
    currency TEXT NOT NULL DEFAULT 'USD',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoice Line Items
CREATE TABLE public.invoice_line_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL, -- 'anpr_subscription', 'camera_fee', 'maintenance', 'advertising'
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.billing_customers(id),
    invoice_id UUID REFERENCES public.invoices(id),
    payment_number TEXT NOT NULL UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL, -- 'credit_card', 'bank_transfer', 'check', 'cash', 'online'
    payment_gateway TEXT, -- 'stripe', 'razorpay', 'manual'
    gateway_transaction_id TEXT,
    gateway_fee DECIMAL(8,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    notes TEXT,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ANPR Usage Tracking (for usage-based billing)
CREATE TABLE public.anpr_usage_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.billing_customers(id),
    camera_id UUID REFERENCES public.cameras(id),
    location_id UUID REFERENCES public.locations(id),
    detection_count INTEGER NOT NULL DEFAULT 0,
    storage_used_gb DECIMAL(10,3) NOT NULL DEFAULT 0,
    bandwidth_used_gb DECIMAL(10,3) NOT NULL DEFAULT 0,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment Methods
CREATE TABLE public.payment_methods (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.billing_customers(id),
    method_type TEXT NOT NULL, -- 'credit_card', 'bank_account', 'wallet'
    gateway_customer_id TEXT,
    gateway_payment_method_id TEXT,
    card_last_four TEXT,
    card_brand TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    bank_name TEXT,
    account_last_four TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anpr_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing tables
CREATE POLICY "Billing plans access by organization" ON public.billing_plans
FOR ALL USING (
    get_user_role(auth.uid()) = 'platform_admin' OR
    organization_id = get_user_organization(auth.uid()) OR
    organization_id IN (
        SELECT id FROM organizations 
        WHERE parent_id = get_user_organization(auth.uid())
    )
);

CREATE POLICY "Pricing tiers via plan access" ON public.pricing_tiers
FOR ALL USING (
    plan_id IN (
        SELECT id FROM billing_plans 
        WHERE get_user_role(auth.uid()) = 'platform_admin' OR
        organization_id = get_user_organization(auth.uid()) OR
        organization_id IN (
            SELECT id FROM organizations 
            WHERE parent_id = get_user_organization(auth.uid())
        )
    )
);

CREATE POLICY "Billing customers access by organization" ON public.billing_customers
FOR ALL USING (
    get_user_role(auth.uid()) = 'platform_admin' OR
    organization_id = get_user_organization(auth.uid()) OR
    organization_id IN (
        SELECT id FROM organizations 
        WHERE parent_id = get_user_organization(auth.uid())
    )
);

CREATE POLICY "Customer subscriptions via customer access" ON public.customer_subscriptions
FOR ALL USING (
    customer_id IN (
        SELECT id FROM billing_customers 
        WHERE get_user_role(auth.uid()) = 'platform_admin' OR
        organization_id = get_user_organization(auth.uid()) OR
        organization_id IN (
            SELECT id FROM organizations 
            WHERE parent_id = get_user_organization(auth.uid())
        )
    )
);

CREATE POLICY "Invoices via customer access" ON public.invoices
FOR ALL USING (
    customer_id IN (
        SELECT id FROM billing_customers 
        WHERE get_user_role(auth.uid()) = 'platform_admin' OR
        organization_id = get_user_organization(auth.uid()) OR
        organization_id IN (
            SELECT id FROM organizations 
            WHERE parent_id = get_user_organization(auth.uid())
        )
    )
);

CREATE POLICY "Invoice line items via invoice access" ON public.invoice_line_items
FOR ALL USING (
    invoice_id IN (
        SELECT i.id FROM invoices i 
        JOIN billing_customers bc ON i.customer_id = bc.id
        WHERE get_user_role(auth.uid()) = 'platform_admin' OR
        bc.organization_id = get_user_organization(auth.uid()) OR
        bc.organization_id IN (
            SELECT id FROM organizations 
            WHERE parent_id = get_user_organization(auth.uid())
        )
    )
);

CREATE POLICY "Payments via customer access" ON public.payments
FOR ALL USING (
    customer_id IN (
        SELECT id FROM billing_customers 
        WHERE get_user_role(auth.uid()) = 'platform_admin' OR
        organization_id = get_user_organization(auth.uid()) OR
        organization_id IN (
            SELECT id FROM organizations 
            WHERE parent_id = get_user_organization(auth.uid())
        )
    )
);

CREATE POLICY "ANPR usage via customer access" ON public.anpr_usage_logs
FOR ALL USING (
    customer_id IN (
        SELECT id FROM billing_customers 
        WHERE get_user_role(auth.uid()) = 'platform_admin' OR
        organization_id = get_user_organization(auth.uid()) OR
        organization_id IN (
            SELECT id FROM organizations 
            WHERE parent_id = get_user_organization(auth.uid())
        )
    )
);

CREATE POLICY "Payment methods via customer access" ON public.payment_methods
FOR ALL USING (
    customer_id IN (
        SELECT id FROM billing_customers 
        WHERE get_user_role(auth.uid()) = 'platform_admin' OR
        organization_id = get_user_organization(auth.uid()) OR
        organization_id IN (
            SELECT id FROM organizations 
            WHERE parent_id = get_user_organization(auth.uid())
        )
    )
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_billing_plans_updated_at
    BEFORE UPDATE ON public.billing_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_customers_updated_at
    BEFORE UPDATE ON public.billing_customers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_subscriptions_updated_at
    BEFORE UPDATE ON public.customer_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number() 
RETURNS TEXT AS $$
DECLARE
    invoice_num TEXT;
    year_str TEXT;
    next_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 'INV-' || year_str || '-(.*)') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM invoices 
    WHERE invoice_number LIKE 'INV-' || year_str || '-%';
    
    invoice_num := 'INV-' || year_str || '-' || LPAD(next_num::TEXT, 6, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Generate unique payment numbers
CREATE OR REPLACE FUNCTION generate_payment_number() 
RETURNS TEXT AS $$
DECLARE
    payment_num TEXT;
    year_str TEXT;
    next_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(payment_number FROM 'PAY-' || year_str || '-(.*)') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM payments 
    WHERE payment_number LIKE 'PAY-' || year_str || '-%';
    
    payment_num := 'PAY-' || year_str || '-' || LPAD(next_num::TEXT, 6, '0');
    
    RETURN payment_num;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- Auto-generate payment numbers
CREATE OR REPLACE FUNCTION set_payment_number() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := generate_payment_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_number_trigger
    BEFORE INSERT ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION set_payment_number();