-- Phase 1: Financial Accounting Module Database Enhancement (Fixed)

-- Society Management Tables
CREATE TABLE public.society_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('residential', 'commercial', 'parking')),
  owner_name TEXT,
  tenant_name TEXT,
  area_sqft NUMERIC NOT NULL DEFAULT 0,
  monthly_rate_per_sqft NUMERIC NOT NULL DEFAULT 0,
  monthly_flat_rate NUMERIC NOT NULL DEFAULT 0,
  parking_slots INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'occupied' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL,
  charge_type TEXT NOT NULL CHECK (charge_type IN ('maintenance', 'utility', 'amenity', 'parking', 'penalty', 'special_assessment')),
  amount NUMERIC NOT NULL,
  billing_month DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.utility_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL,
  utility_type TEXT NOT NULL CHECK (utility_type IN ('electricity', 'water', 'gas', 'internet')),
  previous_reading NUMERIC NOT NULL DEFAULT 0,
  current_reading NUMERIC NOT NULL DEFAULT 0,
  consumption NUMERIC GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  rate_per_unit NUMERIC NOT NULL,
  billing_month DATE NOT NULL,
  reading_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.amenity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL,
  amenity_type TEXT NOT NULL CHECK (amenity_type IN ('gym', 'pool', 'clubhouse', 'hall', 'court', 'playground')),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  total_charges NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Advertiser Billing Tables
CREATE TABLE public.advertisement_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('digital_signage', 'banner', 'promotional', 'sponsored_event', 'directory', 'newsletter', 'mobile_app')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget NUMERIC NOT NULL,
  daily_budget NUMERIC,
  billing_model TEXT NOT NULL CHECK (billing_model IN ('CPM', 'CPC', 'CPA', 'fixed_monthly', 'revenue_share')),
  rate NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  location_id UUID,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('screen', 'banner_physical', 'banner_digital', 'mobile_app', 'newsletter')),
  placement_name TEXT NOT NULL,
  dimensions TEXT,
  daily_rate NUMERIC NOT NULL,
  impressions_target INTEGER DEFAULT 0,
  clicks_target INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  placement_id UUID,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.advertiser_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL,
  campaign_id UUID,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('campaign_payment', 'commission', 'bonus', 'refund')),
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  commission_rate NUMERIC DEFAULT 0,
  performance_bonus NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced Financial Tables
CREATE TABLE public.financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('monthly_revenue', 'quarterly_revenue', 'annual_revenue', 'expense_report', 'profit_loss', 'cash_flow', 'balance_sheet')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  generated_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'error')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.revenue_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  service_category TEXT NOT NULL CHECK (service_category IN ('anpr_subscriptions', 'anpr_usage', 'society_maintenance', 'society_utilities', 'advertiser_campaigns', 'other')),
  revenue_amount NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC NOT NULL DEFAULT 0,
  unit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.expense_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  expense_category TEXT NOT NULL CHECK (expense_category IN ('operational', 'marketing', 'technology', 'personnel', 'infrastructure', 'maintenance', 'legal', 'other')),
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  vendor_name TEXT,
  invoice_reference TEXT,
  payment_method TEXT,
  approved_by UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profit_loss_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  gross_profit NUMERIC GENERATED ALWAYS AS (total_revenue - total_expenses) STORED,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  profit_margin NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ANPR Service Enhancement Tables
CREATE TABLE public.anpr_service_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('subscription_basic', 'subscription_professional', 'subscription_enterprise', 'usage_detection', 'storage', 'premium_analytics', 'api_access', 'setup_installation', 'technical_support')),
  charge_amount NUMERIC NOT NULL,
  billing_date DATE NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'billed', 'paid', 'disputed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.camera_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  camera_id UUID NOT NULL,
  subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('basic', 'professional', 'enterprise')),
  monthly_fee NUMERIC NOT NULL,
  installation_fee NUMERIC DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.society_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisement_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertiser_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_loss_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anpr_service_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Society Management
CREATE POLICY "Society units access by organization" ON public.society_units
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
  )
);

