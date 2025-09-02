-- ================================================================
-- PHASE 1: CORE INFRASTRUCTURE - MISSING FEATURES IMPLEMENTATION
-- ================================================================

-- ==============================================================================
-- 1. CURRENCIES & MULTI-CURRENCY SUPPORT
-- ==============================================================================

-- Create currencies table
CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(3) NOT NULL UNIQUE, -- USD, EUR, INR, etc.
  symbol VARCHAR(10) NOT NULL, -- $, €, ₹, etc.
  exchange_rate DECIMAL(10,4) DEFAULT 1.0, -- Rate relative to base currency
  is_base_currency BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 2. STAFF MANAGEMENT SYSTEM
-- ==============================================================================

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_staff_id UUID, -- Self reference to staff table
  budget DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create staff table
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
  emergency_contact JSONB, -- {name, phone, relationship}
  address JSONB, -- Full address object
  documents JSONB, -- {passport, visa, contract_url, etc.}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create staff shifts table
CREATE TABLE IF NOT EXISTS public.staff_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 30, -- minutes
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, missed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. DOCUMENT MANAGEMENT SYSTEM
-- ==============================================================================

-- Create document categories
CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_category_id UUID, -- For nested categories
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  category_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- pdf, doc, jpg, etc.
  file_size BIGINT, -- in bytes
  uploaded_by UUID NOT NULL, -- reference to profiles.id
  access_level VARCHAR(20) DEFAULT 'organization', -- public, organization, department, private
  tags TEXT[], -- Array of tags for search
  version INTEGER DEFAULT 1,
  parent_document_id UUID, -- For document versions
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. HELPDESK/COMPLAINTS SYSTEM
-- ==============================================================================

-- Create ticket categories
CREATE TABLE IF NOT EXISTS public.ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sla_hours INTEGER DEFAULT 24, -- Service Level Agreement in hours
  auto_assign_to UUID, -- Default assignee
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  category_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority public.severity_level DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed, cancelled
  created_by UUID NOT NULL, -- User who created the ticket
  assigned_to UUID, -- Staff member assigned
  location_id UUID, -- Optional location reference
  building_id UUID, -- Optional building reference
  unit_id UUID, -- Optional unit reference
  attachments JSONB, -- Array of file URLs
  resolution TEXT, -- Resolution description
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ, -- Based on SLA
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ticket comments table
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  author_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal comments only for staff
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. PARKING MANAGEMENT SYSTEM
-- ==============================================================================

-- Create parking zones
CREATE TABLE IF NOT EXISTS public.parking_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  building_id UUID,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  total_slots INTEGER NOT NULL,
  hourly_rate DECIMAL(8,2),
  daily_rate DECIMAL(8,2),
  monthly_rate DECIMAL(8,2),
  currency_id UUID,
  is_covered BOOLEAN DEFAULT false,
  has_ev_charging BOOLEAN DEFAULT false,
  access_levels JSONB, -- Array of access levels
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create parking slots
CREATE TABLE IF NOT EXISTS public.parking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL,
  slot_number VARCHAR(20) NOT NULL,
  slot_type VARCHAR(20) DEFAULT 'standard', -- standard, compact, large, handicap, ev
  is_reserved BOOLEAN DEFAULT false,
  reserved_for UUID, -- Reference to unit or user
  is_occupied BOOLEAN DEFAULT false,
  current_vehicle_id UUID, -- Current vehicle parked
  hourly_rate DECIMAL(8,2), -- Override zone rate if needed
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create parking bookings
CREATE TABLE IF NOT EXISTS public.parking_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  slot_id UUID NOT NULL,
  vehicle_id UUID, -- From vehicle_whitelist
  user_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  booking_type VARCHAR(20) DEFAULT 'temporary', -- temporary, monthly, permanent
  rate DECIMAL(8,2),
  currency_id UUID,
  total_amount DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled, refunded
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled, no_show
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. ASSET MANAGEMENT SYSTEM
-- ==============================================================================

