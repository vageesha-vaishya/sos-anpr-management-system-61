-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE organization_type AS ENUM ('platform', 'franchise', 'customer');
CREATE TYPE subscription_plan AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE user_role AS ENUM ('platform_admin', 'franchise_admin', 'customer_admin', 'operator', 'resident');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE building_type AS ENUM ('office', 'residential', 'commercial', 'industrial');
CREATE TYPE gate_type AS ENUM ('main', 'visitor', 'service', 'emergency');
CREATE TYPE vehicle_type AS ENUM ('car', 'motorcycle', 'truck', 'van', 'bus');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_type AS ENUM ('system', 'security', 'maintenance', 'detection');
CREATE TYPE badge_template_type AS ENUM ('visitor', 'emergency', 'vip', 'contractor');

-- Geography tables
CREATE TABLE continents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(2) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  continent_id UUID REFERENCES continents(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(3) NOT NULL UNIQUE,
  phone_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  organization_type organization_type NOT NULL,
  subscription_plan subscription_plan DEFAULT 'basic',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  city_id UUID REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'resident',
  permissions TEXT[],
  status user_status DEFAULT 'active',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city_id UUID REFERENCES cities(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  building_type building_type NOT NULL,
  floors INTEGER DEFAULT 1,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entry gates
CREATE TABLE entry_gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  gate_type gate_type NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cameras
CREATE TABLE cameras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_gate_id UUID REFERENCES entry_gates(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  ip_address INET NOT NULL,
  rtsp_url TEXT,
  username VARCHAR(100),
  password VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle whitelist
CREATE TABLE vehicle_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  license_plate VARCHAR(20) NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  owner_name VARCHAR(200),
  owner_phone VARCHAR(20),
  owner_email VARCHAR(255),
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle blacklist
CREATE TABLE vehicle_blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  license_plate VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  reported_by VARCHAR(200),
  incident_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  alert_type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badge templates
CREATE TABLE badge_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  template_type badge_template_type NOT NULL,
  design_config JSONB NOT NULL DEFAULT '{}',
  security_features JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Society units
CREATE TABLE society_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number VARCHAR(50) NOT NULL,
  floor INTEGER,
  unit_type VARCHAR(50),
  area_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  owner_name VARCHAR(200),
  owner_phone VARCHAR(20),
  owner_email VARCHAR(255),
  tenant_name VARCHAR(200),
  tenant_phone VARCHAR(20),
  tenant_email VARCHAR(255),
  monthly_maintenance DECIMAL(10, 2),
  is_occupied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_units ENABLE ROW LEVEL SECURITY;

-- Create security definer functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Geography RLS policies (public read access)
CREATE POLICY "Anyone can view continents" ON continents FOR SELECT USING (true);
CREATE POLICY "Anyone can view countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Anyone can view states" ON states FOR SELECT USING (true);
CREATE POLICY "Anyone can view cities" ON cities FOR SELECT USING (true);

-- Organizations policies
CREATE POLICY "Platform admins can manage all organizations" ON organizations
  FOR ALL USING (get_user_role() = 'platform_admin');

CREATE POLICY "Franchise admins can view their organizations" ON organizations
  FOR SELECT USING (
    get_user_role() = 'franchise_admin' AND 
    (id = get_user_organization_id() OR parent_id = get_user_organization_id())
  );

CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id = get_user_organization_id());

-- Profiles policies
CREATE POLICY "Platform admins can manage all profiles" ON profiles
  FOR ALL USING (get_user_role() = 'platform_admin');

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Franchise admins can view profiles in their organization tree" ON profiles
  FOR SELECT USING (
    get_user_role() = 'franchise_admin' AND
    organization_id IN (
      SELECT id FROM organizations 
      WHERE id = get_user_organization_id() OR parent_id = get_user_organization_id()
    )
  );

-- Locations policies
CREATE POLICY "Users can view locations in their organization" ON locations
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage locations in their organization" ON locations
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin')
  );

-- Buildings policies
CREATE POLICY "Users can view buildings in their organization" ON buildings
  FOR SELECT USING (
    location_id IN (
      SELECT id FROM locations WHERE organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Admins can manage buildings in their organization" ON buildings
  FOR ALL USING (
    location_id IN (
      SELECT id FROM locations WHERE organization_id = get_user_organization_id()
    ) AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin')
  );

-- Entry gates policies
CREATE POLICY "Users can view entry gates in their organization" ON entry_gates
  FOR SELECT USING (
    building_id IN (
      SELECT b.id FROM buildings b
      JOIN locations l ON b.location_id = l.id
      WHERE l.organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Admins can manage entry gates in their organization" ON entry_gates
  FOR ALL USING (
    building_id IN (
      SELECT b.id FROM buildings b
      JOIN locations l ON b.location_id = l.id
      WHERE l.organization_id = get_user_organization_id()
    ) AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin')
  );

-- Cameras policies
CREATE POLICY "Users can view cameras in their organization" ON cameras
  FOR SELECT USING (
    entry_gate_id IN (
      SELECT eg.id FROM entry_gates eg
      JOIN buildings b ON eg.building_id = b.id
      JOIN locations l ON b.location_id = l.id
      WHERE l.organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Admins can manage cameras in their organization" ON cameras
  FOR ALL USING (
    entry_gate_id IN (
      SELECT eg.id FROM entry_gates eg
      JOIN buildings b ON eg.building_id = b.id
      JOIN locations l ON b.location_id = l.id
      WHERE l.organization_id = get_user_organization_id()
    ) AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin')
  );

-- Vehicle whitelist policies
CREATE POLICY "Users can view vehicle whitelist in their organization" ON vehicle_whitelist
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage vehicle whitelist in their organization" ON vehicle_whitelist
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin', 'operator')
  );

-- Vehicle blacklist policies
CREATE POLICY "Users can view vehicle blacklist in their organization" ON vehicle_blacklist
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage vehicle blacklist in their organization" ON vehicle_blacklist
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin', 'operator')
  );

-- Alerts policies
CREATE POLICY "Users can view alerts in their organization" ON alerts
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage alerts in their organization" ON alerts
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin', 'operator')
  );

-- Badge templates policies
CREATE POLICY "Users can view badge templates in their organization" ON badge_templates
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage badge templates in their organization" ON badge_templates
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin')
  );

-- Society units policies
CREATE POLICY "Users can view society units in their organization" ON society_units
  FOR SELECT USING (
    building_id IN (
      SELECT b.id FROM buildings b
      JOIN locations l ON b.location_id = l.id
      WHERE l.organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Admins can manage society units in their organization" ON society_units
  FOR ALL USING (
    building_id IN (
      SELECT b.id FROM buildings b
      JOIN locations l ON b.location_id = l.id
      WHERE l.organization_id = get_user_organization_id()
    ) AND
    get_user_role() IN ('platform_admin', 'franchise_admin', 'customer_admin')
  );

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables
CREATE TRIGGER update_continents_updated_at BEFORE UPDATE ON continents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entry_gates_updated_at BEFORE UPDATE ON entry_gates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_whitelist_updated_at BEFORE UPDATE ON vehicle_whitelist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_blacklist_updated_at BEFORE UPDATE ON vehicle_blacklist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badge_templates_updated_at BEFORE UPDATE ON badge_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_society_units_updated_at BEFORE UPDATE ON society_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'bahuguna.vimal@gmail.com' THEN 'platform_admin'::user_role
      ELSE 'resident'::user_role
    END,
    CASE 
      WHEN NEW.email = 'bahuguna.vimal@gmail.com' THEN (SELECT id FROM organizations WHERE organization_type = 'platform' LIMIT 1)
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert demo data
INSERT INTO continents (name, code) VALUES 
  ('Asia', 'AS'),
  ('Europe', 'EU'),
  ('North America', 'NA');

INSERT INTO countries (continent_id, name, code, phone_code) VALUES 
  ((SELECT id FROM continents WHERE code = 'AS'), 'India', 'IND', '+91'),
  ((SELECT id FROM continents WHERE code = 'EU'), 'United Kingdom', 'GBR', '+44'),
  ((SELECT id FROM continents WHERE code = 'NA'), 'United States', 'USA', '+1');

INSERT INTO states (country_id, name, code) VALUES 
  ((SELECT id FROM countries WHERE code = 'IND'), 'Delhi', 'DL'),
  ((SELECT id FROM countries WHERE code = 'IND'), 'Maharashtra', 'MH'),
  ((SELECT id FROM countries WHERE code = 'GBR'), 'England', 'ENG'),
  ((SELECT id FROM countries WHERE code = 'USA'), 'California', 'CA');

INSERT INTO cities (state_id, name, postal_code) VALUES 
  ((SELECT id FROM states WHERE code = 'DL'), 'New Delhi', '110001'),
  ((SELECT id FROM states WHERE code = 'MH'), 'Mumbai', '400001'),
  ((SELECT id FROM states WHERE code = 'ENG'), 'London', 'SW1A 1AA'),
  ((SELECT id FROM states WHERE code = 'CA'), 'San Francisco', '94102');

-- Insert demo organizations
INSERT INTO organizations (id, name, organization_type, subscription_plan, contact_email, city_id) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'ADDA Platform', 'platform', 'enterprise', 'platform@adda.io', (SELECT id FROM cities WHERE name = 'New Delhi')),
  ('00000000-0000-0000-0000-000000000002', 'North India Franchise', 'franchise', 'premium', 'north@adda.io', (SELECT id FROM cities WHERE name = 'New Delhi')),
  ('00000000-0000-0000-0000-000000000003', 'Green Valley Society', 'customer', 'basic', 'admin@greenvalley.in', (SELECT id FROM cities WHERE name = 'New Delhi'));

-- Set parent relationships
UPDATE organizations SET parent_id = '00000000-0000-0000-0000-000000000001' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE organizations SET parent_id = '00000000-0000-0000-0000-000000000002' WHERE id = '00000000-0000-0000-0000-000000000003';

-- Insert demo location
INSERT INTO locations (organization_id, name, address, city_id) VALUES 
  ('00000000-0000-0000-0000-000000000003', 'Green Valley Main Campus', 'Sector 18, Noida, UP', (SELECT id FROM cities WHERE name = 'New Delhi'));

-- Insert demo building
INSERT INTO buildings (location_id, name, building_type) VALUES 
  ((SELECT id FROM locations WHERE name = 'Green Valley Main Campus'), 'Tower A', 'residential');

-- Insert demo entry gate
INSERT INTO entry_gates (building_id, name, gate_type) VALUES 
  ((SELECT id FROM buildings WHERE name = 'Tower A'), 'Main Entrance', 'main');

-- Insert demo camera
INSERT INTO cameras (entry_gate_id, name, ip_address) VALUES 
  ((SELECT id FROM entry_gates WHERE name = 'Main Entrance'), 'Main Gate Camera 1', '192.168.1.100');