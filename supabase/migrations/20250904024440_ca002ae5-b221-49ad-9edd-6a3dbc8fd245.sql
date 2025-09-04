-- Create financial management tables for Society Books Management

-- Create projects and meetings table
CREATE TABLE public.project_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  meeting_type VARCHAR DEFAULT 'project' CHECK (meeting_type IN ('project', 'meeting', 'committee', 'general')),
  description TEXT,
  agenda TEXT,
  meeting_date DATE,
  meeting_time TIME,
  location VARCHAR,
  participants JSONB DEFAULT '[]',
  minutes TEXT,
  decisions JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'postponed')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vendor contracts table
CREATE TABLE public.vendor_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  vendor_name VARCHAR NOT NULL,
  vendor_contact_person VARCHAR,
  vendor_phone VARCHAR,
  vendor_email VARCHAR,
  contract_type VARCHAR NOT NULL,
  service_description TEXT,
  contract_value NUMERIC(12,2),
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  payment_terms VARCHAR,
  performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
  renewal_notice_period INTEGER DEFAULT 30,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'suspended')),
  documents JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create AMC contracts table
CREATE TABLE public.amc_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  equipment_type VARCHAR NOT NULL,
  equipment_details TEXT,
  vendor_id UUID,
  contract_number VARCHAR UNIQUE NOT NULL,
  contract_value NUMERIC(12,2) NOT NULL,
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,
  service_frequency VARCHAR,
  next_service_date DATE,
  last_service_date DATE,
  warranty_period INTEGER,
  terms_conditions TEXT,
  renewal_alert_days INTEGER DEFAULT 60,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'expired', 'renewed', 'terminated')),
  service_history JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chart of accounts table for financial system
CREATE TABLE public.chart_of_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  account_code VARCHAR NOT NULL,
  account_name VARCHAR NOT NULL,
  account_type VARCHAR NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  account_category VARCHAR,
  parent_account_id UUID REFERENCES public.chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, account_code)
);

-- Create journal entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  entry_number VARCHAR NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_number VARCHAR,
  total_debit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_credit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, entry_number)
);

-- Create journal entry line items table
CREATE TABLE public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  description TEXT,
  debit_amount NUMERIC(12,2) DEFAULT 0,
  credit_amount NUMERIC(12,2) DEFAULT 0,
  line_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bank accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  account_name VARCHAR NOT NULL,
  bank_name VARCHAR NOT NULL,
  account_number VARCHAR NOT NULL,
  account_type VARCHAR DEFAULT 'savings' CHECK (account_type IN ('savings', 'current', 'fixed_deposit', 'recurring')),
  branch_name VARCHAR,
  ifsc_code VARCHAR,
  opening_balance NUMERIC(12,2) DEFAULT 0,
  current_balance NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create utility readings table
CREATE TABLE public.utility_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  utility_type VARCHAR NOT NULL CHECK (utility_type IN ('electricity', 'water', 'gas', 'internet')),
  meter_number VARCHAR,
  reading_date DATE NOT NULL,
  previous_reading NUMERIC(10,2),
  current_reading NUMERIC(10,2) NOT NULL,
  consumption NUMERIC(10,2),
  rate_per_unit NUMERIC(8,4),
  total_amount NUMERIC(10,2),
  bill_number VARCHAR,
  due_date DATE,
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  building_id UUID,
  unit_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create access cards table for physical access management
CREATE TABLE public.access_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  card_number VARCHAR UNIQUE NOT NULL,
  card_type VARCHAR DEFAULT 'resident' CHECK (card_type IN ('resident', 'staff', 'visitor', 'emergency', 'vendor')),
  holder_name VARCHAR NOT NULL,
  holder_id UUID,
  access_levels JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create security incidents table
CREATE TABLE public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  incident_number VARCHAR UNIQUE NOT NULL,
  incident_type VARCHAR NOT NULL CHECK (incident_type IN ('theft', 'vandalism', 'trespassing', 'violence', 'suspicious_activity', 'emergency', 'other')),
  severity VARCHAR DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR,
  incident_date TIMESTAMPTZ NOT NULL,
  reported_by UUID,
  assigned_to UUID,
  witnesses JSONB DEFAULT '[]',
  evidence JSONB DEFAULT '[]',
  actions_taken TEXT,
  status VARCHAR DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  contact_type VARCHAR NOT NULL CHECK (contact_type IN ('police', 'fire', 'medical', 'security', 'maintenance', 'management', 'utility')),
  contact_name VARCHAR NOT NULL,
  phone_primary VARCHAR NOT NULL,
  phone_secondary VARCHAR,
  email VARCHAR,
  address TEXT,
  availability VARCHAR DEFAULT '24x7',
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.project_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
CREATE POLICY "Users can view project meetings in their organization" ON public.project_meetings FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage project meetings in their organization" ON public.project_meetings FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view vendor contracts in their organization" ON public.vendor_contracts FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage vendor contracts in their organization" ON public.vendor_contracts FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view AMC contracts in their organization" ON public.amc_contracts FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage AMC contracts in their organization" ON public.amc_contracts FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view chart of accounts in their organization" ON public.chart_of_accounts FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage chart of accounts in their organization" ON public.chart_of_accounts FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view journal entries in their organization" ON public.journal_entries FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage journal entries in their organization" ON public.journal_entries FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view journal entry lines in their organization" ON public.journal_entry_lines FOR SELECT USING (journal_entry_id IN (SELECT id FROM public.journal_entries WHERE organization_id = get_user_organization_id()));
CREATE POLICY "Admins can manage journal entry lines in their organization" ON public.journal_entry_lines FOR ALL USING (journal_entry_id IN (SELECT id FROM public.journal_entries WHERE organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])));

CREATE POLICY "Users can view bank accounts in their organization" ON public.bank_accounts FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage bank accounts in their organization" ON public.bank_accounts FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view utility readings in their organization" ON public.utility_readings FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage utility readings in their organization" ON public.utility_readings FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view access cards in their organization" ON public.access_cards FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage access cards in their organization" ON public.access_cards FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view security incidents in their organization" ON public.security_incidents FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage security incidents in their organization" ON public.security_incidents FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view emergency contacts in their organization" ON public.emergency_contacts FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage emergency contacts in their organization" ON public.emergency_contacts FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create triggers for updated_at columns
CREATE TRIGGER update_project_meetings_updated_at BEFORE UPDATE ON public.project_meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_contracts_updated_at BEFORE UPDATE ON public.vendor_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_amc_contracts_updated_at BEFORE UPDATE ON public.amc_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON public.chart_of_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_utility_readings_updated_at BEFORE UPDATE ON public.utility_readings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_access_cards_updated_at BEFORE UPDATE ON public.access_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON public.security_incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();