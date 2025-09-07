-- Create journal entries table for double-entry bookkeeping
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  entry_number VARCHAR NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  reference VARCHAR,
  total_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'reversed')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal entry line items for double-entry details
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  description TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create income sources table
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  source_name VARCHAR NOT NULL,
  source_type VARCHAR NOT NULL CHECK (source_type IN ('maintenance_fees', 'late_fees', 'amenity_charges', 'parking_fees', 'other')),
  default_amount DECIMAL(15,2),
  billing_frequency VARCHAR DEFAULT 'monthly' CHECK (billing_frequency IN ('monthly', 'quarterly', 'yearly', 'one_time')),
  account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create income records table
CREATE TABLE IF NOT EXISTS income_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  income_source_id UUID NOT NULL REFERENCES income_sources(id),
  amount DECIMAL(15,2) NOT NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR DEFAULT 'cash' CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'online', 'card')),
  reference_number VARCHAR,
  description TEXT,
  customer_name VARCHAR,
  customer_unit VARCHAR,
  journal_entry_id UUID REFERENCES journal_entries(id),
  status VARCHAR DEFAULT 'received' CHECK (status IN ('pending', 'received', 'overdue')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  category_name VARCHAR NOT NULL,
  category_type VARCHAR NOT NULL CHECK (category_type IN ('utilities', 'maintenance', 'security', 'cleaning', 'landscaping', 'insurance', 'professional_fees', 'office_expenses', 'other')),
  budget_amount DECIMAL(15,2),
  account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  expense_category_id UUID NOT NULL REFERENCES expense_categories(id),
  vendor_name VARCHAR NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR DEFAULT 'cash' CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'online', 'card')),
  invoice_number VARCHAR,
  description TEXT NOT NULL,
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  due_date DATE,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bank transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_number VARCHAR,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2),
  transaction_type VARCHAR CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'fee', 'interest')),
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_date DATE,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment vouchers table
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  voucher_number VARCHAR NOT NULL,
  payee_name VARCHAR NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR DEFAULT 'cheque' CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'online')),
  bank_account_id UUID REFERENCES bank_accounts(id),
  description TEXT NOT NULL,
  expense_id UUID REFERENCES expenses(id),
  approval_status VARCHAR DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_by UUID,
  approved_date DATE,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create utility bills table
