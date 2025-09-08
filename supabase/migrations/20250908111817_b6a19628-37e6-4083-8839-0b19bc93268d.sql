-- Grant platform_admin users full CRUD access to ALL database tables
-- This ensures platform admins never face RLS restrictions

-- Platform admins can manage all access cards
CREATE POLICY "Platform admins can manage all access cards" 
ON access_cards FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all advertisement campaigns
CREATE POLICY "Platform admins can manage all advertisement campaigns" 
ON advertisement_campaigns FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all alerts
CREATE POLICY "Platform admins can manage all alerts" 
ON alerts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all AMC contracts
CREATE POLICY "Platform admins can manage all amc contracts" 
ON amc_contracts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all announcements
CREATE POLICY "Platform admins can manage all announcements" 
ON announcements FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all ANPR detections
CREATE POLICY "Platform admins can manage all anpr detections" 
ON anpr_detections FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all badge templates
CREATE POLICY "Platform admins can manage all badge templates" 
ON badge_templates FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all bank accounts
CREATE POLICY "Platform admins can manage all bank accounts" 
ON bank_accounts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all billing customers
CREATE POLICY "Platform admins can manage all billing customers" 
ON billing_customers FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all buildings
CREATE POLICY "Platform admins can manage all buildings" 
ON buildings FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all camera subscriptions
CREATE POLICY "Platform admins can manage all camera subscriptions" 
ON camera_subscriptions FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all cameras
CREATE POLICY "Platform admins can manage all cameras" 
ON cameras FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all chart of accounts
CREATE POLICY "Platform admins can manage all chart of accounts" 
ON chart_of_accounts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all enhanced chart of accounts
CREATE POLICY "Platform admins can manage all chart of accounts enhanced" 
ON chart_of_accounts_enhanced FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all cities
CREATE POLICY "Platform admins can manage all cities" 
ON cities FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all communication channels
CREATE POLICY "Platform admins can manage all communication channels" 
ON communication_channels FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all community assets
CREATE POLICY "Platform admins can manage all community assets" 
ON community_assets FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all community events
CREATE POLICY "Platform admins can manage all community events" 
ON community_events FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all community polls
CREATE POLICY "Platform admins can manage all community polls" 
ON community_polls FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all continents
CREATE POLICY "Platform admins can manage all continents" 
ON continents FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all countries
CREATE POLICY "Platform admins can manage all countries" 
ON countries FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all dashboard metrics
CREATE POLICY "Platform admins can manage all dashboard metrics" 
ON dashboard_metrics FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all departments
CREATE POLICY "Platform admins can manage all departments" 
ON departments FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all emergency contacts
CREATE POLICY "Platform admins can manage all emergency contacts" 
ON emergency_contacts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all entry gates
CREATE POLICY "Platform admins can manage all entry gates" 
ON entry_gates FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all event registrations
CREATE POLICY "Platform admins can manage all event registrations" 
ON event_registrations FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all financial transactions
CREATE POLICY "Platform admins can manage all financial transactions" 
ON financial_transactions FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all forum discussions
CREATE POLICY "Platform admins can manage all forum discussions" 
ON forum_discussions FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all helpdesk tickets
CREATE POLICY "Platform admins can manage all helpdesk tickets" 
ON helpdesk_tickets FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Platform admins can manage all hosts
CREATE POLICY "Platform admins can manage all hosts" 
ON hosts FOR ALL
USING (get_user_role() = 'platform_admin'::user_role);

-- Continue with remaining tables in next part...