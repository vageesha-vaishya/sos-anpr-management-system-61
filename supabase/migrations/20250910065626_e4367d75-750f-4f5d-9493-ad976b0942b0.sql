-- Fix existing unit A-318 to link to Tower A
UPDATE society_units 
SET building_id = 'fd4be402-7340-489f-9abb-04e190a2af08' 
WHERE id = '6c7aee1a-2f55-425f-8d8d-be34eb3f7305';

-- Create additional buildings for complete hierarchy
INSERT INTO buildings (id, name, building_type, location_id, floors, description, is_active) VALUES 
('11111111-1111-1111-1111-111111111111', 'Tower B', 'residential', '3fe03343-704d-468f-975a-d08cd7584ec9', 10, 'Residential tower with modern amenities', true),
('22222222-2222-2222-2222-222222222222', 'Club House', 'commercial', '3fe03343-704d-468f-975a-d08cd7584ec9', 2, 'Community club house with facilities', true);

-- Create comprehensive sample units with proper hierarchy
INSERT INTO society_units (id, building_id, unit_number, floor, unit_type, area_sqft, bedrooms, bathrooms, status, monthly_rate_per_sqft, monthly_flat_rate, parking_slots) VALUES
-- Tower A Units (existing building)
('aaaaaaaa-1111-1111-1111-111111111111', 'fd4be402-7340-489f-9abb-04e190a2af08', 'A-101', 1, 'residential', 1200, 2, 2, 'available', 15.00, 18000, 1),
('aaaaaaaa-2222-2222-2222-222222222222', 'fd4be402-7340-489f-9abb-04e190a2af08', 'A-102', 1, 'residential', 1500, 3, 2, 'available', 15.00, 22500, 1),
('aaaaaaaa-3333-3333-3333-333333333333', 'fd4be402-7340-489f-9abb-04e190a2af08', 'A-201', 2, 'residential', 1200, 2, 2, 'occupied', 15.00, 18000, 1),
('aaaaaaaa-4444-4444-4444-444444444444', 'fd4be402-7340-489f-9abb-04e190a2af08', 'A-202', 2, 'residential', 1500, 3, 2, 'available', 15.00, 22500, 1),
('aaaaaaaa-5555-5555-5555-555555555555', 'fd4be402-7340-489f-9abb-04e190a2af08', 'A-301', 3, 'residential', 1200, 2, 2, 'available', 15.00, 18000, 1),
('aaaaaaaa-6666-6666-6666-666666666666', 'fd4be402-7340-489f-9abb-04e190a2af08', 'A-302', 3, 'residential', 1500, 3, 2, 'maintenance', 15.00, 22500, 1),

-- Tower B Units (new building)
('bbbbbbbb-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'B-101', 1, 'residential', 1100, 2, 2, 'available', 14.00, 15400, 1),
('bbbbbbbb-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'B-102', 1, 'residential', 1400, 3, 2, 'available', 14.00, 19600, 1),
('bbbbbbbb-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'B-201', 2, 'residential', 1100, 2, 2, 'occupied', 14.00, 15400, 1),
('bbbbbbbb-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'B-202', 2, 'residential', 1400, 3, 2, 'available', 14.00, 19600, 1),

-- Club House Units (new building)
('cccccccc-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'CH-001', 1, 'office', 800, 0, 1, 'available', 20.00, 16000, 0),
('cccccccc-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'CH-002', 1, 'amenity', 600, 0, 2, 'available', 25.00, 15000, 0);

-- Add sample owner/tenant data to units
UPDATE society_units SET 
  owner_name = 'Rajesh Kumar',
  tenant_name = 'Rajesh Kumar'
WHERE unit_number = 'A-201';

UPDATE society_units SET 
  owner_name = 'Priya Sharma',
  tenant_name = 'Priya Sharma'  
WHERE unit_number = 'B-201';

UPDATE society_units SET 
  owner_name = 'Green Valley Society',
  tenant_name = NULL
WHERE unit_number IN ('CH-001', 'CH-002');