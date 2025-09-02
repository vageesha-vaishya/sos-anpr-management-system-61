
-- Create missing tables for the SOS-ANPR application

-- 1. Create service_types table
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  service_name VARCHAR(255) NOT NULL,
  service_category VARCHAR(100) NOT NULL,
  description TEXT,
  unit_type VARCHAR(50) NOT NULL DEFAULT 'hour', -- hour, day, month, fixed
  default_rate DECIMAL(10,2),
  billing_model VARCHAR(50) NOT NULL DEFAULT 'hourly', -- hourly, daily, monthly, fixed
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  head_of_department VARCHAR(255),
  budget DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create staff_members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  department_id UUID REFERENCES public.departments(id),
  employee_id VARCHAR(50) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  position VARCHAR(100),
  salary DECIMAL(10,2),
  hire_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create helpdesk_tickets table
CREATE TABLE IF NOT EXISTS public.helpdesk_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES public.staff_members(id),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create hosts table
CREATE TABLE IF NOT EXISTS public.hosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  department VARCHAR(100),
  job_title VARCHAR(100),
  phone VARCHAR(20),
  availability_status VARCHAR(50) DEFAULT 'available',
  auto_approve_visitors BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create pre_registrations table
CREATE TABLE IF NOT EXISTS public.pre_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255),
  visitor_phone VARCHAR(20),
  company VARCHAR(255),
  purpose TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  duration_hours INTEGER DEFAULT 1,
  group_size INTEGER DEFAULT 1,
  host_id UUID REFERENCES public.hosts(id),
  status VARCHAR(50) DEFAULT 'pending',
  visitor_details JSONB DEFAULT '{}',
  special_requirements TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Create community_polls table
CREATE TABLE IF NOT EXISTS public.community_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  poll_type VARCHAR(50) DEFAULT 'single_choice',
  is_active BOOLEAN DEFAULT true,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.community_polls(id) ON DELETE CASCADE,
  option_text VARCHAR(500) NOT NULL,
  option_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.community_polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, voter_id) -- Ensure one vote per user per poll
);

-- 10. Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  customer_id UUID REFERENCES public.billing_customers(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  outstanding_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  payment_terms VARCHAR(100),
  notes TEXT,
  line_items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_types
CREATE POLICY "Admins can manage service types in their organization" 
  ON public.service_types 
  FOR ALL 
  USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view service types in their organization" 
  ON public.service_types 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create RLS policies for departments
CREATE POLICY "Admins can manage departments in their organization" 
  ON public.departments 
  FOR ALL 
  USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view departments in their organization" 
  ON public.departments 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create RLS policies for staff_members
CREATE POLICY "Admins can manage staff members in their organization" 
  ON public.staff_members 
  FOR ALL 
  USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view staff members in their organization" 
  ON public.staff_members 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create RLS policies for helpdesk_tickets
CREATE POLICY "Admins can manage helpdesk tickets in their organization" 
  ON public.helpdesk_tickets 
  FOR ALL 
  USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'operator'::user_role]));

CREATE POLICY "Users can create and view their own helpdesk tickets" 
  ON public.helpdesk_tickets 
  FOR SELECT 
  USING (organization_id = get_user_organization_id() AND (created_by = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'operator'::user_role])));

CREATE POLICY "Users can create helpdesk tickets" 
  ON public.helpdesk_tickets 
  FOR INSERT 
  WITH CHECK (organization_id = get_user_organization_id());

-- Create RLS policies for hosts
CREATE POLICY "Admins can manage hosts in their organization" 
  ON public.hosts 
  FOR ALL 
  USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view hosts in their organization" 
  ON public.hosts 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create RLS policies for pre_registrations
CREATE POLICY "Admins can manage pre-registrations in their organization" 
  ON public.pre_registrations 
  FOR ALL 
  USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'operator'::user_role]));

CREATE POLICY "Users can view pre-registrations in their organization" 
  ON public.pre_registrations 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create RLS policies for community_polls
CREATE POLICY "Admins can manage community polls in their organization" 
  ON public.community_polls 
  FOR ALL 
  USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view community polls in their organization" 
  ON public.community_polls 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create RLS policies for poll_options
CREATE POLICY "Users can view poll options for polls in their organization" 
  ON public.poll_options 
  FOR SELECT 
  USING (poll_id IN (SELECT id FROM public.community_polls WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Admins can manage poll options in their organization" 
  ON public.poll_options 
  FOR ALL 
  USING (poll_id IN (SELECT id FROM public.community_polls WHERE organization_id = get_user_organization_id()) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for poll_votes
CREATE POLICY "Users can manage their own poll votes" 
  ON public.poll_votes 
  FOR ALL 
  USING (voter_id = auth.uid() AND poll_id IN (SELECT id FROM public.community_polls WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Admins can view poll votes in their organization" 
  ON public.poll_votes 
  FOR SELECT 
  USING (poll_id IN (SELECT id FROM public.community_polls WHERE organization_id = get_user_organization_id()) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for invoices
CREATE POLICY "Admins can manage invoices in their organization" 
  ON public.invoices 
  FOR ALL 
  USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view invoices in their organization" 
  ON public.invoices 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_service_types_updated_at 
  BEFORE UPDATE ON public.service_types 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON public.departments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at 
  BEFORE UPDATE ON public.staff_members 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_helpdesk_tickets_updated_at 
  BEFORE UPDATE ON public.helpdesk_tickets 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hosts_updated_at 
  BEFORE UPDATE ON public.hosts 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pre_registrations_updated_at 
  BEFORE UPDATE ON public.pre_registrations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_polls_updated_at 
  BEFORE UPDATE ON public.community_polls 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON public.invoices 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_types_organization_id ON public.service_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_organization_id ON public.staff_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_department_id ON public.staff_members(department_id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_organization_id ON public.helpdesk_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_assigned_to ON public.helpdesk_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_hosts_organization_id ON public.hosts(organization_id);
CREATE INDEX IF NOT EXISTS idx_hosts_user_id ON public.hosts(user_id);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_organization_id ON public.pre_registrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_host_id ON public.pre_registrations(host_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_organization_id ON public.community_polls(organization_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_voter_id ON public.poll_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
