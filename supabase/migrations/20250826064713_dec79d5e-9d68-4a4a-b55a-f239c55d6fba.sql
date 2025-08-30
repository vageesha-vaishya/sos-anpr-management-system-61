-- Revert table names back to original names to fix the application
-- This will restore functionality immediately

-- Revert ANPR Module Tables
ALTER TABLE anpr_detections_log RENAME TO anpr_detections;
ALTER TABLE anpr_usage_tracking RENAME TO anpr_usage_logs;

-- Revert VMS Module Tables  
ALTER TABLE vms_visitors RENAME TO visitors;
ALTER TABLE vms_access_control RENAME TO visitor_access_control;
ALTER TABLE vms_audit_logs RENAME TO visitor_audit_logs;
ALTER TABLE vms_pre_registrations RENAME TO pre_registrations;
ALTER TABLE vms_hosts RENAME TO hosts;
ALTER TABLE vms_badge_prints RENAME TO badge_prints;
ALTER TABLE vms_badge_templates RENAME TO badge_templates;
ALTER TABLE vms_checkin_points RENAME TO checkin_points;
ALTER TABLE vms_emergency_alerts RENAME TO emergency_alerts;

-- Revert Finance Module Tables
ALTER TABLE finc_customers RENAME TO billing_customers;
ALTER TABLE finc_plans RENAME TO billing_plans;
ALTER TABLE finc_subscriptions RENAME TO customer_subscriptions;
ALTER TABLE finc_invoices RENAME TO invoices;
ALTER TABLE finc_invoice_items RENAME TO invoice_line_items;
ALTER TABLE finc_payments RENAME TO payments;
ALTER TABLE finc_payment_methods RENAME TO payment_methods;
ALTER TABLE finc_pricing_tiers RENAME TO pricing_tiers;

-- Revert Geography/Location Module Tables
ALTER TABLE geog_continents RENAME TO continents;
ALTER TABLE geog_countries RENAME TO countries;
ALTER TABLE geog_states RENAME TO states;
ALTER TABLE geog_cities RENAME TO cities;
ALTER TABLE geog_locations RENAME TO locations;
ALTER TABLE geog_buildings RENAME TO buildings;
ALTER TABLE geog_entry_gates RENAME TO entry_gates;

-- Revert Security Module Tables
ALTER TABLE secy_vehicle_blacklist RENAME TO vehicle_blacklist;
ALTER TABLE secy_vehicle_whitelist RENAME TO vehicle_whitelist;
ALTER TABLE secy_cameras RENAME TO cameras;
ALTER TABLE secy_alerts RENAME TO alerts;

-- Revert Core System Tables
ALTER TABLE core_organizations RENAME TO organizations;
ALTER TABLE core_profiles RENAME TO profiles;
ALTER TABLE core_user_preferences RENAME TO user_preferences;
ALTER TABLE core_user_sessions RENAME TO user_sessions;
ALTER TABLE core_themes RENAME TO themes;
ALTER TABLE core_premise_types RENAME TO premise_types;