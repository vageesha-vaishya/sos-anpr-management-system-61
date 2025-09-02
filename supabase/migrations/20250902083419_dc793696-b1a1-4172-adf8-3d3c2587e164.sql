-- Create missing enums first
CREATE TYPE public.severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Then create a simple sample data migration for currencies
INSERT INTO public.currencies (name, code, symbol, is_base_currency, is_active) VALUES
('US Dollar', 'USD', '$', true, true),
('Euro', 'EUR', '€', false, true),
('Indian Rupee', 'INR', '₹', false, true),
('British Pound', 'GBP', '£', false, true),
('Canadian Dollar', 'CAD', 'C$', false, true)
ON CONFLICT (code) DO NOTHING;