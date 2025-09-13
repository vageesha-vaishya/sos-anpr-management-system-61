-- Insert sample organizations
INSERT INTO organizations (id, name, organization_type) VALUES 
('11111111-1111-1111-1111-111111111111', 'Sample Residential Society', 'customer')
ON CONFLICT (id) DO NOTHING;

-- Insert sample staff members
INSERT INTO staff_members (id, full_name, position, email, phone, organization_id, status, employee_id, hire_date) VALUES 
('22222222-2222-2222-2222-222222222222', 'John Smith', 'Maintenance Supervisor', 'john.smith@society.com', '+1234567890', '11111111-1111-1111-1111-111111111111', 'active', 'EMP001', '2023-01-15'),
('33333333-3333-3333-3333-333333333333', 'Sarah Johnson', 'Security Manager', 'sarah.johnson@society.com', '+1234567891', '11111111-1111-1111-1111-111111111111', 'active', 'EMP002', '2023-02-01'),
('44444444-4444-4444-4444-444444444444', 'Mike Wilson', 'IT Support', 'mike.wilson@society.com', '+1234567892', '11111111-1111-1111-1111-111111111111', 'active', 'EMP003', '2023-03-10')
ON CONFLICT (id) DO NOTHING;

-- Insert sample help desk tickets
INSERT INTO helpdesk_tickets (id, ticket_number, title, description, category, priority, status, created_by, assigned_to, organization_id, created_at, updated_at) VALUES 
('55555555-5555-5555-5555-555555555555', 'TKT-001001', 'Broken elevator in Building A', 'The elevator in Building A has been making strange noises and stopped working this morning. Residents are unable to use it.', 'Maintenance', 'high', 'open', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('66666666-6666-6666-6666-666666666666', 'TKT-001002', 'WiFi not working in common area', 'The WiFi connection in the community hall is very slow and keeps disconnecting during meetings.', 'IT', 'medium', 'in_progress', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'),
('77777777-7777-7777-7777-777777777777', 'TKT-001003', 'Security gate malfunction', 'The main security gate is not responding to access cards properly. Some residents are getting stuck.', 'Security', 'high', 'open', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('88888888-8888-8888-8888-888888888888', 'TKT-001004', 'Plumbing leak in Building B', 'There is a water leak in the basement of Building B near the parking area. Water is pooling.', 'Plumbing', 'medium', 'closed', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
('99999999-9999-9999-9999-999999999999', 'TKT-001005', 'Street light not working', 'The street light near the playground has been out for several days. Safety concern for evening hours.', 'Electrical', 'medium', 'open', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;