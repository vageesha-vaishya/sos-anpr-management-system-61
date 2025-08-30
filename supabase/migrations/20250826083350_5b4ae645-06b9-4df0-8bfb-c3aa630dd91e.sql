-- Force complete PostgREST schema cache refresh

-- Update schema version to force cache invalidation
SELECT pg_notify('pgrst', 'reload config');
SELECT pg_notify('pgrst', 'reload schema');

-- Refresh PostgREST schema cache by updating a system table
COMMENT ON TABLE billing_customers IS 'Updated to refresh PostgREST cache';
COMMENT ON TABLE advertisement_campaigns IS 'Updated to refresh PostgREST cache'; 
COMMENT ON TABLE anpr_service_charges IS 'Updated to refresh PostgREST cache';
COMMENT ON TABLE camera_subscriptions IS 'Updated to refresh PostgREST cache';

-- Add some indexes to improve performance while we're at it
CREATE INDEX IF NOT EXISTS idx_advertisement_campaigns_advertiser_id ON advertisement_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_anpr_service_charges_customer_id ON anpr_service_charges(customer_id);
CREATE INDEX IF NOT EXISTS idx_camera_subscriptions_customer_id ON camera_subscriptions(customer_id);