-- Create asset categories
CREATE TABLE IF NOT EXISTS public.asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  depreciation_rate DECIMAL(5,2), -- Percentage per year
  maintenance_interval_days INTEGER DEFAULT 365,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  category_id UUID,
  location_id UUID,
  building_id UUID,
  asset_tag VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  currency_id UUID,
  current_value DECIMAL(12,2),
  condition VARCHAR(20) DEFAULT 'good', -- excellent, good, fair, poor, broken
  status VARCHAR(20) DEFAULT 'active', -- active, maintenance, retired, disposed
  warranty_expires DATE,
  assigned_to UUID, -- Staff or department
  last_maintenance DATE,
  next_maintenance DATE,
  documents JSONB, -- Purchase receipts, warranties, manuals
  specifications JSONB, -- Technical specifications
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create asset maintenance records
CREATE TABLE IF NOT EXISTS public.asset_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  maintenance_type VARCHAR(50) NOT NULL, -- scheduled, repair, inspection, upgrade
  title VARCHAR(255) NOT NULL,
  description TEXT,
  performed_by VARCHAR(255), -- Internal staff or external vendor
  performed_date DATE NOT NULL,
  cost DECIMAL(10,2),
  currency_id UUID,
  next_maintenance_date DATE,
  parts_replaced JSONB, -- Array of parts
  attachments JSONB, -- Photos, receipts, reports
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. EVENTS MANAGEMENT SYSTEM
-- ==============================================================================

-- Create event categories
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color_code VARCHAR(7), -- Hex color for calendar display
  requires_approval BOOLEAN DEFAULT false,
  max_advance_booking_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  category_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'community', -- community, private, maintenance, emergency
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location_id UUID,
  building_id UUID,
  amenity_id UUID, -- If event is in a specific amenity
  organizer_id UUID NOT NULL, -- User organizing the event
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  cost_per_person DECIMAL(8,2) DEFAULT 0,
  currency_id UUID,
  registration_required BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, cancelled, completed
  approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  tags TEXT[],
  attachments JSONB, -- Flyers, images
  requirements JSONB, -- Special requirements
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  attendees_count INTEGER DEFAULT 1,
  registration_date TIMESTAMPTZ DEFAULT now(),
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled, refunded
  payment_amount DECIMAL(10,2),
  special_requirements TEXT,
  attendance_status VARCHAR(20) DEFAULT 'registered', -- registered, attended, no_show, cancelled
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ==============================================================================
-- 8. VISITORS MANAGEMENT SYSTEM
-- ==============================================================================

-- Create visitors table
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  purpose_of_visit TEXT,
  host_id UUID, -- Who they're visiting
  unit_id UUID, -- Which unit they're visiting
  id_type VARCHAR(50), -- passport, drivers_license, national_id, etc.
  id_number VARCHAR(100),
  nationality VARCHAR(100),
  vehicle_license_plate VARCHAR(20),
  vehicle_type public.vehicle_type,
  photo_url TEXT, -- Visitor photo
  security_clearance VARCHAR(20) DEFAULT 'pending', -- pending, cleared, flagged, denied
  visit_type VARCHAR(20) DEFAULT 'casual', -- casual, business, service, delivery, emergency
  expected_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  expected_departure TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'expected', -- expected, checked_in, checked_out, overstayed, banned
  access_areas JSONB, -- Areas visitor is allowed to access
  emergency_contact JSONB, -- {name, phone, relationship}
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create visitor passes
CREATE TABLE IF NOT EXISTS public.visitor_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL,
  pass_number VARCHAR(50) UNIQUE NOT NULL,
  qr_code TEXT, -- QR code for scanning
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  access_gates TEXT[], -- Array of gate IDs visitor can use
  is_temporary BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  used_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 1,
  issued_by UUID NOT NULL,
  revoked_by UUID,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 9. AUTOMATED GATE CONTROL SYSTEM
-- ==============================================================================

-- Create gate access logs
CREATE TABLE IF NOT EXISTS public.gate_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  gate_id UUID NOT NULL, -- Reference to entry_gates
  access_type VARCHAR(20) NOT NULL, -- entry, exit
  access_method VARCHAR(30) NOT NULL, -- anpr, rfid, qr_code, manual, mobile_app
  user_id UUID, -- If identified user
  visitor_id UUID, -- If visitor
  vehicle_license_plate VARCHAR(20),
  vehicle_type public.vehicle_type,
  pass_number VARCHAR(50), -- Visitor pass or access card
  access_granted BOOLEAN NOT NULL,
  denial_reason TEXT, -- If access denied
  confidence_score DECIMAL(3,2), -- For ANPR recognition confidence
  image_url TEXT, -- Photo of vehicle/person
  anpr_detection_id UUID, -- Link to ANPR detection record
  gate_operator UUID, -- Manual operations
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create gate settings
CREATE TABLE IF NOT EXISTS public.gate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_id UUID NOT NULL UNIQUE,
  auto_open_for_whitelist BOOLEAN DEFAULT true,
  auto_open_for_residents BOOLEAN DEFAULT true,
  auto_open_for_staff BOOLEAN DEFAULT true,
  anpr_confidence_threshold DECIMAL(3,2) DEFAULT 0.80,
  manual_override_required BOOLEAN DEFAULT false,
  operating_hours JSONB, -- {start_time, end_time, days}
  emergency_mode BOOLEAN DEFAULT false,
  always_open BOOLEAN DEFAULT false,
  always_closed BOOLEAN DEFAULT false,
  max_wait_time_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 10. INVOICES AND BILLING SYSTEM
