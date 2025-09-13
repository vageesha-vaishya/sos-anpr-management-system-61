-- Check existing foreign key constraints on helpdesk_tickets
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'helpdesk_tickets';

-- Clean up any orphaned data first (safe to run multiple times)
-- Remove tickets with invalid created_by references
DELETE FROM helpdesk_tickets 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM profiles);

-- Remove tickets with invalid assigned_to references  
DELETE FROM helpdesk_tickets 
WHERE assigned_to IS NOT NULL 
AND assigned_to NOT IN (SELECT id FROM staff_members);

-- Remove tickets with invalid organization_id references
DELETE FROM helpdesk_tickets 
WHERE organization_id IS NOT NULL 
AND organization_id NOT IN (SELECT id FROM organizations);

-- Add foreign key constraints only if they don't exist
DO $$ 
BEGIN
    -- Check and add created_by constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_helpdesk_tickets_created_by' 
        AND table_name = 'helpdesk_tickets'
    ) THEN
        ALTER TABLE helpdesk_tickets 
        ADD CONSTRAINT fk_helpdesk_tickets_created_by 
        FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;

    -- Check and add assigned_to constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_helpdesk_tickets_assigned_to' 
        AND table_name = 'helpdesk_tickets'
    ) THEN
        ALTER TABLE helpdesk_tickets 
        ADD CONSTRAINT fk_helpdesk_tickets_assigned_to 
        FOREIGN KEY (assigned_to) REFERENCES staff_members(id) ON DELETE SET NULL;
    END IF;

    -- Check and add organization_id constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_helpdesk_tickets_organization_id' 
        AND table_name = 'helpdesk_tickets'
    ) THEN
        ALTER TABLE helpdesk_tickets 
        ADD CONSTRAINT fk_helpdesk_tickets_organization_id 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;