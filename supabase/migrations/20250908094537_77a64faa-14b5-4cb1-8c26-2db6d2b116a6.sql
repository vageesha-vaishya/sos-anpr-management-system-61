-- PHASE 1: Foundation Enhancement - Sample Data (Fixed)

-- Insert sample data for demonstration and testing

-- 1. Sample Chart of Accounts (Enhanced)
INSERT INTO chart_of_accounts_enhanced (organization_id, account_code, account_name, account_type, account_category, opening_balance) VALUES
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '1000', 'Cash in Hand', 'asset', 'current_asset', 50000.00),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '1001', 'Bank Account - SBI', 'asset', 'current_asset', 500000.00),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '1002', 'Maintenance Receivables', 'asset', 'current_asset', 125000.00),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '2000', 'Accounts Payable', 'liability', 'current_liability', 45000.00),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '2001', 'Security Deposits', 'liability', 'current_liability', 200000.00),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '3000', 'Society Corpus Fund', 'equity', 'corpus', 300000.00),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '4000', 'Maintenance Income', 'income', 'operating_income', 0),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '4001', 'Parking Income', 'income', 'operating_income', 0),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '5000', 'Electricity Expense', 'expense', 'utility_expense', 0),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '5001', 'Water Expense', 'expense', 'utility_expense', 0),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '5002', 'Security Services', 'expense', 'operational_expense', 0),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), '5003', 'Maintenance & Repairs', 'expense', 'operational_expense', 0);

-- 2. Sample Financial Transactions
INSERT INTO financial_transactions (organization_id, transaction_number, transaction_date, transaction_type, description, total_amount, status, created_by) VALUES
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'TXN-2024-001', '2024-01-01', 'maintenance_fee', 'January 2024 Maintenance Collection', 150000.00, 'posted', (SELECT id FROM profiles WHERE role = 'platform_admin' LIMIT 1)),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'TXN-2024-002', '2024-01-15', 'expense', 'Electricity Bill Payment', 25000.00, 'posted', (SELECT id FROM profiles WHERE role = 'platform_admin' LIMIT 1)),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'TXN-2024-003', '2024-02-01', 'maintenance_fee', 'February 2024 Maintenance Collection', 145000.00, 'posted', (SELECT id FROM profiles WHERE role = 'platform_admin' LIMIT 1));

-- 3. Sample Society Notices
INSERT INTO society_notices (organization_id, title, content, notice_type, priority, status, created_by, published_at) VALUES
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'Annual General Meeting Notice', 'The Annual General Meeting of the society will be held on 15th March 2024 at 6:00 PM in the community hall. All members are requested to attend.', 'meeting', 'high', 'published', (SELECT id FROM profiles WHERE role = 'platform_admin' LIMIT 1), NOW() - INTERVAL '2 days'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'Water Supply Maintenance', 'Water supply will be disrupted on Saturday, 10th March 2024 from 9:00 AM to 1:00 PM for maintenance work. Please store water accordingly.', 'maintenance', 'normal', 'published', (SELECT id FROM profiles WHERE role = 'platform_admin' LIMIT 1), NOW() - INTERVAL '1 day'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'Holi Celebration 2024', 'Join us for Holi celebrations on 25th March 2024 at 10:00 AM in the central garden. Colors and snacks will be provided by the society.', 'general', 'normal', 'published', (SELECT id FROM profiles WHERE role = 'platform_admin' LIMIT 1), NOW() - INTERVAL '3 hours'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'Parking Rules Update', 'New parking rules are effective from 1st April 2024. Please ensure your vehicle has proper society stickers. Unauthorized vehicles will be towed.', 'general', 'high', 'published', (SELECT id FROM profiles WHERE role = 'platform_admin' LIMIT 1), NOW());

-- 4. Sample Communication Channels
INSERT INTO communication_channels (organization_id, channel_type, channel_name, configuration, is_active, is_default) VALUES
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'email', 'Primary Email Service', '{"provider": "smtp", "host": "smtp.gmail.com", "port": 587}', true, true),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'sms', 'SMS Gateway', '{"provider": "twilio", "account_sid": "demo_sid"}', true, false),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'push', 'Push Notifications', '{"provider": "firebase", "server_key": "demo_key"}', true, false);

-- 5. Sample Dashboard Metrics
INSERT INTO dashboard_metrics (organization_id, metric_type, metric_name, metric_value, calculation_date, period_type) VALUES
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'financial', 'total_collection', 295000.00, CURRENT_DATE, 'monthly'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'financial', 'outstanding_dues', 85000.00, CURRENT_DATE, 'monthly'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'financial', 'collection_efficiency', 77.6, CURRENT_DATE, 'monthly'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'maintenance', 'pending_complaints', 12, CURRENT_DATE, 'daily'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'maintenance', 'completed_requests', 45, CURRENT_DATE, 'monthly'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'occupancy', 'total_units', 120, CURRENT_DATE, 'monthly'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'occupancy', 'occupied_units', 98, CURRENT_DATE, 'monthly'),
((SELECT id FROM organizations WHERE organization_type = 'customer' LIMIT 1), 'community', 'active_residents', 156, CURRENT_DATE, 'monthly');