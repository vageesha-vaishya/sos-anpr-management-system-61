-- Clean up duplicate foreign keys and add missing relationships

-- Remove duplicate foreign key constraint (keep the one with explicit name)
ALTER TABLE camera_subscriptions 
DROP CONSTRAINT IF EXISTS fk_camera_subscriptions_customer;

-- Add missing foreign key for ad_placements -> advertisement_campaigns
ALTER TABLE ad_placements 
ADD CONSTRAINT ad_placements_campaign_id_fkey 
FOREIGN KEY (campaign_id) REFERENCES advertisement_campaigns(id) ON DELETE CASCADE;

-- Force PostgREST schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');

-- Update table comments to trigger schema refresh
COMMENT ON TABLE ad_placements IS 'Updated to add campaign relationship';
COMMENT ON TABLE camera_subscriptions IS 'Cleaned up duplicate constraints';