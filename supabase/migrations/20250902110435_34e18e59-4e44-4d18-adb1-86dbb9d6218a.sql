-- Create visits table for tracking individual visit sessions
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  visitor_id UUID REFERENCES visitors(id),
  host_id UUID REFERENCES hosts(id),
  location_id UUID REFERENCES locations(id),
  purpose TEXT NOT NULL,
  status VARCHAR DEFAULT 'registered',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  expected_checkout_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to visitors table
ALTER TABLE visitors 
ADD COLUMN IF NOT EXISTS first_name VARCHAR,
ADD COLUMN IF NOT EXISTS last_name VARCHAR,
ADD COLUMN IF NOT EXISTS email VARCHAR,
ADD COLUMN IF NOT EXISTS phone VARCHAR,
ADD COLUMN IF NOT EXISTS security_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_visit_date DATE;

-- Update visitors table structure to match expected interface
UPDATE visitors SET 
  first_name = SPLIT_PART(visitor_name, ' ', 1),
  last_name = CASE 
    WHEN array_length(string_to_array(visitor_name, ' '), 1) > 1 
    THEN SPLIT_PART(visitor_name, ' ', 2)
    ELSE ''
  END,
  email = visitor_email,
  phone = visitor_phone
WHERE first_name IS NULL;

-- Enable RLS on visits table
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for visits table
CREATE POLICY "Admins can manage visits in their organization" 
  ON public.visits 
  FOR ALL 
  USING (
    organization_id = get_user_organization_id() AND 
    get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role, 'operator'::user_role])
  );

CREATE POLICY "Users can view visits in their organization" 
  ON public.visits 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

-- Create trigger for updated_at column
CREATE TRIGGER update_visits_updated_at 
  BEFORE UPDATE ON visits 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visits_organization_id ON visits(organization_id);
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);