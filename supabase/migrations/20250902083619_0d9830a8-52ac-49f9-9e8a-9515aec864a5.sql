-- Create missing enum types first
CREATE TYPE public.severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Insert sample currencies data
INSERT INTO public.currencies (name, code, symbol, exchange_rate, is_base_currency, is_active) VALUES
('US Dollar', 'USD', '$', 1.0000, true, true),
('Euro', 'EUR', '€', 0.8500, false, true),
('British Pound', 'GBP', '£', 0.7500, false, true),
('Indian Rupee', 'INR', '₹', 82.5000, false, true),
('Canadian Dollar', 'CAD', 'C$', 1.3500, false, true),
('Australian Dollar', 'AUD', 'A$', 1.4500, false, true),
('Japanese Yen', 'JPY', '¥', 149.0000, false, true),
('Singapore Dollar', 'SGD', 'S$', 1.3200, false, true),
('UAE Dirham', 'AED', 'د.إ', 3.6700, false, true),
('South African Rand', 'ZAR', 'R', 18.8000, false, true)
ON CONFLICT (code) DO NOTHING;