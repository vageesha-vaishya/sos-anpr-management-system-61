-- Fix foreign key relationships and add minimal sample data

-- Add missing foreign key constraints safely
DO $$ 
BEGIN
    -- Add camera subscription to customer relationship
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_camera_subscriptions_customer'
    ) THEN
        ALTER TABLE camera_subscriptions 
        ADD CONSTRAINT fk_camera_subscriptions_customer 
        FOREIGN KEY (customer_id) REFERENCES billing_customers(id);
    END IF;

    -- Add maintenance charges to society units relationship  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_maintenance_charges_unit'
    ) THEN
        ALTER TABLE maintenance_charges 
        ADD CONSTRAINT fk_maintenance_charges_unit 
        FOREIGN KEY (unit_id) REFERENCES society_units(id);
    END IF;
END $$;

-- Insert sample billing customers (basic data only)
INSERT INTO billing_customers (organization_id, billing_name, customer_type, billing_address, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Tech Corp Solutions', 'enterprise', '{"street": "123 Business Ave", "city": "New York", "state": "NY", "zip": "10001"}', 'active'),
('00000000-0000-0000-0000-000000000001', 'Green Valley Society', 'residential', '{"street": "456 Residential St", "city": "Mumbai", "state": "MH", "zip": "400001"}', 'active'),
('00000000-0000-0000-0000-000000000001', 'Metro Advertising Agency', 'advertiser', '{"street": "789 Marketing Blvd", "city": "Delhi", "state": "DL", "zip": "110001"}', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample charge categories
INSERT INTO charge_categories (organization_id, category_name, category_type, description, default_amount, billing_frequency, is_mandatory, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Maintenance Fee', 'recurring', 'Monthly maintenance charges for common areas', 2500.00, 'monthly', true, true),
('00000000-0000-0000-0000-000000000001', 'Security Charges', 'recurring', 'Security services and surveillance', 800.00, 'monthly', true, true),
('00000000-0000-0000-0000-000000000001', 'Parking Fee', 'recurring', 'Vehicle parking charges', 500.00, 'monthly', false, true),
('00000000-0000-0000-0000-000000000001', 'Water Charges', 'utility', 'Water consumption and supply', 300.00, 'monthly', true, true),
('00000000-0000-0000-0000-000000000001', 'Late Payment Fee', 'penalty', 'Penalty for overdue payments', 100.00, 'one_time', false, true)
ON CONFLICT DO NOTHING;

-- Insert sample service types
INSERT INTO service_types (organization_id, service_name, service_category, description, unit_type, default_rate, billing_model, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'ANPR Detection Service', 'security', 'Automatic Number Plate Recognition processing', 'per_detection', 2.50, 'usage_based', true),
('00000000-0000-0000-0000-000000000001', 'Cloud Storage', 'storage', 'Video and data cloud storage service', 'per_gb', 5.00, 'subscription', true),
('00000000-0000-0000-0000-000000000001', 'Mobile App Access', 'software', 'Visitor management mobile application', 'per_user', 50.00, 'subscription', true),
('00000000-0000-0000-0000-000000000001', 'SMS Notifications', 'communication', 'SMS alerts and notifications', 'per_sms', 0.50, 'usage_based', true),
('00000000-0000-0000-0000-000000000001', 'Email Notifications', 'communication', 'Email alerts and notifications', 'per_email', 0.10, 'usage_based', true)
ON CONFLICT DO NOTHING;

-- Insert sample amenities
INSERT INTO amenities (organization_id, amenity_name, amenity_type, description, capacity, hourly_rate, advance_booking_days, max_booking_hours, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Swimming Pool', 'recreational', 'Community swimming pool with changing rooms', 50, 200.00, 7, 4, true),
('00000000-0000-0000-0000-000000000001', 'Community Hall', 'event', 'Large hall for events and gatherings', 200, 500.00, 30, 8, true),
('00000000-0000-0000-0000-000000000001', 'Gymnasium', 'fitness', 'Fully equipped fitness center', 30, 100.00, 3, 2, true),
('00000000-0000-0000-0000-000000000001', 'Tennis Court', 'sports', 'Professional tennis court with lighting', 4, 300.00, 7, 2, true),
('00000000-0000-0000-0000-000000000001', 'Children Play Area', 'recreational', 'Safe play area for children', 25, 50.00, 1, 3, true)
ON CONFLICT DO NOTHING;

-- Insert sample society units (using only guaranteed existing columns)
INSERT INTO society_units (organization_id, unit_number, unit_type) VALUES
('00000000-0000-0000-0000-000000000001', 'A-101', '2BHK'),
('00000000-0000-0000-0000-000000000001', 'A-102', '3BHK'),
('00000000-0000-0000-0000-000000000001', 'B-201', '2BHK'),
('00000000-0000-0000-0000-000000000001', 'B-202', '1BHK'),
('00000000-0000-0000-0000-000000000001', 'C-301', '3BHK')
ON CONFLICT DO NOTHING;

-- Insert sample ANPR service charges
INSERT INTO anpr_service_charges (customer_id, service_type, charge_amount, unit_price, quantity, billing_date, billing_period_start, billing_period_end, status)
SELECT 
    bc.id,
    'anpr_detection',
    250.00,
    2.50,
    100,
    CURRENT_DATE,
    CURRENT_DATE - interval '1 month',
    CURRENT_DATE,
    CASE WHEN random() > 0.3 THEN 'paid' ELSE 'pending' END
FROM billing_customers bc
WHERE bc.customer_type != 'advertiser'
ON CONFLICT DO NOTHING;

-- Insert sample advertisement campaigns
INSERT INTO advertisement_campaigns (organization_id, advertiser_id, campaign_name, campaign_type, billing_model, rate, daily_budget, total_budget, start_date, end_date, status)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    bc.id,
    'Holiday Season Campaign',
    'display',
    'cpm',
    15.00,
    500.00,
    15000.00,
    CURRENT_DATE,
    CURRENT_DATE + interval '30 days',
    'active'
FROM billing_customers bc
WHERE bc.customer_type = 'advertiser'
ON CONFLICT DO NOTHING;

-- Add some maintenance charges after units are created
INSERT INTO maintenance_charges (unit_id, amount, charge_type, billing_month, due_date, status, description) 
SELECT 
    su.id,
    2500.00,
    'monthly_maintenance',
    '2024-12-01'::date,
    '2024-12-10'::date,
    CASE WHEN random() > 0.3 THEN 'paid' ELSE 'pending' END,
    'Monthly maintenance charges for ' || su.unit_number
FROM society_units su
WHERE su.organization_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;