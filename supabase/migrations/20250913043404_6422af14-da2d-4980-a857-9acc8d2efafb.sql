-- Create ticket action history table
CREATE TABLE public.ticket_action_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE,
  action_by UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'assigned', 'status_changed', 'priority_changed', 'commented', 'resolved', 'reopened', 'escalated')),
  action_description TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  resolution_details TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket comments table
CREATE TABLE public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  author_type TEXT NOT NULL CHECK (author_type IN ('staff', 'customer', 'system')) DEFAULT 'customer',
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket escalations table
CREATE TABLE public.ticket_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE,
  escalated_by UUID NOT NULL REFERENCES public.profiles(id),
  escalated_to UUID NOT NULL REFERENCES public.profiles(id),
  escalation_reason TEXT NOT NULL,
  escalation_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance helpdesk_tickets table
ALTER TABLE public.helpdesk_tickets 
ADD COLUMN escalation_level INTEGER DEFAULT 0,
ADD COLUMN total_time_spent INTEGER DEFAULT 0,
ADD COLUMN customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- Enable RLS on new tables
ALTER TABLE public.ticket_action_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_escalations ENABLE ROW LEVEL SECURITY;

-- RLS policies for ticket_action_history
CREATE POLICY "Platform admins can manage all ticket action history" 
ON public.ticket_action_history FOR ALL 
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Users can view ticket action history in their organization" 
ON public.ticket_action_history FOR SELECT 
USING (
  ticket_id IN (
    SELECT ht.id FROM helpdesk_tickets ht 
    WHERE ht.organization_id = get_user_organization_id()
  )
);

CREATE POLICY "Staff can create ticket action history" 
ON public.ticket_action_history FOR INSERT 
WITH CHECK (
  action_by = auth.uid() AND
  ticket_id IN (
    SELECT ht.id FROM helpdesk_tickets ht 
    WHERE ht.organization_id = get_user_organization_id()
  )
);

-- RLS policies for ticket_comments
CREATE POLICY "Platform admins can manage all ticket comments" 
ON public.ticket_comments FOR ALL 
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Users can view comments for tickets in their organization" 
ON public.ticket_comments FOR SELECT 
USING (
  ticket_id IN (
    SELECT ht.id FROM helpdesk_tickets ht 
    WHERE ht.organization_id = get_user_organization_id()
  )
);

CREATE POLICY "Users can create comments on tickets in their organization" 
ON public.ticket_comments FOR INSERT 
WITH CHECK (
  author_id = auth.uid() AND
  ticket_id IN (
    SELECT ht.id FROM helpdesk_tickets ht 
    WHERE ht.organization_id = get_user_organization_id()
  )
);

-- RLS policies for ticket_escalations
CREATE POLICY "Platform admins can manage all ticket escalations" 
ON public.ticket_escalations FOR ALL 
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Users can view ticket escalations in their organization" 
ON public.ticket_escalations FOR SELECT 
USING (
  ticket_id IN (
    SELECT ht.id FROM helpdesk_tickets ht 
    WHERE ht.organization_id = get_user_organization_id()
  )
);

CREATE POLICY "Staff can escalate tickets" 
ON public.ticket_escalations FOR INSERT 
WITH CHECK (
  escalated_by = auth.uid() AND
  ticket_id IN (
    SELECT ht.id FROM helpdesk_tickets ht 
    WHERE ht.organization_id = get_user_organization_id()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_ticket_action_history_ticket_id ON public.ticket_action_history(ticket_id);
CREATE INDEX idx_ticket_action_history_created_at ON public.ticket_action_history(created_at);
CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_at ON public.ticket_comments(created_at);
CREATE INDEX idx_ticket_escalations_ticket_id ON public.ticket_escalations(ticket_id);
CREATE INDEX idx_helpdesk_tickets_due_date ON public.helpdesk_tickets(due_date);

-- Create function to automatically log ticket changes
CREATE OR REPLACE FUNCTION public.log_ticket_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ticket_action_history (
      ticket_id, action_by, action_type, action_description, 
      previous_value, new_value
    ) VALUES (
      NEW.id, auth.uid(), 'status_changed', 
      'Status changed from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  
  -- Log priority changes
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO public.ticket_action_history (
      ticket_id, action_by, action_type, action_description,
      previous_value, new_value
    ) VALUES (
      NEW.id, auth.uid(), 'priority_changed',
      'Priority changed from ' || COALESCE(OLD.priority, 'none') || ' to ' || NEW.priority,
      jsonb_build_object('priority', OLD.priority),
      jsonb_build_object('priority', NEW.priority)
    );
  END IF;
  
  -- Log assignment changes
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.ticket_action_history (
      ticket_id, action_by, action_type, action_description,
      previous_value, new_value
    ) VALUES (
      NEW.id, auth.uid(), 'assigned',
      'Ticket assigned',
      jsonb_build_object('assigned_to', OLD.assigned_to),
      jsonb_build_object('assigned_to', NEW.assigned_to)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic logging
CREATE TRIGGER trigger_log_ticket_actions
  AFTER UPDATE ON public.helpdesk_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ticket_action();