-- Fix security issues for billing functions by setting proper search_path

-- Update generate_invoice_number function with security definer and search_path
CREATE OR REPLACE FUNCTION generate_invoice_number() 
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invoice_num TEXT;
    year_str TEXT;
    next_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 'INV-' || year_str || '-(.*)') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM invoices 
    WHERE invoice_number LIKE 'INV-' || year_str || '-%';
    
    invoice_num := 'INV-' || year_str || '-' || LPAD(next_num::TEXT, 6, '0');
    
    RETURN invoice_num;
END;
$$;

-- Update generate_payment_number function with security definer and search_path
CREATE OR REPLACE FUNCTION generate_payment_number() 
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    payment_num TEXT;
    year_str TEXT;
    next_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(payment_number FROM 'PAY-' || year_str || '-(.*)') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM payments 
    WHERE payment_number LIKE 'PAY-' || year_str || '-%';
    
    payment_num := 'PAY-' || year_str || '-' || LPAD(next_num::TEXT, 6, '0');
    
    RETURN payment_num;
END;
$$;

-- Update set_invoice_number function with security definer and search_path
CREATE OR REPLACE FUNCTION set_invoice_number() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$;

-- Update set_payment_number function with security definer and search_path
CREATE OR REPLACE FUNCTION set_payment_number() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := generate_payment_number();
    END IF;
    RETURN NEW;
END;
$$;