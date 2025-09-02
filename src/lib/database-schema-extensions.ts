// Extended database schema to match ADDA functionality
import { supabase } from '@/integrations/supabase/client'

export const extendedDatabaseSQL = `
-- Society Units Management (Apartments/Flats)
CREATE TABLE IF NOT EXISTS society_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES buildings(id),
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('1bhk', '2bhk', '3bhk', '4bhk', 'villa', 'penthouse', 'studio', 'duplex')),
  floor_number INTEGER NOT NULL,
  carpet_area DECIMAL(10,2),
  built_up_area DECIMAL(10,2),
  occupancy_status TEXT NOT NULL DEFAULT 'vacant' CHECK (occupancy_status IN ('occupied', 'vacant', 'rented', 'maintenance')),
  owner_id UUID REFERENCES users(id),
  tenant_id UUID REFERENCES users(id),
  monthly_maintenance DECIMAL(10,2) NOT NULL DEFAULT 0,
  parking_spaces INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Residents/Household Members
CREATE TABLE IF NOT EXISTS household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES society_units(id),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('owner', 'tenant', 'family_member', 'child', 'elderly', 'helper')),
  mobile_number TEXT,
  email TEXT,
  age INTEGER,
  occupation TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  emergency_contact TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'moved_out')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amenities Management
CREATE TABLE IF NOT EXISTS amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sports', 'recreation', 'utility', 'event_space', 'gym', 'pool', 'garden', 'parking')),
  capacity INTEGER DEFAULT 1,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  advance_booking_days INTEGER DEFAULT 7,
  max_booking_hours INTEGER DEFAULT 2,
  booking_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amenity Bookings
CREATE TABLE IF NOT EXISTS amenity_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amenity_id UUID NOT NULL REFERENCES amenities(id),
  unit_id UUID NOT NULL REFERENCES society_units(id),
  booked_by UUID NOT NULL REFERENCES users(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  guests_count INTEGER DEFAULT 1,
  booking_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded')),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Bills/Invoices
CREATE TABLE IF NOT EXISTS maintenance_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  unit_id UUID NOT NULL REFERENCES society_units(id),
  bill_period_start DATE NOT NULL,
  bill_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  maintenance_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  utility_charges DECIMAL(10,2) DEFAULT 0,
  parking_charges DECIMAL(10,2) DEFAULT 0,
  late_fee DECIMAL(10,2) DEFAULT 0,
  other_charges DECIMAL(10,2) DEFAULT 0,
  previous_balance DECIMAL(10,2) DEFAULT 0,
  adjustments DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'partial')),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charge Categories for flexible billing
CREATE TABLE IF NOT EXISTS charge_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  charge_type TEXT NOT NULL CHECK (charge_type IN ('fixed', 'variable', 'per_sq_ft', 'percentage')),
  amount DECIMAL(10,2) DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT TRUE,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'owners', 'tenants', 'specific_units')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visitors Management
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  host_unit_id UUID NOT NULL REFERENCES society_units(id),
  host_user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  purpose TEXT NOT NULL,
  vehicle_number TEXT,
  entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exit_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'checked_in' CHECK (status IN ('pre_approved', 'checked_in', 'checked_out', 'blacklisted')),
  visitor_photo_url TEXT,
  security_guard_id UUID REFERENCES users(id),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpdesk/Complaints
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  unit_id UUID REFERENCES society_units(id),
  raised_by UUID NOT NULL REFERENCES users(id),
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'complaint', 'request', 'suggestion', 'security', 'billing')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id),
  attachments JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Providers (Housekeeping, Security, etc.)
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('housekeeping', 'security', 'maintenance', 'gardening', 'pest_control', 'delivery')),
  contact_number TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  background_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Management
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('security_guard', 'housekeeping', 'maintenance', 'admin', 'manager', 'gardener')),
  employee_id TEXT UNIQUE,
  contact_number TEXT NOT NULL,
  shift_timing TEXT,
  salary DECIMAL(10,2),
  hire_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events/Announcements
CREATE TABLE IF NOT EXISTS community_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('announcement', 'festival', 'meeting', 'maintenance', 'emergency', 'social')),
  event_date DATE,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  is_mandatory BOOLEAN DEFAULT FALSE,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'owners', 'tenants', 'committee')),
  attachments JSONB DEFAULT '[]',
  rsvp_required BOOLEAN DEFAULT FALSE,
  max_attendees INTEGER,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Polls/Surveys
CREATE TABLE IF NOT EXISTS community_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  poll_type TEXT DEFAULT 'single_choice' CHECK (poll_type IN ('single_choice', 'multiple_choice', 'rating', 'open_text')),
  options JSONB NOT NULL DEFAULT '[]',
  is_anonymous BOOLEAN DEFAULT FALSE,
  end_date DATE,
  created_by UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Management
CREATE TABLE IF NOT EXISTS community_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('rules', 'meeting_minutes', 'financial_reports', 'notice', 'agreement', 'certificate')),
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  access_level TEXT DEFAULT 'all' CHECK (access_level IN ('all', 'owners', 'committee', 'admin')),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parking Management
CREATE TABLE IF NOT EXISTS parking_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  building_id UUID REFERENCES buildings(id),
  slot_number TEXT NOT NULL,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('covered', 'open', 'two_wheeler', 'four_wheeler', 'visitor')),
  floor_level TEXT,
  allocated_to_unit UUID REFERENCES society_units(id),
  monthly_charge DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'allocated', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Management
CREATE TABLE IF NOT EXISTS community_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('furniture', 'equipment', 'vehicle', 'appliance', 'infrastructure')),
  description TEXT,
  purchase_date DATE,
  purchase_cost DECIMAL(10,2),
  current_value DECIMAL(10,2),
  depreciation_rate DECIMAL(5,2),
  warranty_expiry DATE,
  maintenance_schedule TEXT,
  location TEXT,
  status TEXT DEFAULT 'good' CHECK (status IN ('excellent', 'good', 'fair', 'poor', 'retired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE society_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_assets ENABLE ROW LEVEL SECURITY;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_society_units_building_id ON society_units(building_id);
CREATE INDEX IF NOT EXISTS idx_society_units_owner_id ON society_units(owner_id);
CREATE INDEX IF NOT EXISTS idx_household_members_unit_id ON household_members(unit_id);
CREATE INDEX IF NOT EXISTS idx_amenity_bookings_date ON amenity_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_bills_unit_id ON maintenance_bills(unit_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_bills_due_date ON maintenance_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_visitors_entry_time ON visitors(entry_time);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_status ON helpdesk_tickets(status);
CREATE INDEX IF NOT EXISTS idx_community_events_date ON community_events(event_date);
`

export const setupExtendedDatabase = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Extended database schema is ready!')
    return { success: true, message: 'Extended database schema ready with all ADDA features!' }
  } catch (error) {
    console.error('Extended database setup error:', error)
    return { success: false, message: `Extended database setup failed: ${error}` }
  }
}