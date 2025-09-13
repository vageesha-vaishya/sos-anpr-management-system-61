-- Complete Database Reset Script for Testing (Schema-verified)
-- Cleans user data, preserves platform org, inserts minimal test fixtures

-- Disable triggers temporarily to avoid cascade issues
SET session_replication_role = replica;

-- Clean user-generated transactional data (existing tables only)
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

-- Clean infrastructure and organizational data
DELETE FROM camera_subscriptions;
DELETE FROM cameras;
DELETE FROM entry_gates;
DELETE FROM access_cards;
DELETE FROM digital_id_cards;
DELETE FROM amenities;
-- parking_slots may not exist in some setups; remove if not present
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parking_slots' AND table_schema = 'public') THEN
    EXECUTE 'DELETE FROM parking_slots;';
  END IF;
END $$;

-- Clean building and location data (except platform locations)
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

-- Clean emergency contacts and departments
DELETE FROM emergency_contacts WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM departments WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean communication channels and badge templates
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

-- Insert basic test data for testing infrastructure

-- Test Organizations (using actual columns)
INSERT INTO organizations (id, name, organization_type, subscription_plan, contact_email, is_active, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'Test Franchise Organization', 'franchise', 'premium', 'test@franchise.com', true, now(), now()),
(gen_random_uuid(), 'Test Society Organization', 'customer', 'basic', 'test@society.com', true, now(), now());

-- Get organization IDs for further inserts
DO $$
DECLARE
    franchise_org_id UUID;
    society_org_id UUID;
    test_location_id UUID;
    test_building_id UUID;
    test_gate_id UUID;
BEGIN
    -- Get the test organization IDs
    SELECT id INTO franchise_org_id FROM organizations WHERE name = 'Test Franchise Organization' LIMIT 1;
    SELECT id INTO society_org_id FROM organizations WHERE name = 'Test Society Organization' LIMIT 1;
    
    -- Create test location (address is NOT NULL per schema)
    INSERT INTO locations (id, name, address, city_id, organization_id, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Test Society Location',
      '123 Test Street',
      (SELECT id FROM cities LIMIT 1),
      society_org_id,
      true,
      now(),
      now()
    )
    RETURNING id INTO test_location_id;
    
    -- Create test building (building_type enum: residential)
    INSERT INTO buildings (id, name, description, building_type, location_id, floors, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Test Building A',
      'Test building for automated testing',
      'residential',
      test_location_id,
      10,
      true,
      now(),
      now()
    )
    RETURNING id INTO test_building_id;
    
    -- Create test entry gate (gate_type enum: main)
    INSERT INTO entry_gates (id, name, description, gate_type, building_id, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Main Gate Test',
      'Main entrance for testing',
      'main',
      test_building_id,
      true,
      now(),
      now()
    )
    RETURNING id INTO test_gate_id;
    
    -- Create test profiles for different roles (use existing user_role enum values)
    INSERT INTO profiles (id, email, full_name, role, organization_id, status, permissions, created_at, updated_at) VALUES
    (gen_random_uuid(), 'test.franchise.admin@test.com', 'Test Franchise Admin', 'franchise_admin', franchise_org_id, 'active', ARRAY['*'], now(), now()),
    (gen_random_uuid(), 'test.society.admin@test.com', 'Test Society Admin', 'customer_admin', society_org_id, 'active', ARRAY['manage_residents', 'manage_visitors', 'manage_amenities'], now(), now()),
    (gen_random_uuid(), 'test.resident@test.com', 'Test Resident', 'resident', society_org_id, 'active', ARRAY['view_amenities', 'book_amenities'], now(), now()),
    (gen_random_uuid(), 'test.staff@test.com', 'Test Staff Member', 'security_staff', society_org_id, 'active', ARRAY['manage_visitors', 'view_reports'], now(), now());
    
    -- Create test amenities
    INSERT INTO amenities (id, name, description, amenity_type, building_id, capacity, booking_required, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Test Swimming Pool', 'Community swimming pool for testing', 'recreation', test_building_id, 50, true, true, now(), now()),
    (gen_random_uuid(), 'Test Community Hall', 'Community hall for events and testing', 'event_space', test_building_id, 100, true, true, now(), now()),
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
    
END $$;

-- Create basic chart of accounts for testing
INSERT INTO chart_of_accounts_enhanced (id, account_code, account_name, account_type, account_category, description, organization_id, is_active, opening_balance, current_balance, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    unnest(ARRAY['1001', '1002', '2001', '3001', '4001', '5001']),
    unnest(ARRAY['Cash in Hand', 'Bank Account', 'Accounts Payable', 'Member Equity', 'Maintenance Income', 'Utility Expenses']),
    unnest(ARRAY['asset', 'asset', 'liability', 'equity', 'income', 'expense']),
    unnest(ARRAY['current_assets', 'current_assets', 'current_liabilities', 'member_equity', 'operating_income', 'operating_expenses']),
    unnest(ARRAY['Cash in hand for daily operations', 'Primary bank account', 'Outstanding vendor payments', 'Member contributions', 'Monthly maintenance collections', 'Utility bill payments']),
    o.id,
    true,
    0,
    0,
    now(),
    now()
FROM organizations o 
WHERE o.name = 'Test Society Organization';