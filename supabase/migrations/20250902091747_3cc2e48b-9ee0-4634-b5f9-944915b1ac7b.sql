-- Insert sample data for helpdesk tickets with sample polls
DO $$
DECLARE
  platform_org_id uuid;
  admin_user_id uuid;
  dept_security_id uuid;
  dept_maintenance_id uuid;
  staff_john_id uuid;
  staff_mike_id uuid;
BEGIN
  -- Get platform organization ID
  SELECT id INTO platform_org_id FROM organizations WHERE organization_type = 'platform' LIMIT 1;
  
  -- Get admin user ID (first user in profiles table)
  SELECT id INTO admin_user_id FROM profiles LIMIT 1;
  
  -- Get department IDs
  SELECT id INTO dept_security_id FROM departments WHERE name = 'Security' AND organization_id = platform_org_id LIMIT 1;
  SELECT id INTO dept_maintenance_id FROM departments WHERE name = 'Maintenance' AND organization_id = platform_org_id LIMIT 1;
  
  -- Get staff member IDs  
  SELECT id INTO staff_john_id FROM staff_members WHERE full_name = 'John Smith' AND organization_id = platform_org_id LIMIT 1;
  SELECT id INTO staff_mike_id FROM staff_members WHERE full_name = 'Mike Johnson' AND organization_id = platform_org_id LIMIT 1;

  -- Insert sample staff members with proper date casting
  INSERT INTO public.staff_members (employee_id, full_name, email, phone, department_id, position, salary, hire_date, organization_id) 
  SELECT 
    'EMP' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
    staff_data.full_name,
    staff_data.email,
    staff_data.phone,
    d.id,
    staff_data.position,
    staff_data.salary,
    staff_data.hire_date::DATE,
    platform_org_id
  FROM (VALUES
    ('John Smith', 'john.smith@adda.com', '+1-555-0101', 'Security', 'Security Manager', 55000.00, '2023-01-15'),
    ('Mike Johnson', 'mike.johnson@adda.com', '+1-555-0102', 'Maintenance', 'Maintenance Supervisor', 48000.00, '2023-02-01'),
    ('Sarah Williams', 'sarah.williams@adda.com', '+1-555-0103', 'Administration', 'Admin Manager', 52000.00, '2023-01-20'),
    ('Maria Garcia', 'maria.garcia@adda.com', '+1-555-0104', 'Housekeeping', 'Housekeeping Supervisor', 38000.00, '2023-03-01'),
    ('David Brown', 'david.brown@adda.com', '+1-555-0105', 'Finance', 'Finance Manager', 65000.00, '2023-01-10'),
    ('Alex Chen', 'alex.chen@adda.com', '+1-555-0106', 'IT Support', 'IT Manager', 62000.00, '2023-02-15'),
    ('Robert Taylor', 'robert.taylor@adda.com', '+1-555-0107', 'Legal', 'Legal Advisor', 68000.00, '2023-01-25'),
    ('Lisa Anderson', 'lisa.anderson@adda.com', '+1-555-0108', 'Management', 'General Manager', 85000.00, '2023-01-05'),
    ('James Wilson', 'james.wilson@adda.com', '+1-555-0109', 'Security', 'Security Guard', 35000.00, '2023-04-01'),
    ('Emma Davis', 'emma.davis@adda.com', '+1-555-0110', 'Maintenance', 'Maintenance Technician', 42000.00, '2023-03-15'),
    ('Jennifer Lee', 'jennifer.lee@adda.com', '+1-555-0111', 'Administration', 'Administrative Assistant', 38000.00, '2023-04-10'),
    ('Carlos Rodriguez', 'carlos.rodriguez@adda.com', '+1-555-0112', 'Housekeeping', 'Cleaner', 32000.00, '2023-05-01'),
    ('Anna Thompson', 'anna.thompson@adda.com', '+1-555-0113', 'Finance', 'Accountant', 45000.00, '2023-03-20'),
    ('Tom Mitchell', 'tom.mitchell@adda.com', '+1-555-0114', 'IT Support', 'IT Technician', 40000.00, '2023-04-05'),
    ('Sophie Martin', 'sophie.martin@adda.com', '+1-555-0115', 'Administration', 'Receptionist', 35000.00, '2023-05-15'),
    ('Daniel White', 'daniel.white@adda.com', '+1-555-0116', 'Security', 'Security Guard', 35000.00, '2023-05-20'),
    ('Rachel Green', 'rachel.green@adda.com', '+1-555-0117', 'Maintenance', 'Maintenance Helper', 38000.00, '2023-06-01'),
    ('Kevin Clark', 'kevin.clark@adda.com', '+1-555-0118', 'Housekeeping', 'Cleaner', 32000.00, '2023-06-10'),
    ('Michelle Hall', 'michelle.hall@adda.com', '+1-555-0119', 'Finance', 'Financial Analyst', 50000.00, '2023-04-15'),
    ('Ryan Baker', 'ryan.baker@adda.com', '+1-555-0120', 'IT Support', 'Network Administrator', 55000.00, '2023-03-10')
  ) AS staff_data(full_name, email, phone, dept_name, position, salary, hire_date)
  JOIN public.departments d ON d.name = staff_data.dept_name AND d.organization_id = platform_org_id;

  -- Insert sample helpdesk tickets with proper ticket numbering
  INSERT INTO public.helpdesk_tickets (ticket_number, title, description, category, priority, status, created_by, assigned_to, organization_id) VALUES
  ('TKT-001', 'Broken elevator in Building A', 'The main elevator in Building A is making strange noises and stopped working this morning. Residents are unable to use it.', 'Maintenance', 'high', 'open', admin_user_id, staff_mike_id, platform_org_id),
  ('TKT-002', 'Security camera not working', 'Security camera at main gate is not recording. Need immediate fix for security purposes.', 'Security', 'high', 'in_progress', admin_user_id, staff_john_id, platform_org_id),
  ('TKT-003', 'Water leakage in Unit B-205', 'Resident reported water leakage from ceiling in their kitchen. Urgent plumbing required.', 'Plumbing', 'high', 'open', admin_user_id, staff_mike_id, platform_org_id),
  ('TKT-004', 'Power outage in parking area', 'Parking area lighting is completely out. Need electrical inspection and repair.', 'Electrical', 'medium', 'open', admin_user_id, staff_mike_id, platform_org_id),
  ('TKT-005', 'Gym equipment maintenance', 'Treadmill in community gym needs servicing. Making unusual sounds during operation.', 'Maintenance', 'low', 'closed', admin_user_id, staff_mike_id, platform_org_id),
  ('TKT-006', 'Pool cleaning required', 'Swimming pool water is cloudy and needs chemical treatment and cleaning.', 'Maintenance', 'medium', 'in_progress', admin_user_id, staff_mike_id, platform_org_id),
  ('TKT-007', 'Visitor parking shortage', 'Insufficient visitor parking spaces during peak hours. Need policy review.', 'Administration', 'low', 'open', admin_user_id, NULL, platform_org_id),
  ('TKT-008', 'AC not working in Unit C-301', 'Air conditioning system in Unit C-301 stopped working. Resident needs immediate assistance.', 'HVAC', 'high', 'open', admin_user_id, staff_mike_id, platform_org_id),
  ('TKT-009', 'Noise complaint - Unit D-402', 'Multiple noise complaints about loud music from Unit D-402 during night hours.', 'Security', 'medium', 'closed', admin_user_id, staff_john_id, platform_org_id),
  ('TKT-010', 'Garden sprinkler system broken', 'Automatic sprinkler system in main garden area is not functioning properly.', 'Landscaping', 'low', 'open', admin_user_id, staff_mike_id, platform_org_id),
  ('TKT-011', 'Internet connectivity issues', 'Common area WiFi is not working. Residents unable to access internet in lobby and recreation areas.', 'IT', 'medium', 'open', admin_user_id, NULL, platform_org_id),
  ('TKT-012', 'Playground equipment safety check', 'Annual safety inspection required for children playground equipment.', 'Safety', 'medium', 'in_progress', admin_user_id, staff_john_id, platform_org_id),
  ('TKT-013', 'Garbage disposal truck access', 'Garbage truck cannot access building due to construction barriers. Need alternative arrangement.', 'Waste Management', 'high', 'open', admin_user_id, NULL, platform_org_id),
  ('TKT-014', 'Fire alarm system testing', 'Monthly fire alarm system testing and maintenance required for all buildings.', 'Safety', 'high', 'closed', admin_user_id, staff_john_id, platform_org_id),
  ('TKT-015', 'Parking gate malfunction', 'Automated parking gate is not responding to remote controls. Manual operation required.', 'Security', 'medium', 'open', admin_user_id, staff_john_id, platform_org_id);

  -- Insert sample community polls
  INSERT INTO public.community_polls (title, description, poll_type, start_date, end_date, is_active, is_anonymous, created_by, organization_id) VALUES
  ('Community Gym Hours Extension', 'Should we extend community gym hours from 6 AM - 10 PM to 5 AM - 11 PM?', 'single_choice', now() - interval '5 days', now() + interval '3 days', true, false, admin_user_id, platform_org_id),
  ('New Swimming Pool Rules', 'What should be the maximum allowed time per person in the swimming pool during peak hours?', 'single_choice', now() - interval '3 days', now() + interval '5 days', true, false, admin_user_id, platform_org_id),
  ('Visitor Parking Fee', 'Should we implement a nominal fee for visitor parking to manage overcrowding?', 'single_choice', now() - interval '7 days', now() + interval '1 day', true, true, admin_user_id, platform_org_id),
  ('Community Event Preferences', 'Which community events would you like to see more of? (Select multiple)', 'multiple_choice', now() - interval '2 days', now() + interval '7 days', true, false, admin_user_id, platform_org_id),
  ('Building Security Measures', 'What additional security measures should we implement?', 'multiple_choice', now() - interval '1 day', now() + interval '10 days', true, false, admin_user_id, platform_org_id),
  ('Maintenance Schedule Timing', 'What time is most convenient for routine maintenance activities?', 'single_choice', now() - interval '4 days', now() + interval '4 days', true, false, admin_user_id, platform_org_id),
  ('Pet Policy Review', 'Should we allow more pet types in the community? Current policy allows only dogs and cats.', 'single_choice', now() - interval '6 days', now() - interval '1 day', false, false, admin_user_id, platform_org_id),
  ('Community Garden Initiative', 'Are you interested in starting a community garden project?', 'single_choice', now() - interval '8 days', now() - interval '2 days', false, false, admin_user_id, platform_org_id);

