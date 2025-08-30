-- Create VMS Core Tables for Visitor Management System

-- Premise types for different facility categories
CREATE TABLE public.premise_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, -- 'Factory', 'Hospital', 'Society', 'School', 'Corporate', 'Government', 'Retail', 'Hotel', 'Custom'
  description text,
  config jsonb DEFAULT '{}', -- Premise-specific configuration
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Checkin points within entry gates  
CREATE TABLE public.checkin_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_gate_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'kiosk', -- 'kiosk', 'reception', 'mobile', 'tablet'
  config jsonb DEFAULT '{}', -- Hardware configuration, IP addresses, etc.
  status text NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'maintenance'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Hosts - internal staff who can receive visitors
CREATE TABLE public.hosts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- Links to profiles table
  organization_id uuid NOT NULL,
  department text,
  job_title text,
  phone text,
  location_id uuid, -- Primary location
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "push": true}',
  availability_status text NOT NULL DEFAULT 'available', -- 'available', 'busy', 'away', 'offline'
  auto_approve_visitors boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Visitors - visitor profiles and contact information
CREATE TABLE public.visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  company text,
  id_type text, -- 'passport', 'drivers_license', 'national_id', 'other'
  id_number text,
  photo_url text,
  emergency_contact_name text,
  emergency_contact_phone text,
  security_status text NOT NULL DEFAULT 'cleared', -- 'cleared', 'pending', 'flagged', 'blacklisted'
  last_visit_date timestamp with time zone,
  visit_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Individual visit records
CREATE TABLE public.visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id uuid NOT NULL,
  host_id uuid,
  organization_id uuid NOT NULL,
  location_id uuid NOT NULL,
  building_id uuid,
  entry_gate_id uuid,
  checkin_point_id uuid,
  
  -- Visit details
  purpose text NOT NULL, -- 'meeting', 'delivery', 'maintenance', 'interview', 'tour', 'other'
  visit_type text NOT NULL DEFAULT 'individual', -- 'individual', 'group', 'recurring'
  expected_duration_minutes integer,
  
  -- Status and timing
  status text NOT NULL DEFAULT 'registered', -- 'registered', 'approved', 'checked_in', 'checked_out', 'cancelled', 'no_show'
  check_in_time timestamp with time zone,
  expected_checkout_time timestamp with time zone,
  check_out_time timestamp with time zone,
  
  -- Additional data
  badge_printed boolean DEFAULT false,
  badge_number text,
  visitor_photo_url text,
  health_declaration jsonb, -- COVID screening, temperature, etc.
  agreements_signed text[], -- NDAs, safety agreements, etc.
  notes text,
  
  -- Metadata
  created_by uuid, -- User who created the visit
  approved_by uuid, -- Host who approved
  checked_in_by uuid, -- Staff who assisted check-in
  checked_out_by uuid, -- Staff who assisted check-out
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Pre-registrations for advance visitor booking
CREATE TABLE public.pre_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id uuid,
  host_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  location_id uuid NOT NULL,
  
  -- Visit details
  scheduled_date date NOT NULL,
  scheduled_time time,
  purpose text NOT NULL,
  expected_duration_minutes integer,
  group_size integer DEFAULT 1,
  
  -- Status
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed', 'cancelled'
  approval_deadline timestamp with time zone,
  
  -- Pre-registration data
  visitor_details jsonb NOT NULL, -- For visitors not yet in system
  special_requirements jsonb, -- Accessibility, equipment needs, etc.
  qr_code text, -- For fast check-in
  
  -- Approval workflow
  approved_by uuid,
  approved_at timestamp with time zone,
  rejection_reason text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Badge templates and printing records
CREATE TABLE public.badge_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  name text NOT NULL,
  template_type text NOT NULL DEFAULT 'visitor', -- 'visitor', 'contractor', 'vip', 'group'
  design_config jsonb NOT NULL, -- Layout, colors, fonts, logos
  security_features jsonb DEFAULT '{}', -- QR codes, RFID, watermarks
  active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Badge printing records
CREATE TABLE public.badge_prints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id uuid NOT NULL,
  template_id uuid NOT NULL,
  badge_number text NOT NULL,
  printer_id text,
  print_status text NOT NULL DEFAULT 'pending', -- 'pending', 'printed', 'failed', 'reprinted'
  print_time timestamp with time zone,
  expiry_time timestamp with time zone,
  qr_code_data text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Emergency alerts and visitor accountability
