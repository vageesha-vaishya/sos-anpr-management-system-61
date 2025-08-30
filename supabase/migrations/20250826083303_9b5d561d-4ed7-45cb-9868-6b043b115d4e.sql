-- Create foreign key relationships properly with explicit constraint names

-- Create foreign key for camera_subscriptions -> billing_customers
ALTER TABLE camera_subscriptions 
DROP CONSTRAINT IF EXISTS camera_subscriptions_customer_id_fkey;

ALTER TABLE camera_subscriptions 
ADD CONSTRAINT camera_subscriptions_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES billing_customers(id) ON DELETE CASCADE;

-- Create foreign key for advertisement_campaigns -> billing_customers  
ALTER TABLE advertisement_campaigns 
DROP CONSTRAINT IF EXISTS advertisement_campaigns_advertiser_id_fkey;

ALTER TABLE advertisement_campaigns 
ADD CONSTRAINT advertisement_campaigns_advertiser_id_fkey 
FOREIGN KEY (advertiser_id) REFERENCES billing_customers(id) ON DELETE CASCADE;

-- Create foreign key for anpr_service_charges -> billing_customers
ALTER TABLE anpr_service_charges 
DROP CONSTRAINT IF EXISTS anpr_service_charges_customer_id_fkey;

ALTER TABLE anpr_service_charges 
ADD CONSTRAINT anpr_service_charges_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES billing_customers(id) ON DELETE CASCADE;

-- Force PostgREST schema cache refresh by updating the schema version
NOTIFY pgrst, 'reload schema';