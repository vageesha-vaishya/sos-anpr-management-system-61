-- Insert sample helpdesk tickets and polls
DO $$
DECLARE
  platform_org_id uuid;
  sample_user_id uuid;
BEGIN
  -- Get platform organization ID
  SELECT id INTO platform_org_id FROM organizations WHERE organization_type = 'platform' LIMIT 1;
  
  -- Get a sample user ID (first profile found)
  SELECT id INTO sample_user_id FROM profiles LIMIT 1;
  
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
    staff_data.hire_date::date,
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

  -- Insert sample helpdesk tickets
  INSERT INTO public.helpdesk_tickets (ticket_number, title, description, category, priority, status, created_by, assigned_to, organization_id) 
  SELECT 
    'TICKET-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
    ticket_data.title,
    ticket_data.description,
    ticket_data.category,
    ticket_data.priority,
    ticket_data.status,
    sample_user_id,
    sm.id,
    platform_org_id
  FROM (VALUES
    ('AC Not Working in Unit A-101', 'The air conditioning unit in apartment A-101 is not cooling properly. Tenant has reported the issue multiple times.', 'Maintenance', 'high', 'open'),
    ('Elevator Making Strange Noise', 'Residents have reported that the main elevator is making unusual grinding sounds when moving between floors.', 'Maintenance', 'medium', 'in_progress'),
    ('Parking Slot Assignment Request', 'New resident in unit B-205 requesting assignment of a parking slot near the building entrance.', 'Administration', 'low', 'open'),
    ('Water Leakage in Common Area', 'Water leakage observed in the lobby area ceiling. Needs immediate attention to prevent damage.', 'Maintenance', 'high', 'open'),
    ('Security Camera Malfunction', 'Security camera at the main gate is not functioning. Display shows blank screen.', 'Security', 'medium', 'assigned'),
    ('Garbage Collection Issue', 'Garbage has not been collected from the common area for 3 days. Causing hygiene concerns.', 'Housekeeping', 'medium', 'open'),
    ('Internet Connectivity Problem', 'WiFi in common areas is frequently disconnecting. Multiple residents have complained.', 'IT Support', 'medium', 'in_progress'),
    ('Swimming Pool Maintenance', 'Pool water appears cloudy and needs chemical treatment and cleaning.', 'Maintenance', 'low', 'scheduled'),
    ('Visitor Parking Full', 'Visitor parking area is always full. Need to implement a reservation system.', 'Administration', 'low', 'open'),
    ('Noise Complaint', 'Residents of unit C-301 have filed noise complaint against unit C-302 for late night disturbances.', 'Administration', 'medium', 'under_review'),
    ('Fire Alarm Testing', 'Monthly fire alarm system testing and maintenance required as per safety regulations.', 'Security', 'medium', 'scheduled'),
    ('Garden Maintenance', 'Garden area needs trimming and replanting. Some plants have dried up.', 'Maintenance', 'low', 'open'),
    ('Intercom System Issue', 'Intercom system in building B is not working properly. Residents cannot communicate with security.', 'IT Support', 'high', 'assigned'),
    ('Pest Control Request', 'Multiple units have reported cockroach infestation. Need immediate pest control service.', 'Housekeeping', 'high', 'in_progress'),
    ('Gym Equipment Repair', 'Treadmill in community gym is not working. Display shows error message.', 'Maintenance', 'low', 'open')
  ) AS ticket_data(title, description, category, priority, status)
  CROSS JOIN LATERAL (
    SELECT id FROM public.staff_members 
    WHERE organization_id = platform_org_id 
    ORDER BY random() 
    LIMIT 1
  ) sm;

  -- Insert sample community polls
  INSERT INTO public.community_polls (title, description, poll_type, start_date, end_date, is_active, is_anonymous, created_by, organization_id) VALUES
  ('Swimming Pool Hours Extension', 'Should we extend swimming pool hours to 10 PM during weekends?', 'single_choice', now() - interval '2 days', now() + interval '5 days', true, false, sample_user_id, platform_org_id),
  ('New Gym Equipment Purchase', 'Which new equipment should we prioritize for the community gym?', 'single_choice', now() - interval '1 day', now() + interval '7 days', true, false, sample_user_id, platform_org_id),
  ('Parking Policy Changes', 'Should we implement time-based parking restrictions for visitors?', 'single_choice', now() - interval '3 days', now() + interval '4 days', true, true, sample_user_id, platform_org_id),
  ('Community Garden Project', 'Would you be interested in participating in a community garden project?', 'single_choice', now() - interval '5 days', now() + interval '2 days', true, false, sample_user_id, platform_org_id),
  ('Monthly Social Events', 'What type of monthly social events would you prefer?', 'single_choice', now() - interval '1 week', now() + interval '1 week', true, false, sample_user_id, platform_org_id);

  -- Insert poll options
  INSERT INTO public.poll_options (poll_id, option_text) 
  SELECT cp.id, option_data.option_text
  FROM public.community_polls cp
  CROSS JOIN LATERAL (
    VALUES 
      (CASE WHEN cp.title = 'Swimming Pool Hours Extension' THEN 'Yes, extend to 10 PM' ELSE NULL END),
      (CASE WHEN cp.title = 'Swimming Pool Hours Extension' THEN 'No, keep current hours' ELSE NULL END),
      (CASE WHEN cp.title = 'Swimming Pool Hours Extension' THEN 'Extend to 9 PM only' ELSE NULL END),
      (CASE WHEN cp.title = 'New Gym Equipment Purchase' THEN 'Rowing Machine' ELSE NULL END),
      (CASE WHEN cp.title = 'New Gym Equipment Purchase' THEN 'Spin Bikes' ELSE NULL END),
      (CASE WHEN cp.title = 'New Gym Equipment Purchase' THEN 'Weight Training Equipment' ELSE NULL END),
      (CASE WHEN cp.title = 'New Gym Equipment Purchase' THEN 'Yoga Equipment' ELSE NULL END),
      (CASE WHEN cp.title = 'Parking Policy Changes' THEN 'Yes, 2-hour limit' ELSE NULL END),
      (CASE WHEN cp.title = 'Parking Policy Changes' THEN 'Yes, 4-hour limit' ELSE NULL END),
      (CASE WHEN cp.title = 'Parking Policy Changes' THEN 'No restrictions' ELSE NULL END),
      (CASE WHEN cp.title = 'Community Garden Project' THEN 'Very interested' ELSE NULL END),
      (CASE WHEN cp.title = 'Community Garden Project' THEN 'Somewhat interested' ELSE NULL END),
      (CASE WHEN cp.title = 'Community Garden Project' THEN 'Not interested' ELSE NULL END),
      (CASE WHEN cp.title = 'Monthly Social Events' THEN 'Movie Nights' ELSE NULL END),
      (CASE WHEN cp.title = 'Monthly Social Events' THEN 'Potluck Dinners' ELSE NULL END),
      (CASE WHEN cp.title = 'Monthly Social Events' THEN 'Game Tournaments' ELSE NULL END),
      (CASE WHEN cp.title = 'Monthly Social Events' THEN 'Cultural Events' ELSE NULL END)
  ) AS option_data(option_text)
  WHERE option_data.option_text IS NOT NULL
  AND cp.organization_id = platform_org_id;

  -- Insert some sample votes
  INSERT INTO public.poll_votes (poll_id, option_id, voter_id)
  SELECT 
    po.poll_id,
    po.id,
    sample_user_id
  FROM public.poll_options po
  JOIN public.community_polls cp ON po.poll_id = cp.id
  WHERE cp.organization_id = platform_org_id
  AND random() < 0.6; -- 60% chance of voting for each option

  -- Update vote counts
  UPDATE public.poll_options 
  SET vote_count = (
    SELECT COUNT(*) 
    FROM public.poll_votes pv 
    WHERE pv.option_id = poll_options.id
  );

END $$;