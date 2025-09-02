-- ================================================================
-- PHASE 1: CORE INFRASTRUCTURE - MISSING FEATURES IMPLEMENTATION  
-- ================================================================

-- Create currencies table first
CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(3) NOT NULL UNIQUE,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate DECIMAL(10,4) DEFAULT 1.0,
  is_base_currency BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert sample currencies
INSERT INTO public.currencies (name, code, symbol, is_base_currency, is_active) VALUES
('US Dollar', 'USD', '$', true, true),
('Euro', 'EUR', '€', false, true),
('Indian Rupee', 'INR', '₹', false, true),
('British Pound', 'GBP', '£', false, true),
('Canadian Dollar', 'CAD', 'C$', false, true)
ON CONFLICT (code) DO NOTHING;

-- Staff Management System
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_staff_id UUID,
  budget DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  department_id UUID,
  employee_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(100),
  salary DECIMAL(12,2),
  currency_id UUID,
  hire_date DATE,
  termination_date DATE,
  status public.user_status DEFAULT 'active',
  emergency_contact JSONB,
  address JSONB,
  documents JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Visitors Management System
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  purpose_of_visit TEXT,
  host_id UUID,
  unit_id UUID,
  id_type VARCHAR(50),
  id_number VARCHAR(100),
  nationality VARCHAR(100),
  vehicle_license_plate VARCHAR(20),
  vehicle_type public.vehicle_type,
  photo_url TEXT,
  security_clearance VARCHAR(20) DEFAULT 'pending',
  visit_type VARCHAR(20) DEFAULT 'casual',
  expected_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  expected_departure TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'expected',
  access_areas JSONB,
  emergency_contact JSONB,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpdesk System
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority public.severity_level DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  created_by UUID NOT NULL,
  assigned_to UUID,
  location_id UUID,
  building_id UUID,
  unit_id UUID,
  attachments JSONB,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Polls System
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  poll_type VARCHAR(20) DEFAULT 'single_choice',
  options JSONB NOT NULL,
  allows_multiple_selections BOOLEAN DEFAULT false,
  anonymous_voting BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  target_audience VARCHAR(20) DEFAULT 'all',
  min_participation INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active',
  total_votes INTEGER DEFAULT 0,
  results JSONB,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Anyone can view currencies" ON public.currencies FOR SELECT USING (true);
CREATE POLICY "Platform admins can manage currencies" ON public.currencies FOR ALL USING (get_user_role() = 'platform_admin');

CREATE POLICY "Admins can manage departments in their organization" ON public.departments FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view departments in their organization" ON public.departments FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage staff in their organization" ON public.staff FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view staff in their organization" ON public.staff FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage visitors in their organization" ON public.visitors FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator']));

CREATE POLICY "Users can view visitors they created" ON public.visitors FOR SELECT 
USING (organization_id = get_user_organization_id() AND (created_by = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator'])));

CREATE POLICY "Users can create tickets in their organization" ON public.tickets FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND created_by = auth.uid());

CREATE POLICY "Users can view their own tickets" ON public.tickets FOR SELECT 
USING (organization_id = get_user_organization_id() AND (created_by = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator'])));

CREATE POLICY "Admins can manage all tickets in their organization" ON public.tickets FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator']));

CREATE POLICY "Users can create polls in their organization" ON public.polls FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND created_by = auth.uid());

CREATE POLICY "Users can view polls in their organization" ON public.polls FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Creators can update their own polls" ON public.polls FOR UPDATE 
USING (organization_id = get_user_organization_id() AND created_by = auth.uid());

CREATE POLICY "Admins can manage all polls in their organization" ON public.polls FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

-- Create indexes
CREATE INDEX idx_currencies_code ON public.currencies(code);
CREATE INDEX idx_departments_organization ON public.departments(organization_id);
CREATE INDEX idx_staff_organization ON public.staff(organization_id);
CREATE INDEX idx_visitors_organization ON public.visitors(organization_id);
CREATE INDEX idx_tickets_organization ON public.tickets(organization_id);
CREATE INDEX idx_tickets_number ON public.tickets(ticket_number);
CREATE INDEX idx_polls_organization ON public.polls(organization_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON public.currencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON public.visitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();