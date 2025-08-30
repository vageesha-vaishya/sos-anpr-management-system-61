-- Fix foreign key relationships for ANPR and Advertisement modules

-- Drop existing incorrect foreign keys if they exist
DO $$
BEGIN
    -- Drop incorrect advertiser_id constraint from billing_customers
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'billing_customers_advertiser_id_fkey' 
               AND table_name = 'billing_customers') THEN
        ALTER TABLE billing_customers DROP CONSTRAINT billing_customers_advertiser_id_fkey;
    END IF;
END $$;

-- Remove advertiser_id column from billing_customers as it's incorrect
ALTER TABLE billing_customers DROP COLUMN IF EXISTS advertiser_id;

-- Ensure camera_subscriptions has proper foreign keys
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'camera_subscriptions_customer_id_fkey' 
                   AND table_name = 'camera_subscriptions') THEN
        ALTER TABLE camera_subscriptions 
        ADD CONSTRAINT camera_subscriptions_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES billing_customers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure advertisement_campaigns references billing_customers properly
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'advertisement_campaigns_advertiser_id_fkey' 
                   AND table_name = 'advertisement_campaigns') THEN
        ALTER TABLE advertisement_campaigns 
        ADD CONSTRAINT advertisement_campaigns_advertiser_id_fkey 
        FOREIGN KEY (advertiser_id) REFERENCES billing_customers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update advertisement_campaigns to reference the correct advertiser
UPDATE advertisement_campaigns 
SET advertiser_id = (SELECT id FROM billing_customers WHERE customer_type = 'advertiser' LIMIT 1)
WHERE advertiser_id NOT IN (SELECT id FROM billing_customers);

-- Add some additional sample data to make modules more functional

-- Add more varied ANPR service charges
INSERT INTO anpr_service_charges (customer_id, service_type, charge_amount, unit_price, quantity, billing_date, billing_period_start, billing_period_end, status)
SELECT 
    bc.id,
    'subscription_basic',
    199.00,
    199.00,
    1,
    CURRENT_DATE,
    CURRENT_DATE,
    CURRENT_DATE + interval '1 month',
    'billed'
FROM billing_customers bc
WHERE bc.customer_type = 'residential'
AND NOT EXISTS (SELECT 1 FROM anpr_service_charges WHERE customer_id = bc.id AND service_type = 'subscription_basic')
LIMIT 1;

-- Add storage service charges
INSERT INTO anpr_service_charges (customer_id, service_type, charge_amount, unit_price, quantity, billing_date, billing_period_start, billing_period_end, status)
SELECT 
    bc.id,
    'storage',
    50.00,
    5.00,
    10,
    CURRENT_DATE,
    CURRENT_DATE - interval '1 month',
    CURRENT_DATE,
    'paid'
FROM billing_customers bc
WHERE bc.customer_type = 'enterprise'
AND NOT EXISTS (SELECT 1 FROM anpr_service_charges WHERE customer_id = bc.id AND service_type = 'storage')
LIMIT 1;

-- Add more advertisement campaigns with different types
INSERT INTO advertisement_campaigns (organization_id, advertiser_id, campaign_name, campaign_type, billing_model, rate, daily_budget, total_budget, start_date, end_date, status)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    bc.id,
    'Newsletter Advertisement',
    'newsletter',
    'fixed_monthly',
    800.00,
    50.00,
    2400.00,
    CURRENT_DATE - interval '10 days',
    CURRENT_DATE + interval '50 days',
    'active'
FROM billing_customers bc
WHERE bc.customer_type = 'advertiser'
AND NOT EXISTS (SELECT 1 FROM advertisement_campaigns WHERE campaign_name = 'Newsletter Advertisement')
LIMIT 1;

-- Add promotional campaign
INSERT INTO advertisement_campaigns (organization_id, advertiser_id, campaign_name, campaign_type, billing_model, rate, daily_budget, total_budget, start_date, end_date, status)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    bc.id,
    'Summer Promotional Event',
    'promotional',
    'CPC',
    5.00,
    300.00,
    9000.00,
    CURRENT_DATE - interval '5 days',
    CURRENT_DATE + interval '25 days',
    'active'
FROM billing_customers bc
WHERE bc.customer_type = 'advertiser'
AND NOT EXISTS (SELECT 1 FROM advertisement_campaigns WHERE campaign_name = 'Summer Promotional Event')
LIMIT 1;