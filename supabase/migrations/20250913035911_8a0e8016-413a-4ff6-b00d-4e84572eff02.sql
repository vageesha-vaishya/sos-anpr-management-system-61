-- Clean up any orphaned data first
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

-- Add foreign key constraints
ALTER TABLE helpdesk_tickets 
ADD CONSTRAINT fk_helpdesk_tickets_created_by 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE helpdesk_tickets 
ADD CONSTRAINT fk_helpdesk_tickets_assigned_to 
FOREIGN KEY (assigned_to) REFERENCES staff_members(id) ON DELETE SET NULL;

ALTER TABLE helpdesk_tickets 
ADD CONSTRAINT fk_helpdesk_tickets_organization_id 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;