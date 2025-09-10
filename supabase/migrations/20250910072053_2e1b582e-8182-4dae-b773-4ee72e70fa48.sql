-- Simple fix: Update existing profiles with proper phone numbers and add sample organizations

-- Insert sample organizations with proper organization_type
INSERT INTO organizations (id, name, organization_type, is_active) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Green Valley Society', 'customer', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sunrise Apartments', 'customer', true)
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles with proper phone numbers (using phone field)
UPDATE profiles 
SET 
  phone = CASE 
    WHEN email = 'bahuguna.vimal@gmail.com' THEN '+91-9876543210'
    WHEN phone IS NULL OR phone = '' THEN '+91-987654' || LPAD((RANDOM() * 10000)::int::text, 4, '0')
    ELSE phone
  END,
  organization_id = CASE 
    WHEN organization_id IS NULL THEN '550e8400-e29b-41d4-a716-446655440001'
    ELSE organization_id
  END
WHERE phone IS NULL OR phone = '' OR email = 'bahuguna.vimal@gmail.com' OR organization_id IS NULL;