-- Add foreign key constraint between visits and visitors
ALTER TABLE public.visits 
ADD CONSTRAINT fk_visits_visitor_id 
FOREIGN KEY (visitor_id) REFERENCES public.visitors(id) ON DELETE CASCADE;

-- Add foreign key constraint between visits and hosts  
ALTER TABLE public.visits 
ADD CONSTRAINT fk_visits_host_id 
FOREIGN KEY (host_id) REFERENCES public.hosts(id) ON DELETE SET NULL;

-- Add foreign key constraint between pre_registrations and visitors
ALTER TABLE public.pre_registrations 
ADD CONSTRAINT fk_pre_registrations_visitor_id 
FOREIGN KEY (visitor_id) REFERENCES public.visitors(id) ON DELETE SET NULL;

-- Add foreign key constraint between pre_registrations and hosts
ALTER TABLE public.pre_registrations 
ADD CONSTRAINT fk_pre_registrations_host_id 
FOREIGN KEY (host_id) REFERENCES public.hosts(id) ON DELETE CASCADE;

-- Add foreign key constraint between pre_registrations and locations
ALTER TABLE public.pre_registrations 
ADD CONSTRAINT fk_pre_registrations_location_id 
FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;

-- Add foreign key constraint between badge_prints and visits
ALTER TABLE public.badge_prints 
ADD CONSTRAINT fk_badge_prints_visit_id 
FOREIGN KEY (visit_id) REFERENCES public.visits(id) ON DELETE CASCADE;

-- Add foreign key constraint between badge_prints and badge_templates
ALTER TABLE public.badge_prints 
ADD CONSTRAINT fk_badge_prints_template_id 
FOREIGN KEY (template_id) REFERENCES public.badge_templates(id) ON DELETE CASCADE;