CREATE TABLE public.emergency_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  location_id uuid,
  alert_type text NOT NULL, -- 'evacuation', 'lockdown', 'fire', 'medical', 'security'
  alert_level text NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'cancelled'
  
  -- Visitor accountability
  total_visitors_count integer DEFAULT 0,
  accounted_visitors_count integer DEFAULT 0,
  missing_visitors text[], -- Array of visitor IDs
  
  -- Timing
  alert_time timestamp with time zone NOT NULL DEFAULT now(),
  resolved_time timestamp with time zone,
  created_by uuid NOT NULL,
  resolved_by uuid,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Visitor blacklist and whitelist management
CREATE TABLE public.visitor_access_control (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  visitor_id uuid,
  list_type text NOT NULL, -- 'blacklist', 'whitelist', 'watchlist'
  reason text NOT NULL,
  notes text,
  added_by uuid NOT NULL,
  expires_at timestamp with time zone,
  active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Comprehensive audit trail for all visitor activities
CREATE TABLE public.visitor_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  visit_id uuid,
  visitor_id uuid,
  user_id uuid, -- Staff member who performed action
  action text NOT NULL, -- 'check_in', 'check_out', 'approve', 'reject', 'badge_print', etc.
  entity_type text NOT NULL, -- 'visit', 'visitor', 'pre_registration', etc.
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  location_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.premise_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_prints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_audit_logs ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraints
ALTER TABLE public.checkin_points ADD CONSTRAINT checkin_points_entry_gate_id_fkey 
  FOREIGN KEY (entry_gate_id) REFERENCES public.entry_gates(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_visits_visitor_id ON public.visits(visitor_id);
CREATE INDEX idx_visits_host_id ON public.visits(host_id);
CREATE INDEX idx_visits_organization_id ON public.visits(organization_id);
CREATE INDEX idx_visits_status ON public.visits(status);
CREATE INDEX idx_visits_check_in_time ON public.visits(check_in_time);
CREATE INDEX idx_visits_check_out_time ON public.visits(check_out_time);
CREATE INDEX idx_visitors_email ON public.visitors(email);
CREATE INDEX idx_visitors_phone ON public.visitors(phone);
CREATE INDEX idx_pre_registrations_scheduled_date ON public.pre_registrations(scheduled_date);
CREATE INDEX idx_pre_registrations_status ON public.pre_registrations(status);
CREATE INDEX idx_hosts_user_id ON public.hosts(user_id);
CREATE INDEX idx_hosts_organization_id ON public.hosts(organization_id);

-- Insert default premise types
INSERT INTO public.premise_types (name, description, config) VALUES
('Factory', 'Industrial facilities with shift workers and contractors', '{"requires_safety_training": true, "shift_based": true}'),
('Hospital', 'Healthcare facilities with patients, visitors, and medical staff', '{"requires_health_screening": true, "visiting_hours": true}'),
('Society', 'Apartment complexes and gated communities', '{"requires_resident_approval": true, "guest_parking": true}'),
('School', 'Educational institutions', '{"requires_background_check": true, "parent_verification": true}'),
('Corporate', 'Business buildings and office complexes', '{"business_hours": true, "meeting_rooms": true}'),
('Government', 'Public buildings and administrative offices', '{"high_security": true, "id_verification_required": true}'),
('Retail', 'Shopping centers and retail establishments', '{"public_access": true, "business_hours": true}'),
('Hotel', 'Hotels, resorts, and event venues', '{"guest_management": true, "event_spaces": true}'),
('Custom', 'Configurable for specialized facilities', '{"customizable": true}');

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_premise_types_updated_at
  BEFORE UPDATE ON public.premise_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checkin_points_updated_at
  BEFORE UPDATE ON public.checkin_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hosts_updated_at
  BEFORE UPDATE ON public.hosts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pre_registrations_updated_at
  BEFORE UPDATE ON public.pre_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_badge_templates_updated_at
  BEFORE UPDATE ON public.badge_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_alerts_updated_at
  BEFORE UPDATE ON public.emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitor_access_control_updated_at
  BEFORE UPDATE ON public.visitor_access_control
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();