-- ==============================================================================

-- Create invoice templates
CREATE TABLE IF NOT EXISTS public.invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- maintenance, parking, amenity, service
  description TEXT,
  line_items JSONB NOT NULL, -- Array of default line items
  tax_rate DECIMAL(5,2) DEFAULT 0,
  due_days INTEGER DEFAULT 30,
  late_fee_percentage DECIMAL(5,2) DEFAULT 0,
  currency_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID, -- billing_customers or unit_id
  customer_type VARCHAR(20) NOT NULL, -- unit, customer, visitor
  template_id UUID,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled, refunded
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency_id UUID,
  payment_method VARCHAR(50), -- cash, card, bank_transfer, online
  payment_reference VARCHAR(100),
  paid_amount DECIMAL(12,2) DEFAULT 0,
  paid_date DATE,
  line_items JSONB NOT NULL, -- Array of invoice line items
  notes TEXT,
  terms_and_conditions TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create maintenance charges table
CREATE TABLE IF NOT EXISTS public.maintenance_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  building_id UUID,
  unit_id UUID,
  charge_category_id UUID NOT NULL,
  charge_period VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly, one_time
  charge_month INTEGER, -- 1-12 for monthly charges
  charge_year INTEGER NOT NULL,
  base_amount DECIMAL(12,2) NOT NULL,
  area_based_amount DECIMAL(12,2) DEFAULT 0, -- Per sq ft charges
  additional_charges JSONB, -- Array of additional charges
  discount_amount DECIMAL(12,2) DEFAULT 0,
  penalty_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency_id UUID,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, waived
  payment_date DATE,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  notes TEXT,
  auto_generated BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create service types table  
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- maintenance, cleaning, security, utilities
  base_rate DECIMAL(10,2),
  rate_type VARCHAR(20) DEFAULT 'fixed', -- fixed, hourly, per_unit
  currency_id UUID,
  tax_applicable BOOLEAN DEFAULT true,
  advance_booking_required BOOLEAN DEFAULT false,
  min_booking_hours INTEGER DEFAULT 24,
  max_booking_days INTEGER DEFAULT 30,
  service_duration_hours INTEGER DEFAULT 2,
  requires_approval BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 11. POLLS AND FORUMS
-- ==============================================================================

-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  poll_type VARCHAR(20) DEFAULT 'single_choice', -- single_choice, multiple_choice, rating
  options JSONB NOT NULL, -- Array of poll options
  allows_multiple_selections BOOLEAN DEFAULT false,
  anonymous_voting BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  target_audience VARCHAR(20) DEFAULT 'all', -- all, residents, owners, tenants
  min_participation INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active', -- draft, active, closed, cancelled
  total_votes INTEGER DEFAULT 0,
  results JSONB, -- Compiled results
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create poll votes
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL,
  user_id UUID NOT NULL,
  selected_options JSONB NOT NULL, -- Array of selected option indices
  vote_weight DECIMAL(3,2) DEFAULT 1.0, -- For weighted voting
  vote_date TIMESTAMPTZ DEFAULT now(),
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL,
  parent_reply_id UUID, -- For nested replies
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB, -- Array of file URLs
  likes_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT false, -- Mark as solution to the discussion
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- CREATE RLS POLICIES FOR ORGANIZATION-BASED ACCESS
-- ==============================================================================

-- Currencies (Global access for reading, admin manage)
CREATE POLICY "Anyone can view currencies" ON public.currencies FOR SELECT USING (true);
CREATE POLICY "Platform admins can manage currencies" ON public.currencies FOR ALL USING (get_user_role() = 'platform_admin');

