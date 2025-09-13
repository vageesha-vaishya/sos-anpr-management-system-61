-- Helpdesk relationships and indexes (idempotent and safe)

-- 1) Add FK: helpdesk_tickets.created_by -> profiles.id (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'helpdesk_tickets'
      AND c.conname = 'helpdesk_tickets_created_by_fkey'
  ) THEN
    ALTER TABLE public.helpdesk_tickets
      ADD CONSTRAINT helpdesk_tickets_created_by_fkey
      FOREIGN KEY (created_by)
      REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- 2) Add FK: helpdesk_tickets.assigned_to -> staff_members.id (if staff_members exists and FK missing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'staff_members'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      WHERE t.relname = 'helpdesk_tickets'
        AND c.conname = 'helpdesk_tickets_assigned_to_fkey'
    ) THEN
      ALTER TABLE public.helpdesk_tickets
        ADD CONSTRAINT helpdesk_tickets_assigned_to_fkey
        FOREIGN KEY (assigned_to)
        REFERENCES public.staff_members(id)
        ON DELETE SET NULL;
    END IF;
  END IF;
END$$;

-- 3) Helpful indexes (safe if already exist)
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_created_by ON public.helpdesk_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_assigned_to ON public.helpdesk_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_helpdesk_tickets_org ON public.helpdesk_tickets(organization_id);
