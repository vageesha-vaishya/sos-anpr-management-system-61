-- Phase 1: Clean up duplicate foreign key constraints
-- Drop manually named foreign key constraints to keep only the auto-generated ones

-- Drop duplicate foreign keys for cities table
ALTER TABLE cities DROP CONSTRAINT IF EXISTS fk_cities_state;

-- Drop duplicate foreign keys for states table  
ALTER TABLE states DROP CONSTRAINT IF EXISTS fk_states_country;

-- Drop duplicate foreign keys for countries table
ALTER TABLE countries DROP CONSTRAINT IF EXISTS fk_countries_continent;

-- Drop duplicate foreign keys for pre_registrations table
ALTER TABLE pre_registrations DROP CONSTRAINT IF EXISTS pre_registrations_approved_by_fkey;

-- Phase 2: Fix data type issues in states table
-- First, remove the incorrectly typed created_by column
ALTER TABLE states DROP COLUMN IF EXISTS created_by;

-- Add back created_by with correct uuid type and foreign key reference
ALTER TABLE states ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Phase 3: Standardize schema - Add missing created_by fields to other geographical tables
-- Add created_by to continents table
ALTER TABLE continents ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Add created_by to countries table  
ALTER TABLE countries ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Add created_by to cities table
ALTER TABLE cities ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Phase 4: Ensure proper foreign key relationships exist (recreate if needed)
-- Add foreign key for cities -> states if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cities_state_id_fkey' 
        AND table_name = 'cities'
    ) THEN
        ALTER TABLE cities ADD CONSTRAINT cities_state_id_fkey 
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- Add foreign key for states -> countries if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'states_country_id_fkey' 
        AND table_name = 'states'
    ) THEN
        ALTER TABLE states ADD CONSTRAINT states_country_id_fkey 
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- Add foreign key for countries -> continents if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'countries_continent_id_fkey' 
        AND table_name = 'countries'
    ) THEN
        ALTER TABLE countries ADD CONSTRAINT countries_continent_id_fkey 
        FOREIGN KEY (continent_id) REFERENCES continents(id) ON DELETE RESTRICT;
    END IF;
END $$;