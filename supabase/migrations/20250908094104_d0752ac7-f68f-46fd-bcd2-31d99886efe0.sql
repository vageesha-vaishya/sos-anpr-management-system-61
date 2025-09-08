-- PHASE 1: Foundation Enhancement - Drop all role-dependent policies temporarily

-- Get list of all policies that use get_user_role() and drop them
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    -- Drop all policies that reference get_user_role() function
    FOR pol_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE qual LIKE '%get_user_role()%' OR with_check LIKE '%get_user_role()%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol_record.policyname, 
                      pol_record.schemaname, 
                      pol_record.tablename);
    END LOOP;
    
    -- Also drop policies that directly reference profiles.role
    FOR pol_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE qual LIKE '%profiles.role%' OR with_check LIKE '%profiles.role%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol_record.policyname, 
                      pol_record.schemaname, 
                      pol_record.tablename);
    END LOOP;
END $$;