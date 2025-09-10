-- Add sample data without profiles (to avoid foreign key constraints)

-- Insert sample organizations
INSERT INTO organizations (id, name, organization_type) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society', 'customer'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sunrise Apartments', 'customer')
ON CONFLICT (id) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (id, organization_id, name, address, city_id)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Green Valley Location', '123 Green Valley Road, Mumbai, Maharashtra, India 400001', NULL),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Sunrise Location', '456 Sunrise Boulevard, Delhi, Delhi, India 110001', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample buildings
INSERT INTO buildings (id, location_id, name, building_type, floors)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Tower A', 'residential', 10),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'Tower B', 'residential', 15)
ON CONFLICT (id) DO NOTHING;

-- Insert sample society units with correct schema columns
INSERT INTO society_units (id, building_id, unit_number, unit_type, floor, area_sqft, bedrooms, bathrooms, status, is_occupied)
VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'A101', '2bhk', 1, 850, 2, 2, 'available', false),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'A102', '3bhk', 1, 1200, 3, 2, 'available', false),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'B201', '2bhk', 2, 900, 2, 2, 'available', false),
  ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 'A103', '1bhk', 1, 600, 1, 1, 'maintenance', false),
  ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'B202', '3bhk', 2, 1100, 3, 2, 'available', false)
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles with phone numbers (only for existing users)
UPDATE profiles 
SET phone = CASE 
  WHEN email = 'bahuguna.vimal@gmail.com' THEN '+91-9876543210'
  WHEN phone IS NULL OR phone = '' THEN '+91-9876543' || LPAD((random() * 1000)::int::text, 3, '0')
  ELSE phone
END
WHERE phone IS NULL OR phone = '';