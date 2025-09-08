-- Add platform admin policies for remaining tables

-- Core tables that might not have platform admin policies yet
CREATE POLICY "Platform admins can manage all amenities" 
ON amenities FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all community documents" 
ON community_documents FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all digital id cards" 
ON digital_id_cards FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all household members" 
ON household_members FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all invoices" 
ON invoices FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all journal entries" 
ON journal_entries FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all journal entry lines" 
ON journal_entry_lines FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all locations" 
ON locations FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all maintenance billing" 
ON maintenance_billing FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all maintenance charges" 
ON maintenance_charges FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all message queue" 
ON message_queue FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all move records" 
ON move_records FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all notice read receipts" 
ON notice_read_receipts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all organizations" 
ON organizations FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all parking slots" 
ON parking_slots FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all photo albums" 
ON photo_albums FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all poll options" 
ON poll_options FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all poll votes" 
ON poll_votes FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all pre registrations" 
ON pre_registrations FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all premise types" 
ON premise_types FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all profiles" 
ON profiles FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all project meetings" 
ON project_meetings FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all role change audit" 
ON role_change_audit FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all security incidents" 
ON security_incidents FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all service bookings" 
ON service_bookings FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all service types" 
ON service_types FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all social network posts" 
ON social_network_posts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all society notices" 
ON society_notices FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all society units" 
ON society_units FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all staff members" 
ON staff_members FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all states" 
ON states FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all transaction line items" 
ON transaction_line_items FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all unit assignments" 
ON unit_assignments FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all user activity logs" 
ON user_activity_logs FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all user permissions" 
ON user_permissions FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all utility readings" 
ON utility_readings FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all vehicle blacklist" 
ON vehicle_blacklist FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all vehicle whitelist" 
ON vehicle_whitelist FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all vendor contracts" 
ON vendor_contracts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all visitor invitations" 
ON visitor_invitations FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all visitors" 
ON visitors FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

CREATE POLICY "Platform admins can manage all visits" 
ON visits FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);