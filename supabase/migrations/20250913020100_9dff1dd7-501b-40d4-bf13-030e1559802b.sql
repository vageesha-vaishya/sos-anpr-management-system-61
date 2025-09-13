-- Simple Database Reset Script for Testing
-- Cleans all user data while preserving platform admin and essential system data

-- Disable triggers temporarily
SET session_replication_role = replica;

-- Clean all user-generated data in dependency order
DELETE FROM anpr_detections;
DELETE FROM financial_transactions;
DELETE FROM helpdesk_tickets;
DELETE FROM forum_discussions;
DELETE FROM announcements;
DELETE FROM alerts;
DELETE FROM visitors;
DELETE FROM community_events;
DELETE FROM community_polls;
DELETE FROM community_documents;
DELETE FROM community_assets;
DELETE FROM camera_subscriptions;
DELETE FROM cameras;
DELETE FROM entry_gates;
DELETE FROM access_cards;
DELETE FROM digital_id_cards;
DELETE FROM amenities;
DELETE FROM billing_customers;
DELETE FROM advertisement_campaigns;
DELETE FROM amc_contracts;
DELETE FROM dashboard_metrics;
DELETE FROM emergency_contacts WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM departments WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM communication_channels WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM badge_templates WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean buildings and locations (except platform)
DELETE FROM buildings WHERE location_id NOT IN (
  SELECT id FROM locations WHERE organization_id IN (
    SELECT id FROM organizations WHERE organization_type = 'platform'
  )
);
DELETE FROM locations WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean financial data
DELETE FROM bank_accounts WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM chart_of_accounts WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM chart_of_accounts_enhanced WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM charge_categories WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean user profiles (keep platform admin only)
DELETE FROM profiles WHERE email != 'bahuguna.vimal@gmail.com';

-- Clean organizations (keep platform only)
DELETE FROM organizations WHERE organization_type != 'platform';

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Insert minimal test organizations only (no users - they must be created via auth)
INSERT INTO organizations (id, name, organization_type, subscription_plan, contact_email, is_active, created_at, updated_at)
VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Test Franchise Organization', 'franchise', 'premium', 'test@franchise.com', true, now(), now()),
('550e8400-e29b-41d4-a716-446655440001', 'Test Society Organization', 'customer', 'basic', 'test@society.com', true, now(), now());

-- Add basic test location and building infrastructure
INSERT INTO locations (id, name, address, city_id, organization_id, is_active, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440010',
  'Test Society Location',
  '123 Test Street',
  (SELECT id FROM cities LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  now(),
  now()
);

INSERT INTO buildings (id, name, description, building_type, location_id, floors, is_active, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440020',
  'Test Building A',
  'Test building for automated testing',
  'residential',
  '550e8400-e29b-41d4-a716-446655440010',
  10,
  true,
  now(),
  now()
);

INSERT INTO entry_gates (id, name, description, gate_type, building_id, is_active, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440030',
  'Main Gate Test',
  'Main entrance for testing',
  'main',
  '550e8400-e29b-41d4-a716-446655440020',
  true,
  now(),
  now()
);

-- Add test amenities
INSERT INTO amenities (id, name, description, amenity_type, building_id, capacity, booking_required, is_active, created_at, updated_at) 
VALUES
('550e8400-e29b-41d4-a716-446655440040', 'Test Swimming Pool', 'Community swimming pool for testing', 'recreation', '550e8400-e29b-41d4-a716-446655440020', 50, true, true, now(), now()),
('550e8400-e29b-41d4-a716-446655440041', 'Test Community Hall', 'Community hall for events and testing', 'event_space', '550e8400-e29b-41d4-a716-446655440020', 100, true, true, now(), now()),
('550e8400-e29b-41d4-a716-446655440042', 'Test Gym', 'Fitness center for testing', 'fitness', '550e8400-e29b-41d4-a716-446655440020', 30, true, true, now(), now());

-- Add test camera
INSERT INTO cameras (id, name, ip_address, rtsp_url, entry_gate_id, is_active, username, password, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440050',
  'Test Main Gate Camera',
  '192.168.1.100',
  'rtsp://192.168.1.100:554/stream',
  '550e8400-e29b-41d4-a716-446655440030',
  true,
  'admin',
  'test123',
  now(),
  now()
);

-- Add comment for tracking
COMMENT ON TABLE organizations IS 'Database reset for testing completed - clean slate with minimal test infrastructure';