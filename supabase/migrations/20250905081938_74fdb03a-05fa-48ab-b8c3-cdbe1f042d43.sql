-- Add sample data for testing critical fixes

-- Add sample announcements
INSERT INTO announcements (title, content, category, priority, target_audience, organization_id) VALUES
('Maintenance Notice', 'Water supply will be shut off on Sunday from 9 AM to 2 PM for pipe maintenance.', 'maintenance', 'high', 'all', '00000000-0000-0000-0000-000000000000'),
('Community Event', 'Join us for the annual community BBQ this Saturday at 6 PM in the community hall.', 'events', 'medium', 'all', '00000000-0000-0000-0000-000000000000'),
('Security Update', 'New security cameras have been installed at all entry points.', 'security', 'low', 'all', '00000000-0000-0000-0000-000000000000'),
('Billing Reminder', 'Monthly maintenance charges are due by the 5th of every month.', 'billing', 'medium', 'owners', '00000000-0000-0000-0000-000000000000');

-- Add sample helpdesk tickets with better relationships
INSERT INTO helpdesk_tickets (ticket_number, title, description, category, priority, status, organization_id) VALUES
('TKT-2024-001', 'Elevator Not Working', 'Elevator in Building A is stuck on the 3rd floor', 'maintenance', 'high', 'open', '00000000-0000-0000-0000-000000000000'),
('TKT-2024-002', 'Parking Slot Issue', 'Car parked in my assigned slot', 'parking', 'medium', 'in_progress', '00000000-0000-0000-0000-000000000000'),
('TKT-2024-003', 'Water Leakage', 'Water leaking from ceiling in apartment 401', 'plumbing', 'high', 'open', '00000000-0000-0000-0000-000000000000'),
('TKT-2024-004', 'Noise Complaint', 'Loud music from neighbor late at night', 'noise', 'low', 'closed', '00000000-0000-0000-0000-000000000000'),
('TKT-2024-005', 'Gate Access Card', 'Access card not working at main gate', 'security', 'medium', 'open', '00000000-0000-0000-0000-000000000000');

-- Add sample community events
INSERT INTO community_events (title, description, event_type, start_date, end_date, start_time, end_time, location, organization_id) VALUES
('Annual General Meeting', 'Discuss budget and upcoming projects for the year', 'meeting', '2024-02-15', '2024-02-15', '18:00', '20:00', 'Community Hall', '00000000-0000-0000-0000-000000000000'),
('Kids Sports Day', 'Fun sports activities for children aged 5-15', 'sports', '2024-02-20', '2024-02-20', '09:00', '17:00', 'Community Playground', '00000000-0000-0000-0000-000000000000'),
('Holi Celebration', 'Community Holi festival with colors and music', 'festival', '2024-03-08', '2024-03-08', '16:00', '19:00', 'Community Garden', '00000000-0000-0000-0000-000000000000'),
('Blood Donation Camp', 'Free blood donation camp organized by local hospital', 'health', '2024-02-25', '2024-02-25', '10:00', '16:00', 'Community Hall', '00000000-0000-0000-0000-000000000000');

-- Add sample alerts
INSERT INTO alerts (title, message, alert_type, severity, organization_id) VALUES
('Security Alert', 'Unauthorized person spotted near Building B at 2 AM', 'security', 'high', '00000000-0000-0000-0000-000000000000'),
('Water Supply', 'Water supply restored after maintenance work', 'system', 'low', '00000000-0000-0000-0000-000000000000'),
('Payment Reminder', 'Monthly maintenance charges due in 3 days', 'billing', 'medium', '00000000-0000-0000-0000-000000000000');