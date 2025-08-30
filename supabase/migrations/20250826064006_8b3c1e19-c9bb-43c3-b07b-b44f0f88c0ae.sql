-- Add 4-character module prefixes to database tables for better organization
-- ANPR = Automatic Number Plate Recognition
-- VMS_ = Visitor Management System  
-- FINC = Finance
-- GEOG = Geography/Location
-- SECY = Security
-- CORE = Core System

-- ANPR Module Tables
ALTER TABLE anpr_detections RENAME TO anpr_detections_log;
ALTER TABLE anpr_usage_logs RENAME TO anpr_usage_tracking;

-- VMS Module Tables
ALTER TABLE visitors RENAME TO vms_visitors;
ALTER TABLE visitor_access_control RENAME TO vms_access_control;
ALTER TABLE visitor_audit_logs RENAME TO vms_audit_logs;
ALTER TABLE pre_registrations RENAME TO vms_pre_registrations;
ALTER TABLE hosts RENAME TO vms_hosts;
ALTER TABLE badge_prints RENAME TO vms_badge_prints;
ALTER TABLE badge_templates RENAME TO vms_badge_templates;
ALTER TABLE checkin_points RENAME TO vms_checkin_points;
ALTER TABLE emergency_alerts RENAME TO vms_emergency_alerts;

-- Finance Module Tables
ALTER TABLE billing_customers RENAME TO finc_customers;
ALTER TABLE billing_plans RENAME TO finc_plans;
ALTER TABLE customer_subscriptions RENAME TO finc_subscriptions;
ALTER TABLE invoices RENAME TO finc_invoices;
ALTER TABLE invoice_line_items RENAME TO finc_invoice_items;
ALTER TABLE payments RENAME TO finc_payments;
ALTER TABLE payment_methods RENAME TO finc_payment_methods;
ALTER TABLE pricing_tiers RENAME TO finc_pricing_tiers;

-- Geography/Location Module Tables
ALTER TABLE continents RENAME TO geog_continents;
ALTER TABLE countries RENAME TO geog_countries;
ALTER TABLE states RENAME TO geog_states;
ALTER TABLE cities RENAME TO geog_cities;
ALTER TABLE locations RENAME TO geog_locations;
ALTER TABLE buildings RENAME TO geog_buildings;
ALTER TABLE entry_gates RENAME TO geog_entry_gates;

-- Security Module Tables
ALTER TABLE vehicle_blacklist RENAME TO secy_vehicle_blacklist;
ALTER TABLE vehicle_whitelist RENAME TO secy_vehicle_whitelist;
ALTER TABLE cameras RENAME TO secy_cameras;
ALTER TABLE alerts RENAME TO secy_alerts;

-- Core System Tables
ALTER TABLE organizations RENAME TO core_organizations;
ALTER TABLE profiles RENAME TO core_profiles;
ALTER TABLE user_preferences RENAME TO core_user_preferences;
ALTER TABLE user_sessions RENAME TO core_user_sessions;
ALTER TABLE themes RENAME TO core_themes;
ALTER TABLE premise_types RENAME TO core_premise_types;