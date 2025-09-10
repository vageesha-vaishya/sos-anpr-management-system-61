-- Fix sample data with correct enum values

-- Insert sample organizations using correct organization_type enum values
INSERT INTO organizations (id, name, organization_type) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society', 'customer'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sunrise Apartments', 'customer')
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

-- Insert sample society units with correct status values
INSERT INTO society_units (id, building_id, unit_number, unit_type, floor_number, carpet_area, status)
VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'A101', '2bhk', 1, 850.00, 'available'),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'A102', '3bhk', 1, 1200.00, 'available'),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'B201', '2bhk', 2, 900.00, 'available')
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles with proper phone numbers
UPDATE profiles 
SET phone = CASE 
  WHEN email = 'bahuguna.vimal@gmail.com' THEN '+91-9876543210'
  WHEN email LIKE '%@example.com' THEN '+91-' || (9876543210 + (random() * 1000)::int)::text
  ELSE phone
END
WHERE phone IS NULL OR phone = '';

-- Insert sample profiles with proper phone numbers using correct role enum
INSERT INTO profiles (id, email, full_name, role, organization_id, phone)
VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', 'john.doe@greenvalley.com', 'John Doe', 'resident', '550e8400-e29b-41d4-a716-446655440001', '+91-9876543211'),
  ('990e8400-e29b-41d4-a716-446655440002', 'jane.smith@greenvalley.com', 'Jane Smith', 'resident', '550e8400-e29b-41d4-a716-446655440001', '+91-9876543212'),
  ('990e8400-e29b-41d4-a716-446655440003', 'mike.wilson@sunrise.com', 'Mike Wilson', 'resident', '550e8400-e29b-41d4-a716-446655440002', '+91-9876543213')
ON CONFLICT (id) DO NOTHING;