CREATE TABLE IF NOT EXISTS utility_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  utility_type VARCHAR NOT NULL CHECK (utility_type IN ('electricity', 'water', 'gas', 'internet', 'cable', 'maintenance')),
  bill_month DATE NOT NULL,
  provider_name VARCHAR NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  total_consumption DECIMAL(10,2),
  unit_rate DECIMAL(10,4),
  fixed_charges DECIMAL(15,2) DEFAULT 0,
  due_date DATE NOT NULL,
  bill_status VARCHAR DEFAULT 'pending' CHECK (bill_status IN ('pending', 'paid', 'overdue')),
  payment_date DATE,
  meter_reading_previous DECIMAL(10,2),
  meter_reading_current DECIMAL(10,2),
  expense_id UUID REFERENCES expenses(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create utility allocations table for unit-wise distribution
CREATE TABLE IF NOT EXISTS utility_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  utility_bill_id UUID NOT NULL REFERENCES utility_bills(id) ON DELETE CASCADE,
  unit_number VARCHAR NOT NULL,
  allocated_consumption DECIMAL(10,2),
  allocated_amount DECIMAL(15,2) NOT NULL,
  allocation_method VARCHAR DEFAULT 'equal' CHECK (allocation_method IN ('equal', 'area_based', 'consumption_based', 'fixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cash flows table for projections
CREATE TABLE IF NOT EXISTS cash_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  flow_date DATE NOT NULL,
  flow_type VARCHAR NOT NULL CHECK (flow_type IN ('inflow', 'outflow')),
  category VARCHAR NOT NULL,
  description TEXT NOT NULL,
  projected_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2),
  variance DECIMAL(15,2),
  status VARCHAR DEFAULT 'projected' CHECK (status IN ('projected', 'actual', 'revised')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organization-based access
CREATE POLICY "Admins can manage journal entries in their organization" ON journal_entries
  FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view journal entries in their organization" ON journal_entries
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage journal entry lines" ON journal_entry_lines
  FOR ALL USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE organization_id = get_user_organization_id()) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view journal entry lines" ON journal_entry_lines
  FOR SELECT USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Admins can manage income sources in their organization" ON income_sources
  FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view income sources in their organization" ON income_sources
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage income records in their organization" ON income_records
  FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view income records in their organization" ON income_records
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage expense categories in their organization" ON expense_categories
  FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view expense categories in their organization" ON expense_categories
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage expenses in their organization" ON expenses
  FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view expenses in their organization" ON expenses
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage bank transactions" ON bank_transactions
  FOR ALL USING (bank_account_id IN (SELECT id FROM bank_accounts WHERE organization_id = get_user_organization_id()) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view bank transactions" ON bank_transactions
  FOR SELECT USING (bank_account_id IN (SELECT id FROM bank_accounts WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Admins can manage payment vouchers in their organization" ON payment_vouchers
  FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view payment vouchers in their organization" ON payment_vouchers
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage utility bills in their organization" ON utility_bills
  FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view utility bills in their organization" ON utility_bills
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage utility allocations" ON utility_allocations
  FOR ALL USING (utility_bill_id IN (SELECT id FROM utility_bills WHERE organization_id = get_user_organization_id()) AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view utility allocations" ON utility_allocations
  FOR SELECT USING (utility_bill_id IN (SELECT id FROM utility_bills WHERE organization_id = get_user_organization_id()));

CREATE POLICY "Admins can manage cash flows in their organization" ON cash_flows
  FOR ALL USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

CREATE POLICY "Users can view cash flows in their organization" ON cash_flows
  FOR SELECT USING (organization_id = get_user_organization_id());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_org_date ON journal_entries(organization_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_income_records_org_date ON income_records(organization_id, received_date);
CREATE INDEX IF NOT EXISTS idx_expenses_org_date ON expenses(organization_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_date ON bank_transactions(bank_account_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_utility_bills_org_month ON utility_bills(organization_id, bill_month);
CREATE INDEX IF NOT EXISTS idx_cash_flows_org_date ON cash_flows(organization_id, flow_date);

-- Insert sample chart of accounts data
INSERT INTO chart_of_accounts (organization_id, account_code, account_name, account_type, account_category, description) VALUES
('00000000-0000-0000-0000-000000000003', '1000', 'Cash and Cash Equivalents', 'Asset', 'Current Assets', 'Petty cash and bank balances'),
('00000000-0000-0000-0000-000000000003', '1100', 'Bank Account - Primary', 'Asset', 'Current Assets', 'Main operating bank account'),
('00000000-0000-0000-0000-000000000003', '1200', 'Accounts Receivable', 'Asset', 'Current Assets', 'Outstanding maintenance fees'),
('00000000-0000-0000-0000-000000000003', '1300', 'Prepaid Expenses', 'Asset', 'Current Assets', 'Insurance and advance payments'),
('00000000-0000-0000-0000-000000000003', '1500', 'Fixed Assets', 'Asset', 'Fixed Assets', 'Community property and equipment'),
('00000000-0000-0000-0000-000000000003', '2000', 'Accounts Payable', 'Liability', 'Current Liabilities', 'Outstanding vendor payments'),
('00000000-0000-0000-0000-000000000003', '2100', 'Accrued Expenses', 'Liability', 'Current Liabilities', 'Utilities and accrued costs'),
('00000000-0000-0000-0000-000000000003', '2200', 'Security Deposits', 'Liability', 'Current Liabilities', 'Resident security deposits'),
('00000000-0000-0000-0000-000000000003', '3000', 'Community Fund', 'Equity', 'Equity', 'Accumulated community funds'),
('00000000-0000-0000-0000-000000000003', '3100', 'Reserve Fund', 'Equity', 'Equity', 'Emergency and maintenance reserves'),
('00000000-0000-0000-0000-000000000003', '4000', 'Maintenance Fee Income', 'Income', 'Operating Income', 'Monthly maintenance charges'),
('00000000-0000-0000-0000-000000000003', '4100', 'Late Fee Income', 'Income', 'Operating Income', 'Late payment penalties'),
('00000000-0000-0000-0000-000000000003', '4200', 'Amenity Income', 'Income', 'Operating Income', 'Community hall and facility bookings'),
('00000000-0000-0000-0000-000000000003', '4300', 'Parking Fee Income', 'Income', 'Operating Income', 'Visitor and additional parking'),
('00000000-0000-0000-0000-000000000003', '5000', 'Utility Expenses', 'Expense', 'Operating Expenses', 'Electricity, water, gas bills'),
('00000000-0000-0000-0000-000000000003', '5100', 'Security Expenses', 'Expense', 'Operating Expenses', 'Security guard and system costs'),
('00000000-0000-0000-0000-000000000003', '5200', 'Maintenance Expenses', 'Expense', 'Operating Expenses', 'Repairs and upkeep'),
('00000000-0000-0000-0000-000000000003', '5300', 'Cleaning Expenses', 'Expense', 'Operating Expenses', 'Housekeeping and sanitation'),
('00000000-0000-0000-0000-000000000003', '5400', 'Insurance Expenses', 'Expense', 'Operating Expenses', 'Property and liability insurance'),
('00000000-0000-0000-0000-000000000003', '5500', 'Professional Fees', 'Expense', 'Operating Expenses', 'Legal and accounting fees')
ON CONFLICT DO NOTHING;

-- Insert sample bank accounts
INSERT INTO bank_accounts (organization_id, account_name, account_number, bank_name, branch_name, ifsc_code, account_type, opening_balance, current_balance) VALUES
('00000000-0000-0000-0000-000000000003', 'Primary Operating Account', '123456789012', 'HDFC Bank', 'Bandra West', 'HDFC0001234', 'current', 500000.00, 750000.00),
('00000000-0000-0000-0000-000000000003', 'Reserve Fund Account', '987654321098', 'ICICI Bank', 'Linking Road', 'ICIC0009876', 'savings', 1000000.00, 1200000.00)
ON CONFLICT DO NOTHING;

-- Insert sample income sources
INSERT INTO income_sources (organization_id, source_name, source_type, default_amount, billing_frequency, account_id) VALUES
('00000000-0000-0000-0000-000000000003', 'Monthly Maintenance Fee', 'maintenance_fees', 3500.00, 'monthly', (SELECT id FROM chart_of_accounts WHERE account_code = '4000' AND organization_id = '00000000-0000-0000-0000-000000000003')),
('00000000-0000-0000-0000-000000000003', 'Late Payment Penalty', 'late_fees', 200.00, 'monthly', (SELECT id FROM chart_of_accounts WHERE account_code = '4100' AND organization_id = '00000000-0000-0000-0000-000000000003')),
('00000000-0000-0000-0000-000000000003', 'Community Hall Booking', 'amenity_charges', 2000.00, 'one_time', (SELECT id FROM chart_of_accounts WHERE account_code = '4200' AND organization_id = '00000000-0000-0000-0000-000000000003')),
('00000000-0000-0000-0000-000000000003', 'Visitor Parking', 'parking_fees', 50.00, 'one_time', (SELECT id FROM chart_of_accounts WHERE account_code = '4300' AND organization_id = '00000000-0000-0000-0000-000000000003'))
ON CONFLICT DO NOTHING;

-- Insert sample expense categories
INSERT INTO expense_categories (organization_id, category_name, category_type, budget_amount, account_id) VALUES
('00000000-0000-0000-0000-000000000003', 'Electricity Bills', 'utilities', 25000.00, (SELECT id FROM chart_of_accounts WHERE account_code = '5000' AND organization_id = '00000000-0000-0000-0000-000000000003')),
('00000000-0000-0000-0000-000000000003', 'Water Bills', 'utilities', 8000.00, (SELECT id FROM chart_of_accounts WHERE account_code = '5000' AND organization_id = '00000000-0000-0000-0000-000000000003')),
('00000000-0000-0000-0000-000000000003', 'Security Services', 'security', 30000.00, (SELECT id FROM chart_of_accounts WHERE account_code = '5100' AND organization_id = '00000000-0000-0000-0000-000000000003')),
('00000000-0000-0000-0000-000000000003', 'Building Maintenance', 'maintenance', 15000.00, (SELECT id FROM chart_of_accounts WHERE account_code = '5200' AND organization_id = '00000000-0000-0000-0000-000000000003')),
('00000000-0000-0000-0000-000000000003', 'Cleaning Services', 'cleaning', 12000.00, (SELECT id FROM chart_of_accounts WHERE account_code = '5300' AND organization_id = '00000000-0000-0000-0000-000000000003'))
ON CONFLICT DO NOTHING;

-- Insert sample income records
INSERT INTO income_records (organization_id, income_source_id, amount, received_date, payment_method, reference_number, description, customer_name, customer_unit, status) VALUES
('00000000-0000-0000-0000-000000000003', (SELECT id FROM income_sources WHERE source_name = 'Monthly Maintenance Fee' AND organization_id = '00000000-0000-0000-0000-000000000003'), 3500.00, '2024-01-05', 'bank_transfer', 'TXN001', 'January 2024 maintenance fee', 'John Doe', 'A-101', 'received'),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM income_sources WHERE source_name = 'Monthly Maintenance Fee' AND organization_id = '00000000-0000-0000-0000-000000000003'), 3500.00, '2024-01-10', 'online', 'TXN002', 'January 2024 maintenance fee', 'Jane Smith', 'B-205', 'received'),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM income_sources WHERE source_name = 'Community Hall Booking' AND organization_id = '00000000-0000-0000-0000-000000000003'), 2000.00, '2024-01-15', 'cash', 'CASH001', 'Birthday party booking', 'Robert Wilson', 'C-303', 'received'),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM income_sources WHERE source_name = 'Late Payment Penalty' AND organization_id = '00000000-0000-0000-0000-000000000003'), 200.00, '2024-01-20', 'cheque', 'CHQ001', 'Late fee for December 2023', 'Mike Johnson', 'A-205', 'received')
ON CONFLICT DO NOTHING;

-- Insert sample expenses
INSERT INTO expenses (organization_id, expense_category_id, vendor_name, amount, expense_date, payment_method, invoice_number, description, payment_status, due_date) VALUES
('00000000-0000-0000-0000-000000000003', (SELECT id FROM expense_categories WHERE category_name = 'Electricity Bills' AND organization_id = '00000000-0000-0000-0000-000000000003'), 'MSEB Ltd', 23500.00, '2024-01-05', 'bank_transfer', 'MSEB001', 'December 2023 electricity bill', 'paid', '2024-01-15'),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM expense_categories WHERE category_name = 'Security Services' AND organization_id = '00000000-0000-0000-0000-000000000003'), 'SecureGuard Services', 28000.00, '2024-01-01', 'cheque', 'SG001', 'January 2024 security services', 'paid', '2024-01-10'),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM expense_categories WHERE category_name = 'Water Bills' AND organization_id = '00000000-0000-0000-0000-000000000003'), 'BMC Water Dept', 7500.00, '2024-01-08', 'online', 'BMC001', 'December 2023 water charges', 'paid', '2024-01-20'),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM expense_categories WHERE category_name = 'Building Maintenance' AND organization_id = '00000000-0000-0000-0000-000000000003'), 'Fix-It Services', 12000.00, '2024-01-12', 'pending', 'FIX001', 'Elevator maintenance and repairs', 'pending', '2024-01-25')
ON CONFLICT DO NOTHING;

-- Insert sample utility bills
INSERT INTO utility_bills (organization_id, utility_type, bill_month, provider_name, total_amount, total_consumption, unit_rate, fixed_charges, due_date, bill_status, meter_reading_previous, meter_reading_current) VALUES
('00000000-0000-0000-0000-000000000003', 'electricity', '2024-01-01', 'MSEB Ltd', 23500.00, 4200.50, 5.60, 800.00, '2024-01-15', 'paid', 15240.30, 19440.80),
('00000000-0000-0000-0000-000000000003', 'water', '2024-01-01', 'BMC Water Dept', 7500.00, 850.00, 8.50, 350.00, '2024-01-20', 'paid', 2150.20, 3000.20),
('00000000-0000-0000-0000-000000000003', 'gas', '2024-01-01', 'Mahanagar Gas', 3200.00, 125.00, 24.00, 200.00, '2024-01-18', 'pending', 890.50, 1015.50)
ON CONFLICT DO NOTHING;