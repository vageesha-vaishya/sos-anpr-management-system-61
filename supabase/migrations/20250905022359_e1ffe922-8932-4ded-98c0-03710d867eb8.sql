-- Insert sample data for all new tables

-- Get the platform organization ID for sample data
DO $$
DECLARE
    platform_org_id UUID;
    admin_user_id UUID;
    building_id_1 UUID;
    building_id_2 UUID;
    unit_id_1 UUID;
    unit_id_2 UUID;
    account_id_cash UUID;
    account_id_bank UUID;
    account_id_income UUID;
    account_id_expense UUID;
    journal_entry_id UUID;
BEGIN
    -- Get platform organization
    SELECT id INTO platform_org_id FROM organizations WHERE organization_type = 'platform' LIMIT 1;
    
    -- Get admin user (assuming it exists)
    SELECT id INTO admin_user_id FROM profiles WHERE role = 'platform_admin' LIMIT 1;
    
    -- Get some building IDs for sample data
    SELECT id INTO building_id_1 FROM buildings LIMIT 1;
    SELECT id INTO building_id_2 FROM buildings OFFSET 1 LIMIT 1;
    
    -- Get some unit IDs for sample data
    SELECT id INTO unit_id_1 FROM society_units LIMIT 1;
    SELECT id INTO unit_id_2 FROM society_units OFFSET 1 LIMIT 1;

    -- Insert sample announcements
    INSERT INTO public.announcements (organization_id, title, content, priority, category, target_audience, expiry_date, created_by) VALUES
    (platform_org_id, 'Society Maintenance Notice', 'The society maintenance will be conducted on Saturday from 10 AM to 2 PM. Water supply will be affected.', 'high', 'maintenance', 'all', CURRENT_DATE + INTERVAL '7 days', admin_user_id),
    (platform_org_id, 'Community Festival Announcement', 'Join us for the annual community festival on December 25th. Various cultural activities and food stalls will be available.', 'medium', 'event', 'residents', CURRENT_DATE + INTERVAL '30 days', admin_user_id),
    (platform_org_id, 'Parking Policy Update', 'New parking guidelines have been implemented. Please ensure vehicles are parked only in designated areas.', 'medium', 'policy', 'all', CURRENT_DATE + INTERVAL '90 days', admin_user_id),
    (platform_org_id, 'Security Alert', 'Please be cautious of unauthorized visitors. Always verify visitor passes with security.', 'urgent', 'security', 'residents', CURRENT_DATE + INTERVAL '14 days', admin_user_id),
    (platform_org_id, 'Amenity Booking System Update', 'The amenity booking system has been upgraded. New features include online payment and automated confirmations.', 'low', 'system', 'residents', CURRENT_DATE + INTERVAL '60 days', admin_user_id);

    -- Insert sample service bookings
    INSERT INTO public.service_bookings (organization_id, customer_id, unit_id, service_type, service_description, booking_date, time_slot, status, amount, special_instructions) VALUES
    (platform_org_id, admin_user_id, unit_id_1, 'Plumbing', 'Kitchen sink repair and pipe cleaning', CURRENT_DATE + INTERVAL '2 days', '10:00 AM - 12:00 PM', 'confirmed', 500.00, 'Please call before arriving'),
    (platform_org_id, admin_user_id, unit_id_2, 'Electrical', 'Fan installation in living room', CURRENT_DATE + INTERVAL '5 days', '2:00 PM - 4:00 PM', 'pending', 800.00, 'Ladder required'),
    (platform_org_id, admin_user_id, unit_id_1, 'Cleaning', 'Deep cleaning service for entire apartment', CURRENT_DATE + INTERVAL '7 days', '9:00 AM - 5:00 PM', 'completed', 1200.00, 'Please provide cleaning supplies'),
    (platform_org_id, admin_user_id, unit_id_2, 'Painting', 'Bedroom wall painting - blue color', CURRENT_DATE + INTERVAL '10 days', '10:00 AM - 6:00 PM', 'confirmed', 2500.00, 'Paint color: Royal Blue'),
    (platform_org_id, admin_user_id, unit_id_1, 'AC Service', 'Annual AC maintenance and gas refilling', CURRENT_DATE + INTERVAL '3 days', '11:00 AM - 1:00 PM', 'in_progress', 350.00, 'Two AC units to be serviced');

    -- Insert sample visitor invitations
    INSERT INTO public.visitor_invitations (organization_id, host_id, visitor_name, visitor_phone, guest_code, visit_date, visit_time_from, visit_time_to, purpose, vehicle_number) VALUES
    (platform_org_id, admin_user_id, 'John Smith', '+91-9876543210', 'GUEST2024001', CURRENT_DATE + INTERVAL '1 day', '10:00', '18:00', 'Family visit', 'DL-01-AB-1234'),
    (platform_org_id, admin_user_id, 'Sarah Johnson', '+91-9876543211', 'GUEST2024002', CURRENT_DATE + INTERVAL '3 days', '14:00', '20:00', 'Birthday party', 'DL-02-CD-5678'),
    (platform_org_id, admin_user_id, 'Mike Wilson', '+91-9876543212', 'GUEST2024003', CURRENT_DATE + INTERVAL '2 days', '09:00', '17:00', 'Business meeting', 'DL-03-EF-9012'),
    (platform_org_id, admin_user_id, 'Emily Davis', '+91-9876543213', 'GUEST2024004', CURRENT_DATE + INTERVAL '5 days', '16:00', '22:00', 'Social visit', ''),
    (platform_org_id, admin_user_id, 'Robert Brown', '+91-9876543214', 'GUEST2024005', CURRENT_DATE + INTERVAL '7 days', '12:00', '15:00', 'Delivery service', 'DL-04-GH-3456');

    -- Insert sample digital ID cards
    INSERT INTO public.digital_id_cards (organization_id, user_id, card_number, qr_code_data, card_type, access_permissions) VALUES
    (platform_org_id, admin_user_id, 'ADDA-2024-001', 'QR_DATA_ENCRYPTED_001', 'resident', '{"building_access": ["all"], "amenity_access": ["gym", "pool", "clubhouse"], "parking_access": ["level_1", "level_2"]}'),
    (platform_org_id, admin_user_id, 'ADDA-2024-002', 'QR_DATA_ENCRYPTED_002', 'staff', '{"building_access": ["all"], "amenity_access": ["staff_room"], "parking_access": ["staff_parking"], "admin_access": ["maintenance_room"]}'),
    (platform_org_id, admin_user_id, 'ADDA-2024-003', 'QR_DATA_ENCRYPTED_003', 'visitor', '{"building_access": ["lobby", "visitor_area"], "amenity_access": [], "parking_access": ["visitor_parking"], "time_limit": "24_hours"}'),
    (platform_org_id, admin_user_id, 'ADDA-2024-004', 'QR_DATA_ENCRYPTED_004', 'emergency', '{"building_access": ["all"], "amenity_access": ["all"], "parking_access": ["all"], "override_access": true}'),
    (platform_org_id, admin_user_id, 'ADDA-2024-005', 'QR_DATA_ENCRYPTED_005', 'resident', '{"building_access": ["building_a"], "amenity_access": ["gym", "garden"], "parking_access": ["level_1"]}');

    -- Insert sample social network posts
    INSERT INTO public.social_network_posts (organization_id, author_id, title, content, post_type, visibility, attachments) VALUES
    (platform_org_id, admin_user_id, 'Welcome to our Community!', 'Hello everyone! I am excited to be part of this wonderful community. Looking forward to meeting all the neighbors and participating in community activities.', 'general', 'all', '[]'),
    (platform_org_id, admin_user_id, 'Lost Cat - Please Help!', 'My cat Whiskers has been missing since yesterday evening. He is a gray tabby with white paws. If you see him, please contact me immediately. Reward offered!', 'help', 'residents', '[{"type": "image", "url": "/uploads/cat_photo.jpg"}]'),
    (platform_org_id, admin_user_id, 'Community Garden Initiative', 'Would anyone be interested in starting a community garden? We have unused space behind Building B that could be perfect for growing vegetables and herbs.', 'general', 'residents', '[]'),
    (platform_org_id, admin_user_id, 'Selling Furniture - Moving Sale', 'Moving out next month and selling furniture at great prices. Sofa set, dining table, refrigerator, and more. WhatsApp for details and photos.', 'marketplace', 'all', '[{"type": "image", "url": "/uploads/furniture1.jpg"}, {"type": "image", "url": "/uploads/furniture2.jpg"}]'),
    (platform_org_id, admin_user_id, 'Security Concern - Package Theft', 'There have been reports of package theft in our building. Please be cautious about deliveries and consider using the community package room.', 'complaint', 'residents', '[]');

    -- Insert sample photo albums
    INSERT INTO public.photo_albums (organization_id, album_name, description, cover_photo_url, photos, created_by) VALUES
    (platform_org_id, 'Community Festival 2024', 'Annual community festival celebrating cultural diversity', '/uploads/festival_cover.jpg', '[{"url": "/uploads/festival1.jpg", "caption": "Cultural dance performance"}, {"url": "/uploads/festival2.jpg", "caption": "Food stalls"}, {"url": "/uploads/festival3.jpg", "caption": "Kids activities"}]', admin_user_id),
    (platform_org_id, 'New Year Celebration', 'Community New Year party at the clubhouse', '/uploads/newyear_cover.jpg', '[{"url": "/uploads/ny1.jpg", "caption": "Countdown moment"}, {"url": "/uploads/ny2.jpg", "caption": "Dance floor"}, {"url": "/uploads/ny3.jpg", "caption": "Fireworks display"}]', admin_user_id),
    (platform_org_id, 'Landscaping Project', 'Before and after photos of our landscaping project', '/uploads/landscape_cover.jpg', '[{"url": "/uploads/before1.jpg", "caption": "Before landscaping"}, {"url": "/uploads/after1.jpg", "caption": "After landscaping"}, {"url": "/uploads/plants.jpg", "caption": "New plants"}]', admin_user_id),
    (platform_org_id, 'Sports Day 2024', 'Annual sports day event for all residents', '/uploads/sports_cover.jpg', '[{"url": "/uploads/sports1.jpg", "caption": "Cricket match"}, {"url": "/uploads/sports2.jpg", "caption": "Swimming competition"}, {"url": "/uploads/sports3.jpg", "caption": "Award ceremony"}]', admin_user_id),
    (platform_org_id, 'Security Training', 'Security awareness training session photos', '/uploads/security_cover.jpg', '[{"url": "/uploads/training1.jpg", "caption": "Training session"}, {"url": "/uploads/training2.jpg", "caption": "Emergency drill"}, {"url": "/uploads/training3.jpg", "caption": "Certificate distribution"}]', admin_user_id);

    -- Insert sample move records
    IF unit_id_1 IS NOT NULL THEN
        INSERT INTO public.move_records (organization_id, unit_id, move_type, resident_name, resident_phone, move_date, checklist_items, security_deposit, key_handover, status, created_by) VALUES
        (platform_org_id, unit_id_1, 'move_in', 'Alex Thompson', '+91-9876543220', CURRENT_DATE - INTERVAL '30 days', '[{"item": "Electricity connection", "completed": true}, {"item": "Water connection", "completed": true}, {"item": "Internet setup", "completed": false}, {"item": "Key handover", "completed": true}]', 10000.00, true, 'completed', admin_user_id),
        (platform_org_id, unit_id_2, 'move_out', 'Jennifer Wilson', '+91-9876543221', CURRENT_DATE + INTERVAL '15 days', '[{"item": "Final utility bills", "completed": false}, {"item": "Damage assessment", "completed": false}, {"item": "Key return", "completed": false}, {"item": "Security deposit refund", "completed": false}]', 10000.00, false, 'pending', admin_user_id);
    END IF;

    -- Insert sample project meetings
    INSERT INTO public.project_meetings (organization_id, title, meeting_type, description, agenda, meeting_date, meeting_time, location, participants, status, created_by) VALUES
    (platform_org_id, 'Quarterly Society Meeting', 'general', 'Regular quarterly meeting to discuss society matters', 'Financial review, upcoming projects, resident concerns', CURRENT_DATE + INTERVAL '10 days', '19:00', 'Community Hall', '[{"name": "John Doe", "role": "Secretary"}, {"name": "Jane Smith", "role": "Treasurer"}, {"name": "Mike Johnson", "role": "President"}]', 'scheduled', admin_user_id),
    (platform_org_id, 'Security Enhancement Project', 'project', 'Planning for enhanced security systems installation', 'CCTV upgrade, access control systems, security guard training', CURRENT_DATE + INTERVAL '5 days', '18:30', 'Committee Room', '[{"name": "Security Head", "role": "Lead"}, {"name": "Technical Team", "role": "Support"}]', 'scheduled', admin_user_id),
    (platform_org_id, 'Building Maintenance Committee', 'committee', 'Monthly building maintenance review', 'Elevator maintenance, plumbing issues, painting schedule', CURRENT_DATE - INTERVAL '5 days', '20:00', 'Virtual Meeting', '[{"name": "Maintenance Head", "role": "Chair"}, {"name": "Building Representatives", "role": "Members"}]', 'completed', admin_user_id);

    -- Insert sample vendor contracts
    INSERT INTO public.vendor_contracts (organization_id, vendor_name, vendor_contact_person, vendor_phone, vendor_email, contract_type, service_description, contract_value, contract_start_date, contract_end_date, payment_terms, performance_rating, status, created_by) VALUES
    (platform_org_id, 'SecureGuard Services', 'Rajesh Kumar', '+91-9876543230', 'rajesh@secureguard.com', 'Security Services', 'Round-the-clock security guard services', 120000.00, CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '6 months', 'Monthly payment', 4.5, 'active', admin_user_id),
    (platform_org_id, 'CleanPro Solutions', 'Priya Sharma', '+91-9876543231', 'priya@cleanpro.com', 'Cleaning Services', 'Daily housekeeping and maintenance cleaning', 80000.00, CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE + INTERVAL '9 months', 'Monthly payment', 4.2, 'active', admin_user_id),
    (platform_org_id, 'GreenThumb Landscaping', 'Suresh Patel', '+91-9876543232', 'suresh@greenthumb.com', 'Landscaping', 'Garden maintenance and landscaping services', 45000.00, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '11 months', 'Quarterly payment', 4.8, 'active', admin_user_id),
    (platform_org_id, 'TechFix Solutions', 'Amit Singh', '+91-9876543233', 'amit@techfix.com', 'Technical Support', 'IT support and system maintenance', 30000.00, CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '10 months', 'Monthly payment', 4.0, 'active', admin_user_id),
    (platform_org_id, 'PowerCorp Electrical', 'Ramesh Gupta', '+91-9876543234', 'ramesh@powercorp.com', 'Electrical Services', 'Electrical maintenance and emergency repairs', 60000.00, CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE + INTERVAL '8 months', 'Monthly payment', 4.3, 'active', admin_user_id);

    -- Insert sample AMC contracts
    INSERT INTO public.amc_contracts (organization_id, equipment_type, equipment_details, contract_number, contract_value, contract_start_date, contract_end_date, service_frequency, next_service_date, renewal_alert_days, status, created_by) VALUES
    (platform_org_id, 'Elevator', 'OTIS Elevator - 6 floors, 1000kg capacity', 'AMC-ELV-2024-001', 150000.00, CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE + INTERVAL '9 months', 'Monthly', CURRENT_DATE + INTERVAL '20 days', 60, 'active', admin_user_id),
    (platform_org_id, 'Generator', 'Cummins 125KVA DG Set', 'AMC-GEN-2024-002', 80000.00, CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '10 months', 'Monthly', CURRENT_DATE + INTERVAL '25 days', 60, 'active', admin_user_id),
    (platform_org_id, 'Water Pump', 'Crompton 5HP Water Pump System', 'AMC-PUMP-2024-003', 35000.00, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '11 months', 'Quarterly', CURRENT_DATE + INTERVAL '60 days', 45, 'active', admin_user_id),
    (platform_org_id, 'Fire Safety', 'Fire extinguishers and alarm system', 'AMC-FIRE-2024-004', 25000.00, CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE + INTERVAL '8 months', 'Semi-annual', CURRENT_DATE + INTERVAL '120 days', 30, 'active', admin_user_id),
    (platform_org_id, 'CCTV System', '32 Channel CCTV surveillance system', 'AMC-CCTV-2024-005', 40000.00, CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE + INTERVAL '7 months', 'Quarterly', CURRENT_DATE + INTERVAL '45 days', 90, 'active', admin_user_id);

    -- Insert sample chart of accounts
    INSERT INTO public.chart_of_accounts (organization_id, account_code, account_name, account_type, account_category, description) VALUES
    (platform_org_id, '1000', 'Cash in Hand', 'asset', 'current_assets', 'Petty cash and cash receipts'),
    (platform_org_id, '1100', 'Bank Account - SBI', 'asset', 'current_assets', 'Society main bank account'),
    (platform_org_id, '1200', 'Maintenance Receivables', 'asset', 'current_assets', 'Outstanding maintenance dues from residents'),
    (platform_org_id, '2000', 'Security Deposits Payable', 'liability', 'current_liabilities', 'Security deposits collected from residents'),
    (platform_org_id, '3000', 'Society Fund', 'equity', 'retained_earnings', 'Accumulated society funds'),
    (platform_org_id, '4000', 'Maintenance Income', 'income', 'operating_income', 'Monthly maintenance charges'),
    (platform_org_id, '4100', 'Amenity Income', 'income', 'operating_income', 'Income from amenity bookings'),
    (platform_org_id, '5000', 'Security Expenses', 'expense', 'operating_expenses', 'Security guard salaries and related costs'),
    (platform_org_id, '5100', 'Cleaning Expenses', 'expense', 'operating_expenses', 'Housekeeping and cleaning costs'),
    (platform_org_id, '5200', 'Utility Expenses', 'expense', 'operating_expenses', 'Electricity, water, and other utilities');

    -- Get some account IDs for journal entries
    SELECT id INTO account_id_cash FROM chart_of_accounts WHERE account_code = '1000' AND organization_id = platform_org_id;
    SELECT id INTO account_id_bank FROM chart_of_accounts WHERE account_code = '1100' AND organization_id = platform_org_id;
    SELECT id INTO account_id_income FROM chart_of_accounts WHERE account_code = '4000' AND organization_id = platform_org_id;
    SELECT id INTO account_id_expense FROM chart_of_accounts WHERE account_code = '5000' AND organization_id = platform_org_id;

    -- Insert sample journal entries
    INSERT INTO public.journal_entries (organization_id, entry_number, entry_date, description, reference_number, total_debit_amount, total_credit_amount, status, created_by) VALUES
    (platform_org_id, 'JE-2024-001', CURRENT_DATE - INTERVAL '10 days', 'Maintenance collection for November 2024', 'MAINT-NOV-2024', 50000.00, 50000.00, 'posted', admin_user_id)
    RETURNING id INTO journal_entry_id;

    -- Insert sample journal entry lines
    IF journal_entry_id IS NOT NULL AND account_id_bank IS NOT NULL AND account_id_income IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount, line_number) VALUES
        (journal_entry_id, account_id_bank, 'Bank deposit - maintenance collection', 50000.00, 0.00, 1),
        (journal_entry_id, account_id_income, 'Maintenance income for November', 0.00, 50000.00, 2);
    END IF;

    -- Insert sample bank accounts
    INSERT INTO public.bank_accounts (organization_id, account_name, bank_name, account_number, account_type, branch_name, ifsc_code, opening_balance, current_balance) VALUES
    (platform_org_id, 'Society Main Account', 'State Bank of India', '12345678901', 'current', 'Sector 15 Branch', 'SBIN0001234', 100000.00, 150000.00),
    (platform_org_id, 'Society Savings Account', 'HDFC Bank', '50001234567890', 'savings', 'Gurgaon Main Branch', 'HDFC0001235', 50000.00, 75000.00),
    (platform_org_id, 'Emergency Fund FD', 'ICICI Bank', '98765432101', 'fixed_deposit', 'Cyber City Branch', 'ICIC0001236', 200000.00, 220000.00);

    -- Insert sample utility readings
    IF building_id_1 IS NOT NULL THEN
        INSERT INTO public.utility_readings (organization_id, utility_type, meter_number, reading_date, previous_reading, current_reading, consumption, rate_per_unit, total_amount, bill_number, due_date, building_id, created_by) VALUES
        (platform_org_id, 'electricity', 'ELE-001-BLD1', CURRENT_DATE - INTERVAL '5 days', 15420.00, 15580.00, 160.00, 6.50, 1040.00, 'ELEC-NOV-2024-001', CURRENT_DATE + INTERVAL '25 days', building_id_1, admin_user_id),
        (platform_org_id, 'water', 'WAT-001-BLD1', CURRENT_DATE - INTERVAL '3 days', 8520.00, 8650.00, 130.00, 8.00, 1040.00, 'WATER-NOV-2024-001', CURRENT_DATE + INTERVAL '20 days', building_id_1, admin_user_id),
        (platform_org_id, 'electricity', 'ELE-002-BLD2', CURRENT_DATE - INTERVAL '6 days', 12340.00, 12480.00, 140.00, 6.50, 910.00, 'ELEC-NOV-2024-002', CURRENT_DATE + INTERVAL '24 days', building_id_2, admin_user_id),
        (platform_org_id, 'gas', 'GAS-001-BLD1', CURRENT_DATE - INTERVAL '7 days', 2450.00, 2520.00, 70.00, 15.00, 1050.00, 'GAS-NOV-2024-001', CURRENT_DATE + INTERVAL '30 days', building_id_1, admin_user_id);
    END IF;

    -- Insert sample access cards
    INSERT INTO public.access_cards (organization_id, card_number, card_type, holder_name, holder_id, access_levels, issue_date, expiry_date, usage_count, created_by) VALUES
    (platform_org_id, 'CARD-001-2024', 'resident', 'David Lee', admin_user_id, '["building_access", "parking_level_1", "gym", "pool"]', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '365 days', 245, admin_user_id),
    (platform_org_id, 'CARD-002-2024', 'staff', 'Maria Rodriguez', admin_user_id, '["all_buildings", "maintenance_room", "staff_parking"]', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '300 days', 180, admin_user_id),
    (platform_org_id, 'CARD-003-2024', 'visitor', 'Guest Access', NULL, '["lobby", "visitor_parking"]', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 5, admin_user_id),
    (platform_org_id, 'CARD-004-2024', 'emergency', 'Fire Department', NULL, '["all_access", "override_permissions"]', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '1000 days', 12, admin_user_id),
    (platform_org_id, 'CARD-005-2024', 'vendor', 'Delivery Service', NULL, '["loading_dock", "service_elevator"]', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '180 days', 67, admin_user_id);

    -- Insert sample security incidents
    INSERT INTO public.security_incidents (organization_id, incident_number, incident_type, severity, title, description, location, incident_date, reported_by, status, created_by) VALUES
    (platform_org_id, 'INC-2024-001', 'suspicious_activity', 'medium', 'Unidentified Person in Parking Area', 'Security guard reported an unidentified person loitering in the parking area for over 30 minutes. Person left when approached.', 'Building A - Parking Level 1', CURRENT_TIMESTAMP - INTERVAL '2 days', admin_user_id, 'resolved', admin_user_id),
    (platform_org_id, 'INC-2024-002', 'theft', 'high', 'Package Theft Reported', 'Resident reported that their package was stolen from the delivery area. CCTV footage is being reviewed.', 'Building B - Ground Floor', CURRENT_TIMESTAMP - INTERVAL '5 days', admin_user_id, 'investigating', admin_user_id),
    (platform_org_id, 'INC-2024-003', 'vandalism', 'low', 'Graffiti on Wall', 'Graffiti found on the wall near the children\'s play area. Cleaning has been arranged.', 'Children\'s Play Area', CURRENT_TIMESTAMP - INTERVAL '7 days', admin_user_id, 'resolved', admin_user_id),
    (platform_org_id, 'INC-2024-004', 'emergency', 'critical', 'Fire Alarm Malfunction', 'Fire alarm system malfunctioned causing false alarm. Technician called for immediate repair.', 'Building A - All Floors', CURRENT_TIMESTAMP - INTERVAL '1 day', admin_user_id, 'open', admin_user_id),
    (platform_org_id, 'INC-2024-005', 'trespassing', 'medium', 'Unauthorized Entry Attempt', 'Someone attempted to enter through the back gate without proper authorization. Security increased.', 'Back Gate Entrance', CURRENT_TIMESTAMP - INTERVAL '3 days', admin_user_id, 'closed', admin_user_id);

    -- Insert sample emergency contacts
    INSERT INTO public.emergency_contacts (organization_id, contact_type, contact_name, phone_primary, phone_secondary, email, address, availability, is_primary, notes) VALUES
    (platform_org_id, 'police', 'Local Police Station', '100', '+91-11-23456789', 'police@localstation.gov.in', 'Sector 14, Gurgaon', '24x7', true, 'Primary emergency contact for all police matters'),
    (platform_org_id, 'fire', 'Fire Brigade', '101', '+91-11-23456790', 'fire@firestation.gov.in', 'Sector 10, Gurgaon', '24x7', true, 'Fire emergency and rescue services'),
    (platform_org_id, 'medical', 'Metro Hospital', '102', '+91-11-23456791', 'emergency@metrohospital.com', 'Sector 12, Gurgaon', '24x7', true, 'Primary hospital for medical emergencies'),
    (platform_org_id, 'security', 'SecureGuard Control Room', '+91-9876543235', '+91-9876543236', 'control@secureguard.com', 'Society Security Office', '24x7', true, 'Society security control room'),
    (platform_org_id, 'maintenance', 'Emergency Maintenance', '+91-9876543237', '+91-9876543238', 'emergency@maintenance.com', 'Society Maintenance Office', '24x7', true, 'Emergency maintenance and repairs'),
    (platform_org_id, 'utility', 'Power Grid Emergency', '1912', '+91-11-23456792', 'emergency@powergrid.in', 'Gurgaon Electricity Board', '24x7', true, 'Electricity supply emergencies'),
    (platform_org_id, 'management', 'Society Management Office', '+91-9876543239', '+91-9876543240', 'management@addasociety.com', 'Society Office, Ground Floor', '9AM-6PM', true, 'Society management and administrative matters');

END $$;