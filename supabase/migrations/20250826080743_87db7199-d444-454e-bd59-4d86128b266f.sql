-- Fix foreign key relationships and add sample data for financial management

-- Add missing foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_camera_subscriptions_customer'
    ) THEN
        ALTER TABLE camera_subscriptions 
        ADD CONSTRAINT fk_camera_subscriptions_customer 
        FOREIGN KEY (customer_id) REFERENCES billing_customers(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_camera_subscriptions_camera'
    ) THEN
        ALTER TABLE camera_subscriptions 
        ADD CONSTRAINT fk_camera_subscriptions_camera 
        FOREIGN KEY (camera_id) REFERENCES cameras(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_maintenance_charges_unit'
    ) THEN
        ALTER TABLE maintenance_charges 
        ADD CONSTRAINT fk_maintenance_charges_unit 
        FOREIGN KEY (unit_id) REFERENCES society_units(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_maintenance_charges_category'
    ) THEN
        ALTER TABLE maintenance_charges 
        ADD CONSTRAINT fk_maintenance_charges_category 
        FOREIGN KEY (category_id) REFERENCES charge_categories(id);
    END IF;
END $$;

-- Add advertiser_id to billing_customers if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing_customers' AND column_name = 'advertiser_id'
    ) THEN
        ALTER TABLE billing_customers 
        ADD COLUMN advertiser_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- Insert sample billing customers
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

-- Insert sample society units (using only existing columns)
INSERT INTO society_units (organization_id, unit_number, unit_type, building_name, carpet_area, built_up_area, owner_name, owner_contact, tenant_name, tenant_contact, occupancy_status, maintenance_rate, parking_spaces, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'A-101', '2BHK', 'Tower A', 850.0, 1100.0, 'John Smith', '+91-9876543210', NULL, NULL, 'owner_occupied', 2500.00, 1, true),
('00000000-0000-0000-0000-000000000001', 'A-102', '3BHK', 'Tower A', 1200.0, 1500.0, 'Mary Johnson', '+91-9876543211', 'David Brown', '+91-9876543212', 'tenant_occupied', 3500.00, 2, true),
('00000000-0000-0000-0000-000000000001', 'B-201', '2BHK', 'Tower B', 900.0, 1150.0, 'Robert Wilson', '+91-9876543213', NULL, NULL, 'owner_occupied', 2800.00, 1, true),
('00000000-0000-0000-0000-000000000001', 'B-202', '1BHK', 'Tower B', 600.0, 750.0, 'Lisa Anderson', '+91-9876543214', NULL, NULL, 'vacant', 2000.00, 1, true),
('00000000-0000-0000-0000-000000000001', 'C-301', '3BHK', 'Tower C', 1300.0, 1600.0, 'Michael Davis', '+91-9876543215', 'Sarah Miller', '+91-9876543216', 'tenant_occupied', 4000.00, 2, true)
ON CONFLICT DO NOTHING;

-- Insert sample maintenance charges
INSERT INTO maintenance_charges (unit_id, amount, charge_type, billing_month, due_date, status, description) 
SELECT 
    su.id,
    su.maintenance_rate,
    'monthly_maintenance',
    '2024-12-01'::date,
    '2024-12-10'::date,
    CASE WHEN random() > 0.3 THEN 'paid' ELSE 'pending' END,
    'Monthly maintenance charges for ' || su.unit_number
FROM society_units su
WHERE su.organization_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- Insert sample camera subscriptions (only if there are cameras and billing customers)
INSERT INTO camera_subscriptions (customer_id, camera_id, subscription_plan, monthly_fee, installation_fee, start_date, status)
SELECT 
    bc.id,
    c.id,
    CASE WHEN random() > 0.5 THEN 'professional' ELSE 'basic' END,
    CASE WHEN random() > 0.5 THEN 299.00 ELSE 199.00 END,
    CASE WHEN random() > 0.5 THEN 500.00 ELSE 0.00 END,
    CURRENT_DATE - interval '30 days',
    'active'
FROM billing_customers bc
CROSS JOIN cameras c
WHERE bc.customer_type != 'advertiser'
LIMIT 10
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

-- Update billing customers with proper advertiser linking
UPDATE billing_customers 
SET advertiser_id = organization_id 
WHERE customer_type = 'advertiser' AND advertiser_id IS NULL;

-- Insert sample invoices
INSERT INTO invoices (customer_id, invoice_number, invoice_date, due_date, subtotal, tax_amount, total_amount, status)
SELECT 
    bc.id,
    'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
    CURRENT_DATE,
    CURRENT_DATE + interval '30 days',
    CASE bc.customer_type 
        WHEN 'enterprise' THEN 5000.00
        WHEN 'residential' THEN 2500.00
        ELSE 1000.00
    END,
    CASE bc.customer_type 
        WHEN 'enterprise' THEN 900.00
        WHEN 'residential' THEN 450.00
        ELSE 180.00
    END,
    CASE bc.customer_type 
        WHEN 'enterprise' THEN 5900.00
        WHEN 'residential' THEN 2950.00
        ELSE 1180.00
    END,
    CASE WHEN random() > 0.4 THEN 'paid' ELSE 'pending' END
FROM billing_customers bc
ON CONFLICT DO NOTHING;