-- Insert sample data for all modules
INSERT INTO public.charge_categories (organization_id, category_name, category_type, description, default_amount, billing_frequency, is_mandatory, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Monthly Maintenance', 'maintenance', 'Regular monthly maintenance charges', 150.00, 'monthly', true, true),
('00000000-0000-0000-0000-000000000001', 'Water Bill', 'utility', 'Monthly water consumption charges', 25.00, 'monthly', true, true),
('00000000-0000-0000-0000-000000000001', 'Electricity Bill', 'utility', 'Monthly electricity consumption charges', 80.00, 'monthly', true, true),
('00000000-0000-0000-0000-000000000001', 'Parking Fee', 'parking', 'Monthly parking slot charges', 50.00, 'monthly', false, true),
('00000000-0000-0000-0000-000000000001', 'Security Deposit', 'deposit', 'One-time security deposit', 500.00, 'one_time', false, true);

INSERT INTO public.service_types (organization_id, service_name, service_category, description, unit_type, default_rate, billing_model, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'ANPR Detection Service', 'anpr', 'Automatic number plate recognition per detection', 'per_detection', 0.50, 'usage_based', true),
('00000000-0000-0000-0000-000000000001', 'Security Guard Service', 'security', '24/7 security guard service', 'per_hour', 15.00, 'fixed', true),
('00000000-0000-0000-0000-000000000001', 'Cleaning Service', 'cleaning', 'Professional cleaning service', 'per_hour', 25.00, 'usage_based', true);

INSERT INTO public.amenities (organization_id, amenity_name, amenity_type, description, capacity, hourly_rate, advance_booking_days, max_booking_hours, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Community Clubhouse', 'clubhouse', 'Large hall for events and gatherings', 100, 50.00, 7, 8, true),
('00000000-0000-0000-0000-000000000001', 'Swimming Pool', 'pool', 'Olympic size swimming pool with lifeguard', 50, 25.00, 3, 4, true),
('00000000-0000-0000-0000-000000000001', 'Fitness Center', 'gym', 'Fully equipped fitness center', 30, 15.00, 1, 2, true);

INSERT INTO public.society_units (organization_id, unit_number, unit_type, owner_name, tenant_name, area_sqft, monthly_rate_per_sqft, monthly_flat_rate, parking_slots, status) VALUES
('00000000-0000-0000-0000-000000000001', 'A-101', 'residential', 'John Smith', '', 1200, 2.50, 0, 1, 'occupied'),
('00000000-0000-0000-0000-000000000001', 'A-102', 'residential', 'Jane Doe', 'Mike Johnson', 1100, 2.50, 0, 1, 'occupied'),
('00000000-0000-0000-0000-000000000001', 'B-201', 'commercial', 'ABC Corp', '', 800, 4.00, 0, 2, 'occupied'),
('00000000-0000-0000-0000-000000000001', 'C-301', 'residential', '', '', 1000, 2.50, 0, 1, 'vacant');

-- Sample household members for the units
INSERT INTO public.household_members (unit_id, member_type, relationship, full_name, date_of_birth, gender, primary_phone, email, occupation, is_primary_resident, status) 
SELECT 
  su.id,
  'owner',
  'head',
  su.owner_name,
  '1985-06-15',
  'male',
  '+1-555-0123',
  lower(replace(su.owner_name, ' ', '.')) || '@email.com',
  'Software Engineer',
  true,
  'active'
FROM society_units su 
WHERE su.owner_name != '' AND su.organization_id = '00000000-0000-0000-0000-000000000001';