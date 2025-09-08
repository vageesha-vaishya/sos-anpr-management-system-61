-- Create sample charge categories
INSERT INTO charge_categories (name, description, charge_type, base_amount, billing_cycle, organization_id) VALUES
('Maintenance Fee', 'Monthly maintenance charges for common areas', 'maintenance', 2500.00, 'monthly', '00000000-0000-0000-0000-000000000001'),
('Water Charges', 'Water consumption and maintenance charges', 'utility', 500.00, 'monthly', '00000000-0000-0000-0000-000000000001'),
('Electricity Common Area', 'Common area electricity charges', 'utility', 800.00, 'monthly', '00000000-0000-0000-0000-000000000001'),
('Security Charges', 'Security guard and surveillance charges', 'service', 1200.00, 'monthly', '00000000-0000-0000-0000-000000000001'),
('Parking Fee', 'Vehicle parking charges', 'amenity', 300.00, 'monthly', '00000000-0000-0000-0000-000000000001'),
('Generator Maintenance', 'Generator fuel and maintenance', 'maintenance', 400.00, 'monthly', '00000000-0000-0000-0000-000000000001'),
('Lift Maintenance', 'Elevator maintenance and repairs', 'maintenance', 600.00, 'monthly', '00000000-0000-0000-0000-000000000001'),
('Housekeeping', 'Common area cleaning services', 'service', 350.00, 'monthly', '00000000-0000-0000-0000-000000000001');

-- Create sample charge categories for franchise organization
INSERT INTO charge_categories (name, description, charge_type, base_amount, billing_cycle, organization_id) VALUES
('Monthly Maintenance', 'Regular maintenance charges', 'maintenance', 3000.00, 'monthly', '98a21b23-27dd-4bbe-b03e-051a324b8256'),
('Water Supply', 'Water charges', 'utility', 600.00, 'monthly', '98a21b23-27dd-4bbe-b03e-051a324b8256'),
('Common Area Electricity', 'Electricity for common areas', 'utility', 900.00, 'monthly', '98a21b23-27dd-4bbe-b03e-051a324b8256'),
('Security Service', 'Security and surveillance', 'service', 1500.00, 'monthly', '98a21b23-27dd-4bbe-b03e-051a324b8256');

-- Create sample service types
INSERT INTO service_types (name, description, category, base_price, duration_minutes, organization_id) VALUES
('Plumbing Repair', 'Basic plumbing repair services', 'maintenance', 500.00, 60, '00000000-0000-0000-0000-000000000001'),
('Electrical Work', 'Electrical repair and installation', 'maintenance', 800.00, 90, '00000000-0000-0000-0000-000000000001'),
('Housekeeping', 'Professional cleaning services', 'cleaning', 300.00, 120, '00000000-0000-0000-0000-000000000001'),
('Pest Control', 'Pest control and fumigation', 'health', 1200.00, 180, '00000000-0000-0000-0000-000000000001'),
('AC Service', 'Air conditioner service and repair', 'maintenance', 1000.00, 120, '00000000-0000-0000-0000-000000000001'),
('Painting', 'Interior and exterior painting', 'maintenance', 2000.00, 480, '00000000-0000-0000-0000-000000000001'),
('Security Guard', 'Security guard services', 'security', 1500.00, 480, '00000000-0000-0000-0000-000000000001'),
('Garbage Collection', 'Waste collection and disposal', 'cleaning', 200.00, 30, '00000000-0000-0000-0000-000000000001');

-- Create sample service types for franchise organization  
INSERT INTO service_types (name, description, category, base_price, duration_minutes, organization_id) VALUES
('Plumbing Service', 'Professional plumbing services', 'maintenance', 600.00, 60, '98a21b23-27dd-4bbe-b03e-051a324b8256'),
('Electrical Service', 'Electrical maintenance', 'maintenance', 900.00, 90, '98a21b23-27dd-4bbe-b03e-051a324b8256'),
('Cleaning Service', 'Deep cleaning services', 'cleaning', 400.00, 120, '98a21b23-27dd-4bbe-b03e-051a324b8256'),
('Security Service', 'Professional security', 'security', 1800.00, 480, '98a21b23-27dd-4bbe-b03e-051a324b8256');

-- Get building IDs first to associate amenities
WITH building_data AS (
  SELECT b.id as building_id, l.organization_id 
  FROM buildings b 
  JOIN locations l ON b.location_id = l.id 
  LIMIT 4
)
-- Create sample amenities
INSERT INTO amenities (name, description, amenity_type, capacity, booking_required, pricing, building_id) 
SELECT 
  amenity_data.name,
  amenity_data.description,
  amenity_data.amenity_type,
  amenity_data.capacity,
  amenity_data.booking_required,
  amenity_data.pricing,
  bd.building_id
FROM (
  VALUES 
    ('Swimming Pool', 'Community swimming pool with lifeguard', 'recreational', 50, true, '{"hourly": 200, "daily": 800}'::jsonb),
    ('Gymnasium', 'Fully equipped fitness center', 'fitness', 30, true, '{"hourly": 100, "monthly": 2000}'::jsonb),
    ('Community Hall', 'Multi-purpose hall for events', 'event', 100, true, '{"hourly": 500, "daily": 3000}'::jsonb),
    ('Children Play Area', 'Safe play area for children', 'recreational', 25, false, '{}'::jsonb),
    ('Club House', 'Social gathering space', 'social', 80, true, '{"hourly": 300, "daily": 1500}'::jsonb),
    ('Tennis Court', 'Professional tennis court', 'sports', 4, true, '{"hourly": 400, "daily": 2000}'::jsonb),
    ('Library', 'Community library and reading room', 'educational', 40, false, '{}'::jsonb),
    ('Garden Area', 'Landscaped garden for relaxation', 'outdoor', 100, false, '{}'::jsonb)
) AS amenity_data(name, description, amenity_type, capacity, booking_required, pricing)
CROSS JOIN building_data bd
LIMIT 8;

-- Add missing RLS policies for better data access
CREATE POLICY "Admins can manage charge categories" ON charge_categories FOR ALL
USING (
  get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

CREATE POLICY "Admins can manage service types" ON service_types FOR ALL  
USING (
  get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);

CREATE POLICY "Admins can manage amenities" ON amenities FOR ALL
USING (
  building_id IN (
    SELECT b.id FROM buildings b 
    JOIN locations l ON b.location_id = l.id 
    WHERE l.organization_id = get_user_organization_id()
  ) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])
);