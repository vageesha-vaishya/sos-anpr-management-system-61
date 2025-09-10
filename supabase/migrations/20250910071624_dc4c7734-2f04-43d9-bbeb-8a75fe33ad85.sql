-- Add sample data for society members with proper phone number fields
-- Use correct organization table structure (is_active instead of status)

-- Insert sample organizations if they don't exist
INSERT INTO organizations (id, name, organization_type, is_active) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society', 'society', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sunrise Apartments', 'society', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (id, organization_id, address_line_1, city, state, country, postal_code)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '123 Green Valley Road', 'Mumbai', 'Maharashtra', 'India', '400001'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '456 Sunrise Boulevard', 'Delhi', 'Delhi', 'India', '110001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample buildings
INSERT INTO buildings (id, location_id, name, building_type, floors)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Tower A', 'residential', 10),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'Tower B', 'residential', 15)
ON CONFLICT (id) DO NOTHING;

-- Insert sample society units
INSERT INTO society_units (id, building_id, unit_number, unit_type, floor_number, carpet_area, status)
VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'A101', '2bhk', 1, 850.00, 'available'),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'A102', '3bhk', 1, 1200.00, 'available'),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'B201', '2bhk', 2, 900.00, 'available')
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles with proper phone numbers (using phone field)
UPDATE profiles 
SET phone = CASE 
  WHEN email = 'bahuguna.vimal@gmail.com' THEN '+91-9876543210'
  WHEN email LIKE '%@example.com' THEN '+91-' || (9876543210 + (random() * 1000)::int)::text
  ELSE phone
END
WHERE phone IS NULL OR phone = '';

-- Insert sample profiles with proper phone numbers
INSERT INTO profiles (id, email, full_name, role, organization_id, status, phone)
VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', 'john.doe@greenvalley.com', 'John Doe', 'resident', '550e8400-e29b-41d4-a716-446655440001', 'active', '+91-9876543211'),
  ('990e8400-e29b-41d4-a716-446655440002', 'jane.smith@greenvalley.com', 'Jane Smith', 'owner', '550e8400-e29b-41d4-a716-446655440001', 'active', '+91-9876543212'),
  ('990e8400-e29b-41d4-a716-446655440003', 'mike.wilson@sunrise.com', 'Mike Wilson', 'tenant', '550e8400-e29b-41d4-a716-446655440002', 'active', '+91-9876543213')
ON CONFLICT (id) DO NOTHING;

-- Insert sample unit assignments
INSERT INTO unit_assignments (id, unit_id, user_id, assignment_type, start_date, status)
VALUES 
  ('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'primary', '2024-01-15', 'active'),
  ('aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 'primary', '2024-02-01', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample household members (using phone_number field as per table schema)
INSERT INTO household_members (id, unit_id, primary_resident_id, full_name, relationship, phone_number, date_of_birth, occupation)
VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'Mary Doe', 'spouse', '+91-9876543214', '1985-05-20', 'Teacher'),
  ('bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'Tommy Doe', 'child', '+91-9876543215', '2010-08-15', 'Student'),
  ('bb0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 'Robert Smith', 'spouse', '+91-9876543216', '1982-12-10', 'Engineer')
ON CONFLICT (id) DO NOTHING;