-- Staff Management Policies
CREATE POLICY "Admins can manage departments in their organization" ON public.departments FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view departments in their organization" ON public.departments FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage staff in their organization" ON public.staff FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view staff in their organization" ON public.staff FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Staff can view their own shifts" ON public.staff_shifts FOR SELECT 
USING (staff_id IN (SELECT id FROM staff WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Admins can manage shifts in their organization" ON public.staff_shifts FOR ALL 
USING (staff_id IN (SELECT id FROM staff WHERE organization_id = get_user_organization_id()) 
       AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

-- Document Management Policies
CREATE POLICY "Admins can manage document categories in their organization" ON public.document_categories FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view document categories in their organization" ON public.document_categories FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view documents in their organization" ON public.documents FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can upload documents" ON public.documents FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all documents in their organization" ON public.documents FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

-- Helpdesk Policies
CREATE POLICY "Admins can manage ticket categories in their organization" ON public.ticket_categories FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view ticket categories in their organization" ON public.ticket_categories FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create tickets in their organization" ON public.tickets FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND created_by = auth.uid());

CREATE POLICY "Users can view their own tickets" ON public.tickets FOR SELECT 
USING (organization_id = get_user_organization_id() AND (created_by = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator'])));

CREATE POLICY "Admins can manage all tickets in their organization" ON public.tickets FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator']));

CREATE POLICY "Users can add comments to tickets they can access" ON public.ticket_comments FOR INSERT 
WITH CHECK (ticket_id IN (SELECT id FROM tickets WHERE organization_id = get_user_organization_id()) AND author_id = auth.uid());

CREATE POLICY "Users can view comments on tickets they can access" ON public.ticket_comments FOR SELECT 
USING (ticket_id IN (SELECT id FROM tickets WHERE organization_id = get_user_organization_id()));

-- Parking Management Policies  
CREATE POLICY "Admins can manage parking zones in their organization" ON public.parking_zones FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view parking zones in their organization" ON public.parking_zones FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage parking slots" ON public.parking_slots FOR ALL 
USING (zone_id IN (SELECT id FROM parking_zones WHERE organization_id = get_user_organization_id()) 
       AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view parking slots" ON public.parking_slots FOR SELECT 
USING (zone_id IN (SELECT id FROM parking_zones WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Users can create parking bookings" ON public.parking_bookings FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND user_id = auth.uid());

CREATE POLICY "Users can view their own parking bookings" ON public.parking_bookings FOR SELECT 
USING (organization_id = get_user_organization_id() AND (user_id = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator'])));

CREATE POLICY "Admins can manage all parking bookings" ON public.parking_bookings FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator']));

-- Asset Management Policies
CREATE POLICY "Admins can manage asset categories in their organization" ON public.asset_categories FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view asset categories in their organization" ON public.asset_categories FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage assets in their organization" ON public.assets FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view assets in their organization" ON public.assets FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage asset maintenance records" ON public.asset_maintenance FOR ALL 
USING (asset_id IN (SELECT id FROM assets WHERE organization_id = get_user_organization_id()) 
       AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view asset maintenance records" ON public.asset_maintenance FOR SELECT 
USING (asset_id IN (SELECT id FROM assets WHERE organization_id = get_user_organization_id()));

-- Events Management Policies
CREATE POLICY "Admins can manage event categories in their organization" ON public.event_categories FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view event categories in their organization" ON public.event_categories FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create events in their organization" ON public.events FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND organizer_id = auth.uid());

CREATE POLICY "Users can view events in their organization" ON public.events FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Organizers can update their own events" ON public.events FOR UPDATE 
USING (organization_id = get_user_organization_id() AND organizer_id = auth.uid());

CREATE POLICY "Admins can manage all events in their organization" ON public.events FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT 
WITH CHECK (event_id IN (SELECT id FROM events WHERE organization_id = get_user_organization_id()) AND user_id = auth.uid());

CREATE POLICY "Users can view their own event registrations" ON public.event_registrations FOR SELECT 
USING (event_id IN (SELECT id FROM events WHERE organization_id = get_user_organization_id()) 
       AND (user_id = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin'])));

-- Visitors Management Policies
CREATE POLICY "Admins can manage visitors in their organization" ON public.visitors FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator']));

CREATE POLICY "Users can view visitors they created" ON public.visitors FOR SELECT 
USING (organization_id = get_user_organization_id() AND (created_by = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator'])));

CREATE POLICY "Admins can manage visitor passes" ON public.visitor_passes FOR ALL 
USING (visitor_id IN (SELECT id FROM visitors WHERE organization_id = get_user_organization_id()) 
       AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator']));

CREATE POLICY "Users can view visitor passes" ON public.visitor_passes FOR SELECT 
USING (visitor_id IN (SELECT id FROM visitors WHERE organization_id = get_user_organization_id()));

-- Gate Access Policies
CREATE POLICY "Admins can manage gate access logs in their organization" ON public.gate_access_logs FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin', 'operator']));

CREATE POLICY "Users can view gate access logs in their organization" ON public.gate_access_logs FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage gate settings" ON public.gate_settings FOR ALL 
USING (gate_id IN (SELECT eg.id FROM entry_gates eg JOIN buildings b ON eg.building_id = b.id JOIN locations l ON b.location_id = l.id WHERE l.organization_id = get_user_organization_id()) 
       AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view gate settings" ON public.gate_settings FOR SELECT 
USING (gate_id IN (SELECT eg.id FROM entry_gates eg JOIN buildings b ON eg.building_id = b.id JOIN locations l ON b.location_id = l.id WHERE l.organization_id = get_user_organization_id()));

-- Billing Policies
CREATE POLICY "Admins can manage invoice templates in their organization" ON public.invoice_templates FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view invoice templates in their organization" ON public.invoice_templates FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage invoices in their organization" ON public.invoices FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view invoices in their organization" ON public.invoices FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage maintenance charges in their organization" ON public.maintenance_charges FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view maintenance charges in their organization" ON public.maintenance_charges FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage service types in their organization" ON public.service_types FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can view service types in their organization" ON public.service_types FOR SELECT 
USING (organization_id = get_user_organization_id());

-- Polls and Forums Policies
CREATE POLICY "Users can create polls in their organization" ON public.polls FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND created_by = auth.uid());

CREATE POLICY "Users can view polls in their organization" ON public.polls FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Creators can update their own polls" ON public.polls FOR UPDATE 
USING (organization_id = get_user_organization_id() AND created_by = auth.uid());

CREATE POLICY "Admins can manage all polls in their organization" ON public.polls FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin', 'franchise_admin', 'customer_admin']));

CREATE POLICY "Users can vote on polls" ON public.poll_votes FOR INSERT 
WITH CHECK (poll_id IN (SELECT id FROM polls WHERE organization_id = get_user_organization_id()) AND user_id = auth.uid());

CREATE POLICY "Users can view poll votes" ON public.poll_votes FOR SELECT 
USING (poll_id IN (SELECT id FROM polls WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Users can reply to forum discussions" ON public.forum_replies FOR INSERT 
WITH CHECK (discussion_id IN (SELECT id FROM forum_discussions WHERE organization_id = get_user_organization_id()) AND author_id = auth.uid());

CREATE POLICY "Users can view forum replies" ON public.forum_replies FOR SELECT 
USING (discussion_id IN (SELECT id FROM forum_discussions WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Users can update their own forum replies" ON public.forum_replies FOR UPDATE 
USING (discussion_id IN (SELECT id FROM forum_discussions WHERE organization_id = get_user_organization_id()) AND author_id = auth.uid());

-- ==============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Currencies
CREATE INDEX idx_currencies_code ON public.currencies(code);
CREATE INDEX idx_currencies_active ON public.currencies(is_active);

-- Staff Management
CREATE INDEX idx_departments_organization ON public.departments(organization_id);
CREATE INDEX idx_staff_organization ON public.staff(organization_id);
CREATE INDEX idx_staff_department ON public.staff(department_id);
CREATE INDEX idx_staff_employee_id ON public.staff(employee_id);
CREATE INDEX idx_staff_email ON public.staff(email);
CREATE INDEX idx_staff_shifts_staff_date ON public.staff_shifts(staff_id, shift_date);

-- Document Management
CREATE INDEX idx_document_categories_organization ON public.document_categories(organization_id);
CREATE INDEX idx_documents_organization ON public.documents(organization_id);
CREATE INDEX idx_documents_category ON public.documents(category_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(tags);

-- Helpdesk
CREATE INDEX idx_ticket_categories_organization ON public.ticket_categories(organization_id);
CREATE INDEX idx_tickets_organization ON public.tickets(organization_id);
CREATE INDEX idx_tickets_number ON public.tickets(ticket_number);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_ticket_comments_ticket ON public.ticket_comments(ticket_id);

-- Parking Management
CREATE INDEX idx_parking_zones_organization ON public.parking_zones(organization_id);
CREATE INDEX idx_parking_slots_zone ON public.parking_slots(zone_id);
CREATE INDEX idx_parking_bookings_organization ON public.parking_bookings(organization_id);
CREATE INDEX idx_parking_bookings_user ON public.parking_bookings(user_id);
CREATE INDEX idx_parking_bookings_slot ON public.parking_bookings(slot_id);
CREATE INDEX idx_parking_bookings_dates ON public.parking_bookings(start_time, end_time);

-- Asset Management
CREATE INDEX idx_asset_categories_organization ON public.asset_categories(organization_id);
CREATE INDEX idx_assets_organization ON public.assets(organization_id);
CREATE INDEX idx_assets_category ON public.assets(category_id);
CREATE INDEX idx_assets_tag ON public.assets(asset_tag);
CREATE INDEX idx_assets_location ON public.assets(location_id);
CREATE INDEX idx_asset_maintenance_asset ON public.asset_maintenance(asset_id);
CREATE INDEX idx_asset_maintenance_date ON public.asset_maintenance(performed_date);

-- Events Management
CREATE INDEX idx_event_categories_organization ON public.event_categories(organization_id);
CREATE INDEX idx_events_organization ON public.events(organization_id);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_dates ON public.events(start_time, end_time);
CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);

-- Visitors Management
CREATE INDEX idx_visitors_organization ON public.visitors(organization_id);
CREATE INDEX idx_visitors_host ON public.visitors(host_id);
CREATE INDEX idx_visitors_status ON public.visitors(status);
CREATE INDEX idx_visitors_dates ON public.visitors(expected_arrival, actual_departure);
CREATE INDEX idx_visitor_passes_visitor ON public.visitor_passes(visitor_id);
CREATE INDEX idx_visitor_passes_number ON public.visitor_passes(pass_number);

-- Gate Access
CREATE INDEX idx_gate_access_logs_organization ON public.gate_access_logs(organization_id);
CREATE INDEX idx_gate_access_logs_gate ON public.gate_access_logs(gate_id);
CREATE INDEX idx_gate_access_logs_timestamp ON public.gate_access_logs(timestamp);
CREATE INDEX idx_gate_access_logs_license ON public.gate_access_logs(vehicle_license_plate);

-- Billing
CREATE INDEX idx_invoice_templates_organization ON public.invoice_templates(organization_id);
CREATE INDEX idx_invoices_organization ON public.invoices(organization_id);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_maintenance_charges_organization ON public.maintenance_charges(organization_id);
CREATE INDEX idx_maintenance_charges_unit ON public.maintenance_charges(unit_id);
CREATE INDEX idx_maintenance_charges_period ON public.maintenance_charges(charge_year, charge_month);
CREATE INDEX idx_service_types_organization ON public.service_types(organization_id);

-- Polls and Forums
CREATE INDEX idx_polls_organization ON public.polls(organization_id);
CREATE INDEX idx_polls_created_by ON public.polls(created_by);
CREATE INDEX idx_polls_status ON public.polls(status);
CREATE INDEX idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON public.poll_votes(user_id);
CREATE INDEX idx_forum_replies_discussion ON public.forum_replies(discussion_id);
CREATE INDEX idx_forum_replies_author ON public.forum_replies(author_id);

-- ==============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ==============================================================================

-- Add triggers for updated_at columns
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON public.currencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_shifts_updated_at BEFORE UPDATE ON public.staff_shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_document_categories_updated_at BEFORE UPDATE ON public.document_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ticket_categories_updated_at BEFORE UPDATE ON public.ticket_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON public.ticket_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parking_zones_updated_at BEFORE UPDATE ON public.parking_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parking_slots_updated_at BEFORE UPDATE ON public.parking_slots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parking_bookings_updated_at BEFORE UPDATE ON public.parking_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON public.asset_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_asset_maintenance_updated_at BEFORE UPDATE ON public.asset_maintenance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_categories_updated_at BEFORE UPDATE ON public.event_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON public.visitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visitor_passes_updated_at BEFORE UPDATE ON public.visitor_passes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gate_settings_updated_at BEFORE UPDATE ON public.gate_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON public.invoice_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_charges_updated_at BEFORE UPDATE ON public.maintenance_charges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();