END $$;

-- Insert poll options for the community polls
DO $$
DECLARE
  poll_rec RECORD;
  poll_gym_id uuid;
  poll_pool_id uuid;
  poll_parking_id uuid;
  poll_events_id uuid;
  poll_security_id uuid;
  poll_maintenance_id uuid;
  poll_pet_id uuid;
  poll_garden_id uuid;
BEGIN
  -- Get poll IDs
  SELECT id INTO poll_gym_id FROM community_polls WHERE title = 'Community Gym Hours Extension' LIMIT 1;
  SELECT id INTO poll_pool_id FROM community_polls WHERE title = 'New Swimming Pool Rules' LIMIT 1;
  SELECT id INTO poll_parking_id FROM community_polls WHERE title = 'Visitor Parking Fee' LIMIT 1;
  SELECT id INTO poll_events_id FROM community_polls WHERE title = 'Community Event Preferences' LIMIT 1;
  SELECT id INTO poll_security_id FROM community_polls WHERE title = 'Building Security Measures' LIMIT 1;
  SELECT id INTO poll_maintenance_id FROM community_polls WHERE title = 'Maintenance Schedule Timing' LIMIT 1;
  SELECT id INTO poll_pet_id FROM community_polls WHERE title = 'Pet Policy Review' LIMIT 1;
  SELECT id INTO poll_garden_id FROM community_polls WHERE title = 'Community Garden Initiative' LIMIT 1;

  -- Insert poll options for Gym Hours Extension
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
  (poll_gym_id, 'Yes, extend to 5 AM - 11 PM', 45),
  (poll_gym_id, 'No, keep current hours 6 AM - 10 PM', 23),
  (poll_gym_id, 'Extend only evening hours to 11 PM', 31);

  -- Insert poll options for Swimming Pool Rules
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
  (poll_pool_id, '30 minutes maximum', 28),
  (poll_pool_id, '45 minutes maximum', 41),
  (poll_pool_id, '60 minutes maximum', 22),
  (poll_pool_id, 'No time limit needed', 8);

  -- Insert poll options for Visitor Parking Fee
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
  (poll_parking_id, 'Yes, implement ₹50 per day', 52),
  (poll_parking_id, 'Yes, implement ₹100 per day', 18),
  (poll_parking_id, 'No, keep it free', 34),
  (poll_parking_id, 'First 2 hours free, then ₹25/hour', 67);

  -- Insert poll options for Community Event Preferences
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
  (poll_events_id, 'Fitness and yoga classes', 89),
  (poll_events_id, 'Cultural festivals and celebrations', 76),
  (poll_events_id, 'Kids activities and workshops', 65),
  (poll_events_id, 'Food festivals and cooking classes', 54),
  (poll_events_id, 'Educational seminars and workshops', 43),
  (poll_events_id, 'Sports tournaments and competitions', 58);

  -- Insert poll options for Building Security Measures
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
  (poll_security_id, 'Additional CCTV cameras', 78),
  (poll_security_id, 'Biometric access control', 65),
  (poll_security_id, 'Security guards at all entry points', 54),
  (poll_security_id, 'Improved lighting in common areas', 71),
  (poll_security_id, 'Visitor verification system upgrade', 49);

  -- Insert poll options for Maintenance Schedule Timing
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
  (poll_maintenance_id, 'Early morning (6 AM - 9 AM)', 25),
  (poll_maintenance_id, 'Mid-morning (9 AM - 12 PM)', 67),
  (poll_maintenance_id, 'Afternoon (2 PM - 5 PM)', 43),
  (poll_maintenance_id, 'Weekend mornings', 38);

  -- Insert poll options for Pet Policy Review
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
  (poll_pet_id, 'Yes, allow birds and rabbits', 34),
  (poll_pet_id, 'Yes, allow all small pets', 28),
  (poll_pet_id, 'No, keep current policy', 45),
  (poll_pet_id, 'Allow with additional deposit', 19);

  -- Insert poll options for Community Garden Initiative
  INSERT INTO public.poll_options (poll_id, option_text, vote_count) VALUES
  (poll_garden_id, 'Very interested, will participate actively', 42),
  (poll_garden_id, 'Somewhat interested, occasional help', 36),
  (poll_garden_id, 'Support the idea but won\'t participate', 18),
  (poll_garden_id, 'Not interested', 12);

END $$;