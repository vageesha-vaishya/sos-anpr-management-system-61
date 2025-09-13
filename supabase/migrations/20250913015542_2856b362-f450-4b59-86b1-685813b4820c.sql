-- Complete Database Reset Script for Testing (Corrected)
-- This script cleans all user-generated data while preserving system essentials

-- Disable triggers temporarily to avoid cascade issues
SET session_replication_role = replica;

-- Clean user-generated transactional data (only existing tables)
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
DELETE FROM parking_slots;

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

-- Clean audit and activity logs
DELETE FROM dashboard_metrics;

-- Clean emergency contacts and departments
DELETE FROM emergency_contacts WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);
DELETE FROM departments WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean communication channels
DELETE FROM communication_channels WHERE organization_id NOT IN (
  SELECT id FROM organizations WHERE organization_type = 'platform'
);

-- Clean badge templates
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

-- Test Organizations (using correct column structure)
INSERT INTO organizations (id, name, organization_type, subscription_plan, is_active, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Test Franchise Organization', 'franchise', 'premium', true, now(), now()),
(gen_random_uuid(), 'Test Society Organization', 'customer', 'basic', true, now(), now());

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
    SELECT id INTO franchise_org_id FROM organizations WHERE name = 'Test Franchise Organization';
    SELECT id INTO society_org_id FROM organizations WHERE name = 'Test Society Organization';
    
    -- Create test location
    INSERT INTO locations (id, name, address, city_id, organization_id, location_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Test Society Location', '123 Test Street', 
            (SELECT id FROM cities LIMIT 1), society_org_id, 'society', true, now(), now())
    RETURNING id INTO test_location_id;
    
    -- Create test building
    INSERT INTO buildings (id, name, description, building_type, location_id, floors, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Test Building A', 'Test building for automated testing', 'residential', test_location_id, 10, true, now(), now())
    RETURNING id INTO test_building_id;
    
    -- Create test entry gate
    INSERT INTO entry_gates (id, name, description, gate_type, building_id, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Main Gate Test', 'Main entrance for testing', 'main', test_building_id, true, now(), now())
    RETURNING id INTO test_gate_id;
    
    -- Create test profiles for different roles
    INSERT INTO profiles (id, email, full_name, role, organization_id, status, permissions, created_at, updated_at) VALUES
    (gen_random_uuid(), 'test.franchise.admin@test.com', 'Test Franchise Admin', 'franchise_admin', franchise_org_id, 'active', ARRAY['*'], now(), now()),
    (gen_random_uuid(), 'test.society.admin@test.com', 'Test Society Admin', 'customer_admin', society_org_id, 'active', ARRAY['manage_residents', 'manage_visitors', 'manage_amenities'], now(), now()),
    (gen_random_uuid(), 'test.resident@test.com', 'Test Resident', 'resident', society_org_id, 'active', ARRAY['view_amenities', 'book_amenities'], now(), now()),
    (gen_random_uuid(), 'test.staff@test.com', 'Test Staff Member', 'staff', society_org_id, 'active', ARRAY['manage_visitors', 'view_reports'], now(), now());
    
    -- Create test amenities
    INSERT INTO amenities (id, name, description, amenity_type, building_id, capacity, booking_required, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Test Swimming Pool', 'Community swimming pool for testing', 'recreation', test_building_id, 50, true, true, now(), now()),
    (gen_random_uuid(), 'Test Community Hall', 'Community hall for events and testing', 'event_space', test_building_id, 100, true, true, now(), now()),
    (gen_random_uuid(), 'Test Gym', 'Fitness center for testing', 'fitness', test_building_id, 30, true, true, now(), now());
    
    -- Create test charge categories
    INSERT INTO charge_categories (id, name, description, charge_type, billing_cycle, base_amount, organization_id, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Test Maintenance Charge', 'Monthly maintenance fee for testing', 'maintenance', 'monthly', 1000.00, society_org_id, true, now(), now()),
    (gen_random_uuid(), 'Test Amenity Fee', 'Per-use amenity fee for testing', 'amenity', 'per_use', 50.00, society_org_id, true, now(), now()),
    (gen_random_uuid(), 'Test Parking Fee', 'Monthly parking fee for testing', 'parking', 'monthly', 200.00, society_org_id, true, now(), now());
    
    -- Create test camera
    INSERT INTO cameras (id, name, ip_address, rtsp_url, entry_gate_id, is_active, username, password, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Test Main Gate Camera', '192.168.1.100', 'rtsp://192.168.1.100:554/stream', test_gate_id, true, 'admin', 'test123', now(), now());
    
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

-- Insert test visitor for visitor management testing
INSERT INTO visitors (id, name, phone, email, purpose, organization_id, is_pre_approved, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Test Visitor',
    '+1234567890',
    'test.visitor@test.com',
    'Testing visitor management',
    o.id,
    false,
    now(),
    now()
FROM organizations o 
WHERE o.name = 'Test Society Organization';