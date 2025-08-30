export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ad_placements: {
        Row: {
          campaign_id: string
          clicks_target: number | null
          created_at: string
          daily_rate: number
          dimensions: string | null
          id: string
          impressions_target: number | null
          location_id: string | null
          placement_name: string
          placement_type: string
          status: string
        }
        Insert: {
          campaign_id: string
          clicks_target?: number | null
          created_at?: string
          daily_rate: number
          dimensions?: string | null
          id?: string
          impressions_target?: number | null
          location_id?: string | null
          placement_name: string
          placement_type: string
          status?: string
        }
        Update: {
          campaign_id?: string
          clicks_target?: number | null
          created_at?: string
          daily_rate?: number
          dimensions?: string | null
          id?: string
          impressions_target?: number | null
          location_id?: string | null
          placement_name?: string
          placement_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_placements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "advertisement_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisement_campaigns: {
        Row: {
          advertiser_id: string
          billing_model: string
          campaign_name: string
          campaign_type: string
          created_at: string
          daily_budget: number | null
          end_date: string
          id: string
          organization_id: string
          rate: number
          start_date: string
          status: string
          total_budget: number
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          billing_model: string
          campaign_name: string
          campaign_type: string
          created_at?: string
          daily_budget?: number | null
          end_date: string
          id?: string
          organization_id: string
          rate: number
          start_date: string
          status?: string
          total_budget: number
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          billing_model?: string
          campaign_name?: string
          campaign_type?: string
          created_at?: string
          daily_budget?: number | null
          end_date?: string
          id?: string
          organization_id?: string
          rate?: number
          start_date?: string
          status?: string
          total_budget?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisement_campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      advertiser_payments: {
        Row: {
          advertiser_id: string
          amount: number
          campaign_id: string | null
          commission_rate: number | null
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_type: string
          performance_bonus: number | null
          status: string
        }
        Insert: {
          advertiser_id: string
          amount: number
          campaign_id?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_type: string
          performance_bonus?: number | null
          status?: string
        }
        Update: {
          advertiser_id?: string
          amount?: number
          campaign_id?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_type?: string
          performance_bonus?: number | null
          status?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          camera_id: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          organization_id: string
          resolved_at: string | null
          severity: string
          status: string
          title: string
          type: string
        }
        Insert: {
          camera_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          organization_id: string
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          type: string
        }
        Update: {
          camera_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          organization_id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "cameras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          advance_booking_days: number | null
          amenity_name: string
          amenity_type: string
          booking_rules: Json | null
          capacity: number | null
          created_at: string
          description: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          maintenance_schedule: string | null
          max_booking_hours: number | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          advance_booking_days?: number | null
          amenity_name: string
          amenity_type: string
          booking_rules?: Json | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          maintenance_schedule?: string | null
          max_booking_hours?: number | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          advance_booking_days?: number | null
          amenity_name?: string
          amenity_type?: string
          booking_rules?: Json | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          maintenance_schedule?: string | null
          max_booking_hours?: number | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      amenity_bookings: {
        Row: {
          amenity_type: string
          booking_date: string
          created_at: string
          end_time: string
          hourly_rate: number
          id: string
          start_time: string
          status: string
          total_charges: number
          unit_id: string
        }
        Insert: {
          amenity_type: string
          booking_date: string
          created_at?: string
          end_time: string
          hourly_rate: number
          id?: string
          start_time: string
          status?: string
          total_charges: number
          unit_id: string
        }
        Update: {
          amenity_type?: string
          booking_date?: string
          created_at?: string
          end_time?: string
          hourly_rate?: number
          id?: string
          start_time?: string
          status?: string
          total_charges?: number
          unit_id?: string
        }
        Relationships: []
      }
      anpr_detections: {
        Row: {
          bounding_box: Json
          camera_id: string
          color: string | null
          confidence: number
          created_at: string | null
          id: string
          image_url: string
          license_plate: string
          processing_time: number
          timestamp: string
          vehicle_type: string
        }
        Insert: {
          bounding_box: Json
          camera_id: string
          color?: string | null
          confidence: number
          created_at?: string | null
          id?: string
          image_url: string
          license_plate: string
          processing_time: number
          timestamp: string
          vehicle_type: string
        }
        Update: {
          bounding_box?: Json
          camera_id?: string
          color?: string | null
          confidence?: number
          created_at?: string | null
          id?: string
          image_url?: string
          license_plate?: string
          processing_time?: number
          timestamp?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "anpr_detections_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "cameras"
            referencedColumns: ["id"]
          },
        ]
      }
      anpr_service_charges: {
        Row: {
          billing_date: string
          billing_period_end: string
          billing_period_start: string
          charge_amount: number
          created_at: string
          customer_id: string
          discount_amount: number | null
          id: string
          quantity: number | null
          service_type: string
          status: string
          unit_price: number
        }
        Insert: {
          billing_date: string
          billing_period_end: string
          billing_period_start: string
          charge_amount: number
          created_at?: string
          customer_id: string
          discount_amount?: number | null
          id?: string
          quantity?: number | null
          service_type: string
          status?: string
          unit_price: number
        }
        Update: {
          billing_date?: string
          billing_period_end?: string
          billing_period_start?: string
          charge_amount?: number
          created_at?: string
          customer_id?: string
          discount_amount?: number | null
          id?: string
          quantity?: number | null
          service_type?: string
          status?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "anpr_service_charges_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      anpr_usage_logs: {
        Row: {
          bandwidth_used_gb: number
          billing_period_end: string
          billing_period_start: string
          camera_id: string | null
          created_at: string
          customer_id: string
          detection_count: number
          id: string
          location_id: string | null
          storage_used_gb: number
          usage_date: string
        }
        Insert: {
          bandwidth_used_gb?: number
          billing_period_end: string
          billing_period_start: string
          camera_id?: string | null
          created_at?: string
          customer_id: string
          detection_count?: number
          id?: string
          location_id?: string | null
          storage_used_gb?: number
          usage_date?: string
        }
        Update: {
          bandwidth_used_gb?: number
          billing_period_end?: string
          billing_period_start?: string
          camera_id?: string | null
          created_at?: string
          customer_id?: string
          detection_count?: number
          id?: string
          location_id?: string | null
          storage_used_gb?: number
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "anpr_usage_logs_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "cameras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anpr_usage_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anpr_usage_logs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_prints: {
        Row: {
          badge_number: string
          created_at: string
          expiry_time: string | null
          id: string
          print_status: string
          print_time: string | null
          printer_id: string | null
          qr_code_data: string | null
          template_id: string
          visit_id: string
        }
        Insert: {
          badge_number: string
          created_at?: string
          expiry_time?: string | null
          id?: string
          print_status?: string
          print_time?: string | null
          printer_id?: string | null
          qr_code_data?: string | null
          template_id: string
          visit_id: string
        }
        Update: {
          badge_number?: string
          created_at?: string
          expiry_time?: string | null
          id?: string
          print_status?: string
          print_time?: string | null
          printer_id?: string | null
          qr_code_data?: string | null
          template_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_badge_prints_template_id"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "badge_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_badge_prints_visit_id"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_templates: {
        Row: {
          active: boolean | null
          created_at: string
          design_config: Json
          id: string
          name: string
          organization_id: string
          security_features: Json | null
          template_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          design_config: Json
          id?: string
          name: string
          organization_id: string
          security_features?: Json | null
          template_type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          design_config?: Json
          id?: string
          name?: string
          organization_id?: string
          security_features?: Json | null
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          billing_address: Json
          billing_name: string
          created_at: string
          credit_limit: number | null
          current_balance: number | null
          customer_type: string
          id: string
          organization_id: string
          payment_terms: number | null
          status: string
          tax_info: Json | null
          updated_at: string
        }
        Insert: {
          billing_address: Json
          billing_name: string
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          customer_type: string
          id?: string
          organization_id: string
          payment_terms?: number | null
          status?: string
          tax_info?: Json | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json
          billing_name?: string
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          customer_type?: string
          id?: string
          organization_id?: string
          payment_terms?: number | null
          status?: string
          tax_info?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          plan_name: string
          plan_type: string
          pricing_model: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          plan_name: string
          plan_type: string
          pricing_model: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          plan_name?: string
          plan_type?: string
          pricing_model?: string
          updated_at?: string
        }
        Relationships: []
      }
      buildings: {
        Row: {
          created_at: string | null
          floors: number
          id: string
          location_id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          floors?: number
          id?: string
          location_id: string
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          floors?: number
          id?: string
          location_id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_subscriptions: {
        Row: {
          auto_renew: boolean | null
          camera_id: string
          created_at: string
          customer_id: string
          end_date: string | null
          features: Json | null
          id: string
          installation_fee: number | null
          monthly_fee: number
          start_date: string
          status: string
          subscription_plan: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          camera_id: string
          created_at?: string
          customer_id: string
          end_date?: string | null
          features?: Json | null
          id?: string
          installation_fee?: number | null
          monthly_fee: number
          start_date: string
          status?: string
          subscription_plan: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          camera_id?: string
          created_at?: string
          customer_id?: string
          end_date?: string | null
          features?: Json | null
          id?: string
          installation_fee?: number | null
          monthly_fee?: number
          start_date?: string
          status?: string
          subscription_plan?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "camera_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_camera_subscriptions_camera"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "cameras"
            referencedColumns: ["id"]
          },
        ]
      }
      cameras: {
        Row: {
          created_at: string | null
          entry_gate_id: string
          fps: number
          id: string
          ip_address: string
          last_ping: string | null
          model: string
          name: string
          resolution: string
          rtsp_url: string
          status: string
          yolo_config: Json | null
        }
        Insert: {
          created_at?: string | null
          entry_gate_id: string
          fps?: number
          id?: string
          ip_address: string
          last_ping?: string | null
          model: string
          name: string
          resolution?: string
          rtsp_url: string
          status?: string
          yolo_config?: Json | null
        }
        Update: {
          created_at?: string | null
          entry_gate_id?: string
          fps?: number
          id?: string
          ip_address?: string
          last_ping?: string | null
          model?: string
          name?: string
          resolution?: string
          rtsp_url?: string
          status?: string
          yolo_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cameras_entry_gate_id_fkey"
            columns: ["entry_gate_id"]
            isOneToOne: false
            referencedRelation: "entry_gates"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_performance: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          placement_id: string | null
          revenue: number | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date: string
          id?: string
          impressions?: number | null
          placement_id?: string | null
          revenue?: number | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          placement_id?: string | null
          revenue?: number | null
        }
        Relationships: []
      }
      charge_categories: {
        Row: {
          billing_frequency: string | null
          category_name: string
          category_type: string
          created_at: string
          default_amount: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          billing_frequency?: string | null
          category_name: string
          category_type: string
          created_at?: string
          default_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          billing_frequency?: string | null
          category_name?: string
          category_type?: string
          created_at?: string
          default_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      checkin_points: {
        Row: {
          config: Json | null
          created_at: string
          entry_gate_id: string
          id: string
          name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          entry_gate_id: string
          id?: string
          name: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          entry_gate_id?: string
          id?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_points_entry_gate_id_fkey"
            columns: ["entry_gate_id"]
            isOneToOne: false
            referencedRelation: "entry_gates"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          state_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          state_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          state_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      continents: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          continent_id: string
          created_at: string | null
          id: string
          name: string
          plate_format: string
        }
        Insert: {
          code: string
          continent_id: string
          created_at?: string | null
          id?: string
          name: string
          plate_format: string
        }
        Update: {
          code?: string
          continent_id?: string
          created_at?: string | null
          id?: string
          name?: string
          plate_format?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_continent_id_fkey"
            columns: ["continent_id"]
            isOneToOne: false
            referencedRelation: "continents"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string
          created_at: string
          customer_id: string
          end_date: string | null
          id: string
          next_billing_date: string | null
          plan_id: string
          proration_enabled: boolean | null
          start_date: string
          status: string
          subscription_name: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: string
          created_at?: string
          customer_id: string
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          plan_id: string
          proration_enabled?: boolean | null
          start_date: string
          status?: string
          subscription_name: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string
          created_at?: string
          customer_id?: string
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          plan_id?: string
          proration_enabled?: boolean | null
          start_date?: string
          status?: string
          subscription_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_alerts: {
        Row: {
          accounted_visitors_count: number | null
          alert_level: string
          alert_time: string
          alert_type: string
          created_at: string
          created_by: string
          id: string
          location_id: string | null
          message: string
          missing_visitors: string[] | null
          organization_id: string
          resolved_by: string | null
          resolved_time: string | null
          status: string
          title: string
          total_visitors_count: number | null
          updated_at: string
        }
        Insert: {
          accounted_visitors_count?: number | null
          alert_level: string
          alert_time?: string
          alert_type: string
          created_at?: string
          created_by: string
          id?: string
          location_id?: string | null
          message: string
          missing_visitors?: string[] | null
          organization_id: string
          resolved_by?: string | null
          resolved_time?: string | null
          status?: string
          title: string
          total_visitors_count?: number | null
          updated_at?: string
        }
        Update: {
          accounted_visitors_count?: number | null
          alert_level?: string
          alert_time?: string
          alert_type?: string
          created_at?: string
          created_by?: string
          id?: string
          location_id?: string | null
          message?: string
          missing_visitors?: string[] | null
          organization_id?: string
          resolved_by?: string | null
          resolved_time?: string | null
          status?: string
          title?: string
          total_visitors_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      entry_gates: {
        Row: {
          building_id: string
          created_at: string | null
          id: string
          name: string
          status: string
          type: string
        }
        Insert: {
          building_id: string
          created_at?: string | null
          id?: string
          name: string
          status?: string
          type: string
        }
        Update: {
          building_id?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_gates_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_tracking: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          description: string
          expense_category: string
          expense_date: string
          id: string
          invoice_reference: string | null
          organization_id: string
          payment_method: string | null
          status: string
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          created_at?: string
          description: string
          expense_category: string
          expense_date: string
          id?: string
          invoice_reference?: string | null
          organization_id: string
          payment_method?: string | null
          status?: string
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          description?: string
          expense_category?: string
          expense_date?: string
          id?: string
          invoice_reference?: string | null
          organization_id?: string
          payment_method?: string | null
          status?: string
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: []
      }
      financial_reports: {
        Row: {
          created_at: string
          created_by: string | null
          generated_date: string
          id: string
          organization_id: string
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          generated_date?: string
          id?: string
          organization_id: string
          period_end: string
          period_start: string
          report_data?: Json
          report_type: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          generated_date?: string
          id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          report_data?: Json
          report_type?: string
          status?: string
        }
        Relationships: []
      }
      hosts: {
        Row: {
          auto_approve_visitors: boolean | null
          availability_status: string
          created_at: string
          department: string | null
          id: string
          job_title: string | null
          location_id: string | null
          notification_preferences: Json | null
          organization_id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_approve_visitors?: boolean | null
          availability_status?: string
          created_at?: string
          department?: string | null
          id?: string
          job_title?: string | null
          location_id?: string | null
          notification_preferences?: Json | null
          organization_id: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_approve_visitors?: boolean | null
          availability_status?: string
          created_at?: string
          department?: string | null
          id?: string
          job_title?: string | null
          location_id?: string | null
          notification_preferences?: Json | null
          organization_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          annual_income: number | null
          blood_group: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employer_address: string | null
          employer_name: string | null
          full_name: string
          gender: string | null
          id: string
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          is_primary_resident: boolean | null
          marital_status: string | null
          member_type: string
          move_in_date: string | null
          move_out_date: string | null
          nationality: string | null
          notes: string | null
          occupation: string | null
          pets: Json | null
          primary_phone: string | null
          relationship: string | null
          secondary_phone: string | null
          special_needs: string | null
          status: string | null
          unit_id: string
          updated_at: string
          vehicle_count: number | null
          vehicle_details: Json | null
          work_phone: string | null
        }
        Insert: {
          annual_income?: number | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employer_address?: string | null
          employer_name?: string | null
          full_name: string
          gender?: string | null
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_primary_resident?: boolean | null
          marital_status?: string | null
          member_type: string
          move_in_date?: string | null
          move_out_date?: string | null
          nationality?: string | null
          notes?: string | null
          occupation?: string | null
          pets?: Json | null
          primary_phone?: string | null
          relationship?: string | null
          secondary_phone?: string | null
          special_needs?: string | null
          status?: string | null
          unit_id: string
          updated_at?: string
          vehicle_count?: number | null
          vehicle_details?: Json | null
          work_phone?: string | null
        }
        Update: {
          annual_income?: number | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employer_address?: string | null
          employer_name?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_primary_resident?: boolean | null
          marital_status?: string | null
          member_type?: string
          move_in_date?: string | null
          move_out_date?: string | null
          nationality?: string | null
          notes?: string | null
          occupation?: string | null
          pets?: Json | null
          primary_phone?: string | null
          relationship?: string | null
          secondary_phone?: string | null
          special_needs?: string | null
          status?: string | null
          unit_id?: string
          updated_at?: string
          vehicle_count?: number | null
          vehicle_details?: Json | null
          work_phone?: string | null
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          discount_percentage: number | null
          id: string
          invoice_id: string
          line_total: number
          metadata: Json | null
          quantity: number
          service_type: string
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_percentage?: number | null
          id?: string
          invoice_id: string
          line_total: number
          metadata?: Json | null
          quantity?: number
          service_type: string
          tax_rate?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_percentage?: number | null
          id?: string
          invoice_id?: string
          line_total?: number
          metadata?: Json | null
          quantity?: number
          service_type?: string
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          discount_amount: number
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          outstanding_amount: number
          paid_amount: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          discount_amount?: number
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          outstanding_amount?: number
          paid_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          outstanding_amount?: number
          paid_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          city_id: string
          coordinates: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          address: string
          city_id: string
          coordinates?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          address?: string
          city_id?: string
          coordinates?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_charges: {
        Row: {
          amount: number
          billing_month: string
          category_id: string | null
          charge_type: string
          created_at: string
          description: string | null
          discount_amount: number | null
          due_date: string
          due_reminder_sent: boolean | null
          id: string
          late_fee: number | null
          overdue_days: number | null
          paid_date: string | null
          payment_reference: string | null
          penalty_amount: number | null
          status: string
          tax_amount: number | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          billing_month: string
          category_id?: string | null
          charge_type: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          due_date: string
          due_reminder_sent?: boolean | null
          id?: string
          late_fee?: number | null
          overdue_days?: number | null
          paid_date?: string | null
          payment_reference?: string | null
          penalty_amount?: number | null
          status?: string
          tax_amount?: number | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_month?: string
          category_id?: string | null
          charge_type?: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          due_date?: string
          due_reminder_sent?: boolean | null
          id?: string
          late_fee?: number | null
          overdue_days?: number | null
          paid_date?: string | null
          payment_reference?: string | null
          penalty_amount?: number | null
          status?: string
          tax_amount?: number | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_maintenance_charges_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "charge_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_maintenance_charges_unit"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "society_units"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          status: string
          subscription_plan: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          status?: string
          subscription_plan?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          status?: string
          subscription_plan?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      parking_slots: {
        Row: {
          assigned_to_unit: string | null
          created_at: string
          dimensions: string | null
          features: Json | null
          id: string
          is_available: boolean | null
          location: string | null
          monthly_rate: number | null
          organization_id: string
          slot_number: string
          slot_type: string
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          assigned_to_unit?: string | null
          created_at?: string
          dimensions?: string | null
          features?: Json | null
          id?: string
          is_available?: boolean | null
          location?: string | null
          monthly_rate?: number | null
          organization_id: string
          slot_number: string
          slot_type: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          assigned_to_unit?: string | null
          created_at?: string
          dimensions?: string | null
          features?: Json | null
          id?: string
          is_available?: boolean | null
          location?: string | null
          monthly_rate?: number | null
          organization_id?: string
          slot_number?: string
          slot_type?: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_last_four: string | null
          bank_name: string | null
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last_four: string | null
          created_at: string
          customer_id: string
          gateway_customer_id: string | null
          gateway_payment_method_id: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          method_type: string
          updated_at: string
        }
        Insert: {
          account_last_four?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last_four?: string | null
          created_at?: string
          customer_id: string
          gateway_customer_id?: string | null
          gateway_payment_method_id?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          method_type: string
          updated_at?: string
        }
        Update: {
          account_last_four?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last_four?: string | null
          created_at?: string
          customer_id?: string
          gateway_customer_id?: string | null
          gateway_payment_method_id?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          method_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          gateway_fee: number | null
          gateway_transaction_id: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_gateway: string | null
          payment_method: string
          payment_number: string
          processed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          gateway_fee?: number | null
          gateway_transaction_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_gateway?: string | null
          payment_method: string
          payment_number: string
          processed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          gateway_fee?: number | null
          gateway_transaction_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_gateway?: string | null
          payment_method?: string
          payment_number?: string
          processed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_registrations: {
        Row: {
          approval_deadline: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          expected_duration_minutes: number | null
          group_size: number | null
          host_id: string
          id: string
          location_id: string
          organization_id: string
          purpose: string
          qr_code: string | null
          rejection_reason: string | null
          scheduled_date: string
          scheduled_time: string | null
          special_requirements: Json | null
          status: string
          updated_at: string
          visitor_details: Json
          visitor_id: string | null
        }
        Insert: {
          approval_deadline?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          expected_duration_minutes?: number | null
          group_size?: number | null
          host_id: string
          id?: string
          location_id: string
          organization_id: string
          purpose: string
          qr_code?: string | null
          rejection_reason?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          special_requirements?: Json | null
          status?: string
          updated_at?: string
          visitor_details: Json
          visitor_id?: string | null
        }
        Update: {
          approval_deadline?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          expected_duration_minutes?: number | null
          group_size?: number | null
          host_id?: string
          id?: string
          location_id?: string
          organization_id?: string
          purpose?: string
          qr_code?: string | null
          rejection_reason?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          special_requirements?: Json | null
          status?: string
          updated_at?: string
          visitor_details?: Json
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pre_registrations_host_id"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pre_registrations_location_id"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pre_registrations_visitor_id"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      premise_types: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          created_at: string
          id: string
          max_quantity: number | null
          min_quantity: number | null
          plan_id: string
          setup_fee: number | null
          tier_name: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          plan_id: string
          setup_fee?: number | null
          tier_name: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          plan_id?: string
          setup_fee?: number | null
          tier_name?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_locked_until: string | null
          active_from: string | null
          active_until: string | null
          created_at: string | null
          email: string
          failed_login_attempts: number | null
          full_name: string
          id: string
          last_login: string | null
          organization_id: string
          password_reset_expires: string | null
          password_reset_token: string | null
          permissions: string[] | null
          phone_number: string | null
          preferred_2fa_method: string | null
          role: string
          status: string
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
        }
        Insert: {
          account_locked_until?: string | null
          active_from?: string | null
          active_until?: string | null
          created_at?: string | null
          email: string
          failed_login_attempts?: number | null
          full_name: string
          id: string
          last_login?: string | null
          organization_id: string
          password_reset_expires?: string | null
          password_reset_token?: string | null
          permissions?: string[] | null
          phone_number?: string | null
          preferred_2fa_method?: string | null
          role: string
          status?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
        }
        Update: {
          account_locked_until?: string | null
          active_from?: string | null
          active_until?: string | null
          created_at?: string | null
          email?: string
          failed_login_attempts?: number | null
          full_name?: string
          id?: string
          last_login?: string | null
          organization_id?: string
          password_reset_expires?: string | null
          password_reset_token?: string | null
          permissions?: string[] | null
          phone_number?: string | null
          preferred_2fa_method?: string | null
          role?: string
          status?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profit_loss_statements: {
        Row: {
          created_at: string
          gross_profit: number | null
          id: string
          net_profit: number
          organization_id: string
          period_end: string
          period_start: string
          profit_margin: number
          total_expenses: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          gross_profit?: number | null
          id?: string
          net_profit?: number
          organization_id: string
          period_end: string
          period_start: string
          profit_margin?: number
          total_expenses?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          gross_profit?: number | null
          id?: string
          net_profit?: number
          organization_id?: string
          period_end?: string
          period_start?: string
          profit_margin?: number
          total_expenses?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: []
      }
      revenue_breakdown: {
        Row: {
          created_at: string
          id: string
          percentage: number
          report_id: string
          revenue_amount: number
          service_category: string
          unit_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          percentage?: number
          report_id: string
          revenue_amount?: number
          service_category: string
          unit_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          percentage?: number
          report_id?: string
          revenue_amount?: number
          service_category?: string
          unit_count?: number | null
        }
        Relationships: []
      }
      service_types: {
        Row: {
          billing_model: string | null
          created_at: string
          default_rate: number | null
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          service_category: string
          service_name: string
          unit_type: string | null
          updated_at: string
        }
        Insert: {
          billing_model?: string | null
          created_at?: string
          default_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          service_category: string
          service_name: string
          unit_type?: string | null
          updated_at?: string
        }
        Update: {
          billing_model?: string | null
          created_at?: string
          default_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          service_category?: string
          service_name?: string
          unit_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      society_units: {
        Row: {
          area_sqft: number
          created_at: string
          id: string
          monthly_flat_rate: number
          monthly_rate_per_sqft: number
          organization_id: string
          owner_name: string | null
          parking_slots: number | null
          status: string
          tenant_name: string | null
          unit_number: string
          unit_type: string
          updated_at: string
        }
        Insert: {
          area_sqft?: number
          created_at?: string
          id?: string
          monthly_flat_rate?: number
          monthly_rate_per_sqft?: number
          organization_id: string
          owner_name?: string | null
          parking_slots?: number | null
          status?: string
          tenant_name?: string | null
          unit_number: string
          unit_type: string
          updated_at?: string
        }
        Update: {
          area_sqft?: number
          created_at?: string
          id?: string
          monthly_flat_rate?: number
          monthly_rate_per_sqft?: number
          organization_id?: string
          owner_name?: string | null
          parking_slots?: number | null
          status?: string
          tenant_name?: string | null
          unit_number?: string
          unit_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      states: {
        Row: {
          code: string
          country_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          country_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          country_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "states_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          colors: Json
          created_at: string
          created_by: string
          dark_colors: Json | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          colors: Json
          created_at?: string
          created_by: string
          dark_colors?: Json | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          colors?: Json
          created_at?: string
          created_by?: string
          dark_colors?: Json | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          theme_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          theme_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          theme_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          session_token: string
          two_factor_verified: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          session_token: string
          two_factor_verified?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          session_token?: string
          two_factor_verified?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_readings: {
        Row: {
          billing_month: string
          consumption: number | null
          created_at: string
          current_reading: number
          id: string
          previous_reading: number
          rate_per_unit: number
          reading_date: string
          unit_id: string
          utility_type: string
        }
        Insert: {
          billing_month: string
          consumption?: number | null
          created_at?: string
          current_reading?: number
          id?: string
          previous_reading?: number
          rate_per_unit: number
          reading_date: string
          unit_id: string
          utility_type: string
        }
        Update: {
          billing_month?: string
          consumption?: number | null
          created_at?: string
          current_reading?: number
          id?: string
          previous_reading?: number
          rate_per_unit?: number
          reading_date?: string
          unit_id?: string
          utility_type?: string
        }
        Relationships: []
      }
      vehicle_blacklist: {
        Row: {
          created_at: string | null
          id: string
          license_plate: string
          notes: string | null
          organization_id: string
          reason: string
          reported_by: string
          severity: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          license_plate: string
          notes?: string | null
          organization_id: string
          reason: string
          reported_by: string
          severity?: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          license_plate?: string
          notes?: string | null
          organization_id?: string
          reason?: string
          reported_by?: string
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_blacklist_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_whitelist: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          license_plate: string
          notes: string | null
          organization_id: string
          owner_contact: string | null
          owner_name: string
          status: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          license_plate: string
          notes?: string | null
          organization_id: string
          owner_contact?: string | null
          owner_name: string
          status?: string
          vehicle_type: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          license_plate?: string
          notes?: string | null
          organization_id?: string
          owner_contact?: string | null
          owner_name?: string
          status?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_whitelist_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_access_control: {
        Row: {
          active: boolean | null
          added_by: string
          created_at: string
          expires_at: string | null
          id: string
          list_type: string
          notes: string | null
          organization_id: string
          reason: string
          updated_at: string
          visitor_id: string | null
        }
        Insert: {
          active?: boolean | null
          added_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          list_type: string
          notes?: string | null
          organization_id: string
          reason: string
          updated_at?: string
          visitor_id?: string | null
        }
        Update: {
          active?: boolean | null
          added_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          list_type?: string
          notes?: string | null
          organization_id?: string
          reason?: string
          updated_at?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      visitor_audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          location_id: string | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          user_agent: string | null
          user_id: string | null
          visit_id: string | null
          visitor_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          location_id?: string | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          user_agent?: string | null
          user_id?: string | null
          visit_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          location_id?: string | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          user_agent?: string | null
          user_id?: string | null
          visit_id?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          id: string
          id_number: string | null
          id_type: string | null
          last_name: string
          last_visit_date: string | null
          phone: string | null
          photo_url: string | null
          security_status: string
          updated_at: string
          visit_count: number | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          last_name: string
          last_visit_date?: string | null
          phone?: string | null
          photo_url?: string | null
          security_status?: string
          updated_at?: string
          visit_count?: number | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          last_name?: string
          last_visit_date?: string | null
          phone?: string | null
          photo_url?: string | null
          security_status?: string
          updated_at?: string
          visit_count?: number | null
        }
        Relationships: []
      }
      visits: {
        Row: {
          agreements_signed: string[] | null
          approved_by: string | null
          badge_number: string | null
          badge_printed: boolean | null
          building_id: string | null
          check_in_time: string | null
          check_out_time: string | null
          checked_in_by: string | null
          checked_out_by: string | null
          checkin_point_id: string | null
          created_at: string
          created_by: string | null
          entry_gate_id: string | null
          expected_checkout_time: string | null
          expected_duration_minutes: number | null
          health_declaration: Json | null
          host_id: string | null
          id: string
          location_id: string
          notes: string | null
          organization_id: string
          purpose: string
          status: string
          updated_at: string
          visit_type: string
          visitor_id: string
          visitor_photo_url: string | null
        }
        Insert: {
          agreements_signed?: string[] | null
          approved_by?: string | null
          badge_number?: string | null
          badge_printed?: boolean | null
          building_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_by?: string | null
          checked_out_by?: string | null
          checkin_point_id?: string | null
          created_at?: string
          created_by?: string | null
          entry_gate_id?: string | null
          expected_checkout_time?: string | null
          expected_duration_minutes?: number | null
          health_declaration?: Json | null
          host_id?: string | null
          id?: string
          location_id: string
          notes?: string | null
          organization_id: string
          purpose: string
          status?: string
          updated_at?: string
          visit_type?: string
          visitor_id: string
          visitor_photo_url?: string | null
        }
        Update: {
          agreements_signed?: string[] | null
          approved_by?: string | null
          badge_number?: string | null
          badge_printed?: boolean | null
          building_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_by?: string | null
          checked_out_by?: string | null
          checkin_point_id?: string | null
          created_at?: string
          created_by?: string | null
          entry_gate_id?: string | null
          expected_checkout_time?: string | null
          expected_duration_minutes?: number | null
          health_declaration?: Json | null
          host_id?: string | null
          id?: string
          location_id?: string
          notes?: string | null
          organization_id?: string
          purpose?: string
          status?: string
          updated_at?: string
          visit_type?: string
          visitor_id?: string
          visitor_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_visits_host_id"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visits_visitor_id"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_custom_theme: {
        Args: {
          creator_id: string
          theme_colors: Json
          theme_dark_colors: Json
          theme_name: string
        }
        Returns: {
          colors: Json
          created_by: string
          dark_colors: Json
          id: string
          name: string
        }[]
      }
      delete_custom_theme: {
        Args: { theme_id: string }
        Returns: undefined
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_payment_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_custom_themes: {
        Args: Record<PropertyKey, never>
        Returns: {
          colors: Json
          created_by: string
          dark_colors: Json
          id: string
          name: string
        }[]
      }
      get_user_organization: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_theme_preference: {
        Args: { user_id: string }
        Returns: string
      }
      increment_failed_login: {
        Args: { user_email: string }
        Returns: undefined
      }
      is_user_active: {
        Args: { user_id: string }
        Returns: boolean
      }
      reset_failed_login: {
        Args: { user_email: string }
        Returns: undefined
      }
      upsert_user_theme_preference: {
        Args: { theme_id: string; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
