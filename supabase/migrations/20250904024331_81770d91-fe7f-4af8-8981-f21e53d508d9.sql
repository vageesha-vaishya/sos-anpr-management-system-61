-- Create announcements table for announcement management
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category VARCHAR NOT NULL,
  target_audience VARCHAR DEFAULT 'all' CHECK (target_audience IN ('all', 'residents', 'staff', 'owners', 'tenants')),
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create service bookings table for home services
CREATE TABLE public.service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  service_provider_id UUID,
  customer_id UUID,
  unit_id UUID,
  service_type VARCHAR NOT NULL,
  service_description TEXT,
  booking_date DATE NOT NULL,
  time_slot VARCHAR,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  amount NUMERIC(10,2),
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create visitor invitations table for guest codes
CREATE TABLE public.visitor_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  host_id UUID NOT NULL,
  visitor_name VARCHAR NOT NULL,
  visitor_phone VARCHAR,
  visitor_email VARCHAR,
  guest_code VARCHAR UNIQUE NOT NULL,
  qr_code_data TEXT,
  visit_date DATE NOT NULL,
  visit_time_from TIME,
  visit_time_to TIME,
  purpose TEXT,
  vehicle_number VARCHAR,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  is_recurring BOOLEAN DEFAULT false,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create digital ID cards table
CREATE TABLE public.digital_id_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  card_number VARCHAR UNIQUE NOT NULL,
  qr_code_data TEXT NOT NULL,
  card_type VARCHAR DEFAULT 'resident' CHECK (card_type IN ('resident', 'staff', 'visitor', 'emergency')),
  is_active BOOLEAN DEFAULT true,
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  access_permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create social network posts table
CREATE TABLE public.social_network_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title VARCHAR,
  content TEXT NOT NULL,
  post_type VARCHAR DEFAULT 'general' CHECK (post_type IN ('general', 'announcement', 'event', 'marketplace', 'help', 'complaint')),
  visibility VARCHAR DEFAULT 'all' CHECK (visibility IN ('all', 'residents', 'owners', 'building')),
  attachments JSONB DEFAULT '[]',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create photo albums table for events
CREATE TABLE public.photo_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  event_id UUID,
  album_name VARCHAR NOT NULL,
  description TEXT,
  cover_photo_url TEXT,
  photos JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create move records table for move in/out tracking
CREATE TABLE public.move_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  unit_id UUID NOT NULL,
  move_type VARCHAR NOT NULL CHECK (move_type IN ('move_in', 'move_out')),
  resident_name VARCHAR NOT NULL,
  resident_phone VARCHAR,
  resident_email VARCHAR,
  move_date DATE NOT NULL,
  checklist_completed BOOLEAN DEFAULT false,
  checklist_items JSONB DEFAULT '[]',
  security_deposit NUMERIC(10,2),
  deposit_status VARCHAR DEFAULT 'pending' CHECK (deposit_status IN ('pending', 'collected', 'refunded')),
  key_handover BOOLEAN DEFAULT false,
  documentation JSONB DEFAULT '[]',
  notes TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_id_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_network_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for announcements
CREATE POLICY "Users can view announcements in their organization" 
ON public.announcements FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage announcements in their organization" 
ON public.announcements FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for service bookings
CREATE POLICY "Users can view service bookings in their organization" 
ON public.service_bookings FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create their own service bookings" 
ON public.service_bookings FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND customer_id = auth.uid());

CREATE POLICY "Admins can manage service bookings in their organization" 
ON public.service_bookings FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for visitor invitations
CREATE POLICY "Users can view visitor invitations in their organization" 
ON public.visitor_invitations FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create their own visitor invitations" 
ON public.visitor_invitations FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND host_id = auth.uid());

CREATE POLICY "Admins can manage visitor invitations in their organization" 
ON public.visitor_invitations FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for digital ID cards
CREATE POLICY "Users can view their own digital ID cards" 
ON public.digital_id_cards FOR SELECT 
USING (organization_id = get_user_organization_id() AND (user_id = auth.uid() OR get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role])));

CREATE POLICY "Admins can manage digital ID cards in their organization" 
ON public.digital_id_cards FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for social network posts
CREATE POLICY "Users can view social network posts in their organization" 
ON public.social_network_posts FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create their own social network posts" 
ON public.social_network_posts FOR INSERT 
WITH CHECK (organization_id = get_user_organization_id() AND author_id = auth.uid());

CREATE POLICY "Users can update their own social network posts" 
ON public.social_network_posts FOR UPDATE 
USING (organization_id = get_user_organization_id() AND author_id = auth.uid());

-- Create RLS policies for photo albums
CREATE POLICY "Users can view photo albums in their organization" 
ON public.photo_albums FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage photo albums in their organization" 
ON public.photo_albums FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create RLS policies for move records
CREATE POLICY "Users can view move records in their organization" 
ON public.move_records FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage move records in their organization" 
ON public.move_records FOR ALL 
USING (organization_id = get_user_organization_id() AND get_user_role() = ANY(ARRAY['platform_admin'::user_role, 'franchise_admin'::user_role, 'customer_admin'::user_role]));

-- Create triggers for updated_at columns
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON public.service_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visitor_invitations_updated_at BEFORE UPDATE ON public.visitor_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_digital_id_cards_updated_at BEFORE UPDATE ON public.digital_id_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_social_network_posts_updated_at BEFORE UPDATE ON public.social_network_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_photo_albums_updated_at BEFORE UPDATE ON public.photo_albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_move_records_updated_at BEFORE UPDATE ON public.move_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();