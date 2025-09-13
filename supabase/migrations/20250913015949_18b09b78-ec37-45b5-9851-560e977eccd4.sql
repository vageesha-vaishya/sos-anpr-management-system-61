-- Complete Database Reset Script for Testing (Final)
-- Cleans all user data while preserving system essentials

-- Disable triggers temporarily
SET session_replication_role = replica;

-- Clean all user-generated transactional data
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

-- Clean infrastructure data
DELETE FROM camera_subscriptions;
DELETE FROM cameras;
DELETE FROM entry_gates;
DELETE FROM access_cards;
DELETE FROM digital_id_cards;
DELETE FROM amenities;

-- Clean building and location data (except platform)
DELETE FROM buildings WHERE location_id NOT IN (
  SELECT id FROM locations WHERE organization_id IN (
    SELECT id FROM organizations WHERE organization_type = 'platform'
  )
);

DELETE FROM locations WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean billing and customer data
DELETE FROM billing_customers;
DELETE FROM advertisement_campaigns;
DELETE FROM amc_contracts;
DELETE FROM bank_accounts WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean chart of accounts (except platform)
DELETE FROM chart_of_accounts WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM chart_of_accounts_enhanced WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean service and staff data
DELETE FROM charge_categories WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean audit and metrics
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

-- Clean user profiles (keep platform admin only)
DELETE FROM profiles WHERE email != 'bahuguna.vimal@gmail.com';

-- Clean organizations (keep platform only)
DELETE FROM organizations WHERE organization_type != 'platform';

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Insert minimal test organizations
INSERT INTO organizations (id, name, organization_type, subscription_plan, contact_email, is_active, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'Test Franchise Organization', 'franchise', 'premium', 'test@franchise.com', true, now(), now()),
(gen_random_uuid(), 'Test Society Organization', 'customer', 'basic', 'test@society.com', true, now(), now());

-- Insert test infrastructure
DO $$
DECLARE
    society_org_id UUID;
    test_location_id UUID;
    test_building_id UUID;
    test_gate_id UUID;
BEGIN
    -- Get test society organization
    SELECT id INTO society_org_id FROM organizations WHERE name = 'Test Society Organization' LIMIT 1;
    
    -- Create test location
    INSERT INTO locations (id, name, address, city_id, organization_id, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Test Society Location',
      '123 Test Street, Test City',
      (SELECT id FROM cities LIMIT 1),
      society_org_id,
      true,
      now(),
      now()
    )
    RETURNING id INTO test_location_id;
    
    -- Create test building
    INSERT INTO buildings (id, name, description, building_type, location_id, floors, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Test Building A',
      'Test residential building for automated testing',
      'residential',
      test_location_id,
      10,
      true,
      now(),
      now()
    )
    RETURNING id INTO test_building_id;
    
    -- Create test entry gate
    INSERT INTO entry_gates (id, name, description, gate_type, building_id, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Test Main Gate',
      'Main entrance gate for testing',
      'main',
      test_building_id,
      true,
      now(),
      now()
    )
    RETURNING id INTO test_gate_id;
    
    -- Create test amenities
    INSERT INTO amenities (id, name, description, amenity_type, building_id, capacity, booking_required, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Test Swimming Pool', 'Community swimming pool for testing', 'recreation', test_building_id, 50, true, true, now(), now()),
    (gen_random_uuid(), 'Test Community Hall', 'Community hall for testing events', 'event_space', test_building_id, 100, true, true, now(), now()),
    (gen_random_uuid(), 'Test Gym', 'Fitness center for testing', 'fitness', test_building_id, 30, true, true, now(), now());
    
    -- Create test camera
    INSERT INTO cameras (id, name, ip_address, rtsp_url, entry_gate_id, is_active, username, password, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Test Main Gate Camera',
      '192.168.1.100',
      'rtsp://192.168.1.100:554/stream',
      test_gate_id,
      true,
      'admin',
      'test123',
      now(),
      now()
    );
    
    -- Create test charge categories
    INSERT INTO charge_categories (id, name, description, charge_type, billing_cycle, base_amount, organization_id, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Test Maintenance Charge', 'Monthly maintenance fee for testing', 'maintenance', 'monthly', 1000.00, society_org_id, true, now(), now()),
    (gen_random_uuid(), 'Test Amenity Fee', 'Per-use amenity fee for testing', 'amenity', 'per_use', 50.00, society_org_id, true, now(), now()),
    (gen_random_uuid(), 'Test Parking Fee', 'Monthly parking fee for testing', 'parking', 'monthly', 200.00, society_org_id, true, now(), now());
    
END $$;

-- Add confirmation comment
COMMENT ON TABLE organizations IS 'Database reset completed - ready for automated testing';