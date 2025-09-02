-- Create currencies table
CREATE TABLE public.currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_of_department VARCHAR(100),
  budget DECIMAL(12, 2),
  organization_id UUID REFERENCES public.organizations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff_members table
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  department_id UUID REFERENCES public.departments(id),
  position VARCHAR(100),
  salary DECIMAL(10, 2),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  company VARCHAR(200),
  purpose_of_visit TEXT,
  host_name VARCHAR(200),
  host_unit VARCHAR(50),
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  visitor_status VARCHAR(20) DEFAULT 'pending',
  photo_url TEXT,
  identification_type VARCHAR(50),
  identification_number VARCHAR(100),
  vehicle_number VARCHAR(20),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create helpdesk_tickets table
CREATE TABLE public.helpdesk_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  created_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.staff_members(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_polls table
CREATE TABLE public.community_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  poll_type VARCHAR(20) DEFAULT 'single_choice',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.community_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.community_polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, voter_id)
);

-- Create service_types table
CREATE TABLE public.service_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  base_cost DECIMAL(10, 2),
  billing_cycle VARCHAR(20),
  organization_id UUID REFERENCES public.organizations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for currencies (global data, viewable by all)
CREATE POLICY "Anyone can view currencies" ON public.currencies FOR SELECT USING (true);
CREATE POLICY "Platform admins can manage currencies" ON public.currencies FOR ALL USING (get_user_role() = 'platform_admin');

-- Create RLS policies for departments
CREATE POLICY "Users can view departments in their organization" ON public.departments FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage departments in their organization" ON public.departments FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for staff_members
CREATE POLICY "Users can view staff in their organization" ON public.staff_members FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage staff in their organization" ON public.staff_members FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for visitors
CREATE POLICY "Users can view visitors in their organization" ON public.visitors FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage visitors in their organization" ON public.visitors FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'operator'::user_role]));

-- Create RLS policies for helpdesk_tickets
CREATE POLICY "Users can view tickets in their organization" ON public.helpdesk_tickets FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can create tickets in their organization" ON public.helpdesk_tickets FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
CREATE POLICY "Users can update their own tickets" ON public.helpdesk_tickets FOR UPDATE USING (created_by = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'operator'::user_role]));

-- Create RLS policies for community_polls
CREATE POLICY "Users can view polls in their organization" ON public.community_polls FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Users can create polls in their organization" ON public.community_polls FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
CREATE POLICY "Users can update their own polls" ON public.community_polls FOR UPDATE USING (created_by = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for poll_options
CREATE POLICY "Users can view poll options in their organization" ON public.poll_options FOR SELECT USING (poll_id IN (SELECT id FROM public.community_polls WHERE organization_id = get_user_organization_id()));
CREATE POLICY "Poll creators can manage options" ON public.poll_options FOR ALL USING (poll_id IN (SELECT id FROM public.community_polls WHERE created_by = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])));

-- Create RLS policies for poll_votes
CREATE POLICY "Users can view votes in their organization" ON public.poll_votes FOR SELECT USING (poll_id IN (SELECT id FROM public.community_polls WHERE organization_id = get_user_organization_id()));
CREATE POLICY "Users can vote in their organization" ON public.poll_votes FOR INSERT WITH CHECK (poll_id IN (SELECT id FROM public.community_polls WHERE organization_id = get_user_organization_id()));
CREATE POLICY "Users can update their own votes" ON public.poll_votes FOR UPDATE USING (voter_id = auth.uid());

-- Create RLS policies for service_types
CREATE POLICY "Users can view service types in their organization" ON public.service_types FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Admins can manage service types in their organization" ON public.service_types FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON public.currencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON public.visitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_helpdesk_tickets_updated_at BEFORE UPDATE ON public.helpdesk_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_polls_updated_at BEFORE UPDATE ON public.community_polls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample currencies
INSERT INTO public.currencies (code, name, symbol, exchange_rate) VALUES
('USD', 'US Dollar', '$', 1.0000),
('EUR', 'Euro', '€', 0.8500),
('INR', 'Indian Rupee', '₹', 83.2500),
('GBP', 'British Pound', '£', 0.7900),
('CAD', 'Canadian Dollar', 'C$', 1.3500);

