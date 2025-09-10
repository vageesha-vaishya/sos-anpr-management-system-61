-- Add sample data for society members with proper phone number fields
-- Use correct organization_type enum values

-- Insert sample organizations with proper organization_type
INSERT INTO organizations (id, name, organization_type, is_active) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society', 'customer', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sunrise Apartments', 'customer', true)
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles with proper phone numbers (using phone field)
UPDATE profiles 
SET phone = CASE 
  WHEN email = 'bahuguna.vimal@gmail.com' THEN '+91-9876543210'
  WHEN phone IS NULL OR phone = '' THEN '+91-987654' || LPAD((RANDOM() * 10000)::int::text, 4, '0')
  ELSE phone
END
WHERE phone IS NULL OR phone = '' OR email = 'bahuguna.vimal@gmail.com';

-- Insert sample profiles with proper phone numbers
INSERT INTO profiles (id, email, full_name, role, organization_id, status, phone)
VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', 'john.doe@greenvalley.com', 'John Doe', 'resident', '550e8400-e29b-41d4-a716-446655440001', 'active', '+91-9876543211'),
  ('990e8400-e29b-41d4-a716-446655440002', 'jane.smith@greenvalley.com', 'Jane Smith', 'resident', '550e8400-e29b-41d4-a716-446655440001', 'active', '+91-9876543212'),
  ('990e8400-e29b-41d4-a716-446655440003', 'mike.wilson@sunrise.com', 'Mike Wilson', 'resident', '550e8400-e29b-41d4-a716-446655440002', 'active', '+91-9876543213')
ON CONFLICT (id) DO NOTHING;