CREATE POLICY "Maintenance charges via unit access" ON public.maintenance_charges
FOR ALL USING (
  unit_id IN (
    SELECT su.id FROM society_units su WHERE
    get_user_role(auth.uid()) = 'platform_admin' OR
    su.organization_id = get_user_organization(auth.uid()) OR
    su.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

CREATE POLICY "Utility readings via unit access" ON public.utility_readings
FOR ALL USING (
  unit_id IN (
    SELECT su.id FROM society_units su WHERE
    get_user_role(auth.uid()) = 'platform_admin' OR
    su.organization_id = get_user_organization(auth.uid()) OR
    su.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

CREATE POLICY "Amenity bookings via unit access" ON public.amenity_bookings
FOR ALL USING (
  unit_id IN (
    SELECT su.id FROM society_units su WHERE
    get_user_role(auth.uid()) = 'platform_admin' OR
    su.organization_id = get_user_organization(auth.uid()) OR
    su.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

-- Create RLS Policies for Advertiser Billing
CREATE POLICY "Advertisement campaigns access by organization" ON public.advertisement_campaigns
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
  )
);

CREATE POLICY "Ad placements via campaign access" ON public.ad_placements
FOR ALL USING (
  campaign_id IN (
    SELECT ac.id FROM advertisement_campaigns ac WHERE
    get_user_role(auth.uid()) = 'platform_admin' OR
    ac.organization_id = get_user_organization(auth.uid()) OR
    ac.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

CREATE POLICY "Campaign performance via campaign access" ON public.campaign_performance
FOR ALL USING (
  campaign_id IN (
    SELECT ac.id FROM advertisement_campaigns ac WHERE
    get_user_role(auth.uid()) = 'platform_admin' OR
    ac.organization_id = get_user_organization(auth.uid()) OR
    ac.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

CREATE POLICY "Advertiser payments via campaign access" ON public.advertiser_payments
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  campaign_id IN (
    SELECT ac.id FROM advertisement_campaigns ac WHERE
    ac.organization_id = get_user_organization(auth.uid()) OR
    ac.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

-- Create RLS Policies for Financial Reports
CREATE POLICY "Financial reports access by organization" ON public.financial_reports
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
  )
);

CREATE POLICY "Revenue breakdown via report access" ON public.revenue_breakdown
FOR ALL USING (
  report_id IN (
    SELECT fr.id FROM financial_reports fr WHERE
    get_user_role(auth.uid()) = 'platform_admin' OR
    fr.organization_id = get_user_organization(auth.uid()) OR
    fr.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

CREATE POLICY "Expense tracking access by organization" ON public.expense_tracking
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
  )
);

CREATE POLICY "Profit loss statements access by organization" ON public.profit_loss_statements
FOR ALL USING (
  get_user_role(auth.uid()) = 'platform_admin' OR
  organization_id = get_user_organization(auth.uid()) OR
  organization_id IN (
    SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
  )
);

-- Create RLS Policies for ANPR Service Enhancement
CREATE POLICY "ANPR service charges via customer access" ON public.anpr_service_charges
FOR ALL USING (
  customer_id IN (
    SELECT bc.id FROM billing_customers bc WHERE
    get_user_role(auth.uid()) = 'platform_admin' OR
    bc.organization_id = get_user_organization(auth.uid()) OR
    bc.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

CREATE POLICY "Camera subscriptions via customer access" ON public.camera_subscriptions
FOR ALL USING (
  customer_id IN (
    SELECT bc.id FROM billing_customers bc WHERE
    get_user_role(auth.uid()) = 'platform_admin' OR
    bc.organization_id = get_user_organization(auth.uid()) OR
    bc.organization_id IN (
      SELECT id FROM organizations WHERE parent_id = get_user_organization(auth.uid())
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_society_units_organization ON society_units(organization_id);
CREATE INDEX idx_maintenance_charges_unit ON maintenance_charges(unit_id);
CREATE INDEX idx_maintenance_charges_billing_month ON maintenance_charges(billing_month);
CREATE INDEX idx_utility_readings_unit_month ON utility_readings(unit_id, billing_month);
CREATE INDEX idx_amenity_bookings_unit_date ON amenity_bookings(unit_id, booking_date);
CREATE INDEX idx_advertisement_campaigns_org ON advertisement_campaigns(organization_id);
CREATE INDEX idx_ad_placements_campaign ON ad_placements(campaign_id);
CREATE INDEX idx_campaign_performance_date ON campaign_performance(campaign_id, date);
CREATE INDEX idx_advertiser_payments_advertiser ON advertiser_payments(advertiser_id);
CREATE INDEX idx_financial_reports_org_type ON financial_reports(organization_id, report_type);
CREATE INDEX idx_expense_tracking_org_date ON expense_tracking(organization_id, expense_date);
CREATE INDEX idx_anpr_service_charges_customer ON anpr_service_charges(customer_id);
CREATE INDEX idx_camera_subscriptions_customer_camera ON camera_subscriptions(customer_id, camera_id);

-- Create triggers for updated_at fields
CREATE TRIGGER update_society_units_updated_at
    BEFORE UPDATE ON society_units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_charges_updated_at
    BEFORE UPDATE ON maintenance_charges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisement_campaigns_updated_at
    BEFORE UPDATE ON advertisement_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_tracking_updated_at
    BEFORE UPDATE ON expense_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profit_loss_statements_updated_at
    BEFORE UPDATE ON profit_loss_statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_camera_subscriptions_updated_at
    BEFORE UPDATE ON camera_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();