-- Get platform organization ID for sample data
DO $$
DECLARE
  platform_org_id uuid;
BEGIN
  -- Get platform organization ID
  SELECT id INTO platform_org_id FROM organizations WHERE organization_type = 'platform' LIMIT 1;
  
  -- Insert sample departments
  INSERT INTO public.departments (name, description, head_of_department, budget, organization_id) VALUES
  ('Security', 'Building and premises security management', 'John Smith', 50000.00, platform_org_id),
  ('Maintenance', 'Facility maintenance and repairs', 'Mike Johnson', 75000.00, platform_org_id),
  ('Administration', 'Administrative and management tasks', 'Sarah Williams', 60000.00, platform_org_id),
  ('Housekeeping', 'Cleaning and housekeeping services', 'Maria Garcia', 40000.00, platform_org_id),
  ('Finance', 'Financial management and accounting', 'David Brown', 80000.00, platform_org_id),
  ('IT Support', 'Technology and IT infrastructure', 'Alex Chen', 70000.00, platform_org_id),
  ('Legal', 'Legal compliance and documentation', 'Robert Taylor', 65000.00, platform_org_id),
  ('Management', 'Executive management and oversight', 'Lisa Anderson', 100000.00, platform_org_id);

  -- Insert sample staff members
  INSERT INTO public.staff_members (employee_id, full_name, email, phone, department_id, position, salary, hire_date, organization_id) 
  SELECT 
    'EMP' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
    staff_data.full_name,
    staff_data.email,
    staff_data.phone,
    d.id,
    staff_data.position,
    staff_data.salary,
    staff_data.hire_date,
    platform_org_id
  FROM (VALUES
    ('John Smith', 'john.smith@adda.com', '+1-555-0101', 'Security', 'Security Manager', 55000.00, '2023-01-15'),
    ('Mike Johnson', 'mike.johnson@adda.com', '+1-555-0102', 'Maintenance', 'Maintenance Supervisor', 48000.00, '2023-02-01'),
    ('Sarah Williams', 'sarah.williams@adda.com', '+1-555-0103', 'Administration', 'Admin Manager', 52000.00, '2023-01-20'),
    ('Maria Garcia', 'maria.garcia@adda.com', '+1-555-0104', 'Housekeeping', 'Housekeeping Supervisor', 38000.00, '2023-03-01'),
    ('David Brown', 'david.brown@adda.com', '+1-555-0105', 'Finance', 'Finance Manager', 65000.00, '2023-01-10'),
    ('Alex Chen', 'alex.chen@adda.com', '+1-555-0106', 'IT Support', 'IT Manager', 62000.00, '2023-02-15'),
    ('Robert Taylor', 'robert.taylor@adda.com', '+1-555-0107', 'Legal', 'Legal Advisor', 68000.00, '2023-01-25'),
    ('Lisa Anderson', 'lisa.anderson@adda.com', '+1-555-0108', 'Management', 'General Manager', 85000.00, '2023-01-05'),
    ('James Wilson', 'james.wilson@adda.com', '+1-555-0109', 'Security', 'Security Guard', 35000.00, '2023-04-01'),
    ('Emma Davis', 'emma.davis@adda.com', '+1-555-0110', 'Maintenance', 'Maintenance Technician', 42000.00, '2023-03-15'),
    ('Jennifer Lee', 'jennifer.lee@adda.com', '+1-555-0111', 'Administration', 'Administrative Assistant', 38000.00, '2023-04-10'),
    ('Carlos Rodriguez', 'carlos.rodriguez@adda.com', '+1-555-0112', 'Housekeeping', 'Cleaner', 32000.00, '2023-05-01'),
    ('Anna Thompson', 'anna.thompson@adda.com', '+1-555-0113', 'Finance', 'Accountant', 45000.00, '2023-03-20'),
    ('Tom Mitchell', 'tom.mitchell@adda.com', '+1-555-0114', 'IT Support', 'IT Technician', 40000.00, '2023-04-05'),
    ('Sophie Martin', 'sophie.martin@adda.com', '+1-555-0115', 'Administration', 'Receptionist', 35000.00, '2023-05-15'),
    ('Daniel White', 'daniel.white@adda.com', '+1-555-0116', 'Security', 'Security Guard', 35000.00, '2023-05-20'),
    ('Rachel Green', 'rachel.green@adda.com', '+1-555-0117', 'Maintenance', 'Maintenance Helper', 38000.00, '2023-06-01'),
    ('Kevin Clark', 'kevin.clark@adda.com', '+1-555-0118', 'Housekeeping', 'Cleaner', 32000.00, '2023-06-10'),
    ('Michelle Hall', 'michelle.hall@adda.com', '+1-555-0119', 'Finance', 'Financial Analyst', 50000.00, '2023-04-15'),
    ('Ryan Baker', 'ryan.baker@adda.com', '+1-555-0120', 'IT Support', 'Network Administrator', 55000.00, '2023-03-10')
  ) AS staff_data(full_name, email, phone, dept_name, position, salary, hire_date)
  JOIN public.departments d ON d.name = staff_data.dept_name AND d.organization_id = platform_org_id;

  -- Insert sample visitors
  INSERT INTO public.visitors (full_name, phone, email, company, purpose_of_visit, host_name, host_unit, check_in_time, check_out_time, visitor_status, identification_type, identification_number, vehicle_number, organization_id) VALUES
  ('John Doe', '+1-555-1001', 'john.doe@email.com', 'ABC Corp', 'Business Meeting', 'Sarah Johnson', 'A-101', now() - interval '2 hours', now() - interval '1 hour', 'checked_out', 'Driver License', 'DL123456789', 'ABC-1234', platform_org_id),
  ('Jane Smith', '+1-555-1002', 'jane.smith@email.com', 'XYZ Ltd', 'Delivery', 'Mike Wilson', 'B-205', now() - interval '3 hours', null, 'checked_in', 'ID Card', 'ID987654321', 'XYZ-5678', platform_org_id),
  ('Robert Brown', '+1-555-1003', 'robert.brown@email.com', 'Tech Solutions', 'Maintenance', 'Lisa Davis', 'C-301', now() - interval '1 day', now() - interval '1 day' + interval '3 hours', 'checked_out', 'Passport', 'P123456789', 'TS-9012', platform_org_id),
  ('Emily Davis', '+1-555-1004', 'emily.davis@email.com', '', 'Personal Visit', 'John Anderson', 'A-102', now() - interval '30 minutes', null, 'checked_in', 'Driver License', 'DL456789123', 'ED-3456', platform_org_id),
  ('Michael Wilson', '+1-555-1005', 'michael.wilson@email.com', 'Delivery Express', 'Package Delivery', 'Susan Miller', 'D-401', now() - interval '4 hours', now() - interval '3 hours 30 minutes', 'checked_out', 'ID Card', 'ID555666777', 'DE-7890', platform_org_id);

  -- Insert sample service types
  INSERT INTO public.service_types (name, description, category, base_cost, billing_cycle, organization_id) VALUES
  ('Security Guard Service', '24/7 security guard services', 'Security', 2000.00, 'monthly', platform_org_id),
  ('Maintenance Service', 'General maintenance and repairs', 'Maintenance', 1500.00, 'monthly', platform_org_id),
  ('Housekeeping Service', 'Daily cleaning and housekeeping', 'Cleaning', 1200.00, 'monthly', platform_org_id),
  ('Pest Control', 'Monthly pest control treatment', 'Maintenance', 300.00, 'monthly', platform_org_id),
  ('Landscaping', 'Garden and landscape maintenance', 'Maintenance', 800.00, 'monthly', platform_org_id),
  ('Plumbing Service', 'Emergency and scheduled plumbing', 'Maintenance', 150.00, 'per_call', platform_org_id),
  ('Electrical Service', 'Electrical repairs and maintenance', 'Maintenance', 200.00, 'per_call', platform_org_id),
  ('AC Maintenance', 'Air conditioning service and repair', 'Maintenance', 500.00, 'quarterly', platform_org_id),
  ('Elevator Maintenance', 'Elevator servicing and repairs', 'Maintenance', 1000.00, 'monthly', platform_org_id),
  ('Waste Management', 'Garbage collection and disposal', 'Cleaning', 600.00, 'monthly', platform_org_id);

END $$;