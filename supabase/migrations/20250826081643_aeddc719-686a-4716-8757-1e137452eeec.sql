-- Fix foreign key relationships and add sample data for financial management (UUID fixed)

-- Add missing foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_camera_subscriptions_customer') THEN
        ALTER TABLE camera_subscriptions 
        ADD CONSTRAINT fk_camera_subscriptions_customer 
        FOREIGN KEY (customer_id) REFERENCES billing_customers(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_camera_subscriptions_camera') THEN
        ALTER TABLE camera_subscriptions 
        ADD CONSTRAINT fk_camera_subscriptions_camera 
        FOREIGN KEY (camera_id) REFERENCES cameras(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_maintenance_charges_unit') THEN
        ALTER TABLE maintenance_charges 
        ADD CONSTRAINT fk_maintenance_charges_unit 
        FOREIGN KEY (unit_id) REFERENCES society_units(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_maintenance_charges_category') THEN
        ALTER TABLE maintenance_charges 
        ADD CONSTRAINT fk_maintenance_charges_category 
        FOREIGN KEY (category_id) REFERENCES charge_categories(id);
    END IF;
END $$;

-- Add advertiser_id column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'billing_customers' AND column_name = 'advertiser_id') THEN
        ALTER TABLE billing_customers 
        ADD COLUMN advertiser_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- Insert sample billing customers
INSERT INTO billing_customers (organization_id, billing_name, customer_type, billing_address, status) 
VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Tech Corp Solutions', 'enterprise', '{"street": "123 Business Ave", "city": "New York", "state": "NY", "zip": "10001"}'::jsonb, 'active'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Green Valley Society', 'residential', '{"street": "456 Residential St", "city": "Mumbai", "state": "MH", "zip": "400001"}'::jsonb, 'active'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Metro Advertising Agency', 'advertiser', '{"street": "789 Marketing Blvd", "city": "Delhi", "state": "DL", "zip": "110001"}'::jsonb, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample charge categories
INSERT INTO charge_categories (organization_id, category_name, category_type, description, default_amount, billing_frequency, is_mandatory, is_active) 
VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Maintenance Fee', 'recurring', 'Monthly maintenance charges for common areas', 2500.00, 'monthly', true, true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Security Charges', 'recurring', 'Security services and surveillance', 800.00, 'monthly', true, true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Parking Fee', 'recurring', 'Vehicle parking charges', 500.00, 'monthly', false, true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Water Charges', 'utility', 'Water consumption and supply', 300.00, 'monthly', true, true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Late Payment Fee', 'penalty', 'Penalty for overdue payments', 100.00, 'one_time', false, true)
ON CONFLICT DO NOTHING;

-- Insert sample service types
INSERT INTO service_types (organization_id, service_name, service_category, description, unit_type, default_rate, billing_model, is_active) 
VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'ANPR Detection Service', 'security', 'Automatic Number Plate Recognition processing', 'per_detection', 2.50, 'usage_based', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Cloud Storage', 'storage', 'Video and data cloud storage service', 'per_gb', 5.00, 'subscription', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Mobile App Access', 'software', 'Visitor management mobile application', 'per_user', 50.00, 'subscription', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'SMS Notifications', 'communication', 'SMS alerts and notifications', 'per_sms', 0.50, 'usage_based', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Email Notifications', 'communication', 'Email alerts and notifications', 'per_email', 0.10, 'usage_based', true)
ON CONFLICT DO NOTHING;

-- Insert sample amenities
INSERT INTO amenities (organization_id, amenity_name, amenity_type, description, capacity, hourly_rate, advance_booking_days, max_booking_hours, is_active) 
VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Swimming Pool', 'recreational', 'Community swimming pool with changing rooms', 50, 200.00, 7, 4, true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Community Hall', 'event', 'Large hall for events and gatherings', 200, 500.00, 30, 8, true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Gymnasium', 'fitness', 'Fully equipped fitness center', 30, 100.00, 3, 2, true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Tennis Court', 'sports', 'Professional tennis court with lighting', 4, 300.00, 7, 2, true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Children Play Area', 'recreational', 'Safe play area for children', 25, 50.00, 1, 3, true)
ON CONFLICT DO NOTHING;

-- Insert sample society units
INSERT INTO society_units (organization_id, unit_number, unit_type, owner_name, tenant_name, area_sqft, monthly_rate_per_sqft, monthly_flat_rate, parking_slots, status) 
VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'A-101', 'residential', 'John Smith', NULL, 850.0, 3.00, 2550.00, 1, 'occupied'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'A-102', 'residential', 'Mary Johnson', 'David Brown', 1200.0, 2.92, 3500.00, 2, 'occupied'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'B-201', 'residential', 'Robert Wilson', NULL, 900.0, 3.11, 2800.00, 1, 'occupied'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'B-202', 'residential', 'Lisa Anderson', NULL, 600.0, 3.33, 2000.00, 1, 'vacant'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'C-301', 'residential', 'Michael Davis', 'Sarah Miller', 1300.0, 3.08, 4000.00, 2, 'occupied'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'P-001', 'parking', 'Parking Management', NULL, 250.0, 2.00, 500.00, 0, 'occupied'),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'C-001', 'commercial', 'ABC Store', NULL, 400.0, 8.00, 3200.00, 0, 'occupied')
ON CONFLICT DO NOTHING;

-- Insert maintenance charges
INSERT INTO maintenance_charges (unit_id, amount, charge_type, billing_month, due_date, status, description) 
SELECT 
    su.id,
    su.monthly_flat_rate,
    'monthly_maintenance',
    '2024-12-01'::date,
    '2024-12-10'::date,
    CASE WHEN random() > 0.3 THEN 'paid' ELSE 'pending' END,
    'Monthly maintenance charges for ' || su.unit_number
FROM society_units su
WHERE su.organization_id = '00000000-0000-0000-0000-000000000001'::uuid
AND NOT EXISTS (SELECT 1 FROM maintenance_charges WHERE unit_id = su.id);

-- Insert ANPR service charges
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
AND NOT EXISTS (SELECT 1 FROM anpr_service_charges WHERE customer_id = bc.id);

-- Insert advertisement campaigns
INSERT INTO advertisement_campaigns (organization_id, advertiser_id, campaign_name, campaign_type, billing_model, rate, daily_budget, total_budget, start_date, end_date, status)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
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
AND NOT EXISTS (SELECT 1 FROM advertisement_campaigns WHERE advertiser_id = bc.id);

-- Update billing customers with advertiser linking
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
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE customer_id = bc.id);