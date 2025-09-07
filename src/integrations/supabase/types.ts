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
      access_cards: {
        Row: {
          access_levels: Json | null
          card_number: string
          card_type: string | null
          created_at: string
          created_by: string | null
          expiry_date: string | null
          holder_id: string | null
          holder_name: string
          id: string
          is_active: boolean | null
          issue_date: string | null
          last_used_at: string | null
          organization_id: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          access_levels?: Json | null
          card_number: string
          card_type?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          holder_id?: string | null
          holder_name: string
          id?: string
          is_active?: boolean | null
          issue_date?: string | null
          last_used_at?: string | null
          organization_id: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          access_levels?: Json | null
          card_number?: string
          card_type?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          holder_id?: string | null
          holder_name?: string
          id?: string
          is_active?: boolean | null
          issue_date?: string | null
          last_used_at?: string | null
          organization_id?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      advertisement_campaigns: {
        Row: {
          advertiser_id: string | null
          budget: number | null
          campaign_name: string
          campaign_type: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          organization_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          advertiser_id?: string | null
          budget?: number | null
          campaign_name: string
          campaign_type: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          organization_id?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          advertiser_id?: string | null
          budget?: number | null
          campaign_name?: string
          campaign_type?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          organization_id?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          message: string
          organization_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          organization_id?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      amc_contracts: {
        Row: {
          contract_end_date: string
          contract_number: string
          contract_start_date: string
          contract_value: number
          created_at: string
          created_by: string | null
          equipment_details: string | null
          equipment_type: string
          id: string
          last_service_date: string | null
          next_service_date: string | null
          organization_id: string
          renewal_alert_days: number | null
          service_frequency: string | null
          service_history: Json | null
          status: string | null
          terms_conditions: string | null
          updated_at: string
          vendor_id: string | null
          warranty_period: number | null
        }
        Insert: {
          contract_end_date: string
          contract_number: string
          contract_start_date: string
          contract_value: number
          created_at?: string
          created_by?: string | null
          equipment_details?: string | null
          equipment_type: string
          id?: string
          last_service_date?: string | null
          next_service_date?: string | null
          organization_id: string
          renewal_alert_days?: number | null
          service_frequency?: string | null
          service_history?: Json | null
          status?: string | null
          terms_conditions?: string | null
          updated_at?: string
          vendor_id?: string | null
          warranty_period?: number | null
        }
        Update: {
          contract_end_date?: string
          contract_number?: string
          contract_start_date?: string
          contract_value?: number
          created_at?: string
          created_by?: string | null
          equipment_details?: string | null
          equipment_type?: string
          id?: string
          last_service_date?: string | null
          next_service_date?: string | null
          organization_id?: string
          renewal_alert_days?: number | null
          service_frequency?: string | null
          service_history?: Json | null
          status?: string | null
          terms_conditions?: string | null
          updated_at?: string
          vendor_id?: string | null
          warranty_period?: number | null
        }
        Relationships: []
      }
      amenities: {
        Row: {
          amenity_type: string
          booking_required: boolean | null
          building_id: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          operating_hours: Json | null
          pricing: Json | null
          updated_at: string | null
        }
        Insert: {
          amenity_type: string
          booking_required?: boolean | null
          building_id?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          operating_hours?: Json | null
          pricing?: Json | null
          updated_at?: string | null
        }
        Update: {
          amenity_type?: string
          booking_required?: boolean | null
          building_id?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          operating_hours?: Json | null
          pricing?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "amenities_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          priority: string | null
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          priority?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          priority?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      anpr_detections: {
        Row: {
          camera_id: string | null
          confidence: number
          created_at: string | null
          detection_timestamp: string | null
          id: string
          image_url: string | null
          license_plate: string
          organization_id: string | null
          vehicle_type: string | null
        }
        Insert: {
          camera_id?: string | null
          confidence: number
          created_at?: string | null
          detection_timestamp?: string | null
          id?: string
          image_url?: string | null
          license_plate: string
          organization_id?: string | null
          vehicle_type?: string | null
        }
        Update: {
          camera_id?: string | null
          confidence?: number
          created_at?: string | null
          detection_timestamp?: string | null
          id?: string
          image_url?: string | null
          license_plate?: string
          organization_id?: string | null
          vehicle_type?: string | null
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
      badge_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          design_config: Json
          id: string
          name: string
          organization_id: string | null
          security_features: Json
          template_type: Database["public"]["Enums"]["badge_template_type"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          design_config?: Json
          id?: string
          name: string
          organization_id?: string | null
          security_features?: Json
          template_type: Database["public"]["Enums"]["badge_template_type"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          design_config?: Json
          id?: string
          name?: string
          organization_id?: string | null
          security_features?: Json
          template_type?: Database["public"]["Enums"]["badge_template_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badge_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string | null
          bank_name: string
          branch_name: string | null
          created_at: string
          current_balance: number | null
          id: string
          ifsc_code: string | null
          is_active: boolean | null
          opening_balance: number | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type?: string | null
          bank_name: string
          branch_name?: string | null
          created_at?: string
          current_balance?: number | null
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          opening_balance?: number | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string | null
          bank_name?: string
          branch_name?: string | null
          created_at?: string
          current_balance?: number | null
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          opening_balance?: number | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          address: string | null
          billing_plan: string | null
          created_at: string | null
          customer_name: string
          email: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          payment_method: Json | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          billing_plan?: string | null
          created_at?: string | null
          customer_name: string
          email: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          payment_method?: Json | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          billing_plan?: string | null
          created_at?: string | null
          customer_name?: string
          email?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          payment_method?: Json | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      buildings: {
        Row: {
          building_type: Database["public"]["Enums"]["building_type"]
          created_at: string | null
          description: string | null
          floors: number | null
          id: string
          is_active: boolean | null
          location_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          building_type: Database["public"]["Enums"]["building_type"]
          created_at?: string | null
          description?: string | null
          floors?: number | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          building_type?: Database["public"]["Enums"]["building_type"]
          created_at?: string | null
          description?: string | null
          floors?: number | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          name?: string
          updated_at?: string | null
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
          camera_id: string | null
          created_at: string | null
          end_date: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          monthly_cost: number | null
          organization_id: string | null
          start_date: string
          subscription_plan: string
          updated_at: string | null
        }
        Insert: {
          camera_id?: string | null
          created_at?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_cost?: number | null
          organization_id?: string | null
          start_date: string
          subscription_plan: string
          updated_at?: string | null
        }
        Update: {
          camera_id?: string | null
          created_at?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_cost?: number | null
          organization_id?: string | null
          start_date?: string
          subscription_plan?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camera_subscriptions_camera_id_fkey"
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
          entry_gate_id: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          name: string
          password: string | null
          rtsp_url: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          entry_gate_id?: string | null
          id?: string
          ip_address: unknown
          is_active?: boolean | null
          name: string
          password?: string | null
          rtsp_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          entry_gate_id?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          name?: string
          password?: string | null
          rtsp_url?: string | null
          updated_at?: string | null
          username?: string | null
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
      charge_categories: {
        Row: {
          base_amount: number | null
          billing_cycle: string | null
          charge_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_amount?: number | null
          billing_cycle?: string | null
          charge_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_amount?: number | null
          billing_cycle?: string | null
          charge_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_category: string | null
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_category?: string | null
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_category?: string | null
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          postal_code: string | null
          state_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          postal_code?: string | null
          state_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          postal_code?: string | null
          state_id?: string | null
          updated_at?: string | null
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
      community_assets: {
        Row: {
          asset_name: string
          asset_type: string
          assigned_to: string | null
          condition: string | null
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          location: string | null
          maintenance_schedule: Json | null
          organization_id: string | null
          purchase_cost: number | null
          purchase_date: string | null
          status: string | null
          updated_at: string
          warranty_expires: string | null
        }
        Insert: {
          asset_name: string
          asset_type: string
          assigned_to?: string | null
          condition?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          location?: string | null
          maintenance_schedule?: Json | null
          organization_id?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          status?: string | null
          updated_at?: string
          warranty_expires?: string | null
        }
        Update: {
          asset_name?: string
          asset_type?: string
          assigned_to?: string | null
          condition?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          location?: string | null
          maintenance_schedule?: Json | null
          organization_id?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          status?: string | null
          updated_at?: string
          warranty_expires?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_documents: {
        Row: {
          access_level: string | null
          category: string
          created_at: string
          description: string | null
          document_name: string
          document_type: string
          file_path: string | null
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          organization_id: string | null
          updated_at: string
          uploaded_by: string | null
          version_number: number | null
        }
        Insert: {
          access_level?: string | null
          category: string
          created_at?: string
          description?: string | null
          document_name: string
          document_type: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          organization_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          version_number?: number | null
        }
        Update: {
          access_level?: string | null
          category?: string
          created_at?: string
          description?: string | null
          document_name?: string
          document_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          organization_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_type: string
          id: string
          location: string | null
          max_capacity: number | null
          organization_id: string | null
          registration_deadline: string | null
          registration_required: boolean | null
          start_date: string
          start_time: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type: string
          id?: string
          location?: string | null
          max_capacity?: number | null
          organization_id?: string | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          start_date: string
          start_time?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          max_capacity?: number | null
          organization_id?: string | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          start_date?: string
          start_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_polls: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          poll_type: string | null
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          poll_type?: string | null
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          poll_type?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_polls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      continents: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          continent_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          phone_code: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          continent_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          phone_code?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          continent_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          phone_code?: string | null
          updated_at?: string | null
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
      departments: {
        Row: {
          budget: number | null
          created_at: string | null
          description: string | null
          head_of_department: string | null
          id: string
          name: string
          organization_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          head_of_department?: string | null
          id?: string
          name: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          head_of_department?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_id_cards: {
        Row: {
          access_permissions: Json | null
          card_number: string
          card_type: string | null
          created_at: string
          expiry_date: string | null
          id: string
          is_active: boolean | null
          issue_date: string | null
          organization_id: string
          qr_code_data: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_permissions?: Json | null
          card_number: string
          card_type?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issue_date?: string | null
          organization_id: string
          qr_code_data: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_permissions?: Json | null
          card_number?: string
          card_type?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issue_date?: string | null
          organization_id?: string
          qr_code_data?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          address: string | null
          availability: string | null
          contact_name: string
          contact_type: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          notes: string | null
          organization_id: string
          phone_primary: string
          phone_secondary: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          availability?: string | null
          contact_name: string
          contact_type: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          organization_id: string
          phone_primary: string
          phone_secondary?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          availability?: string | null
          contact_name?: string
          contact_type?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          organization_id?: string
          phone_primary?: string
          phone_secondary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      entry_gates: {
        Row: {
          building_id: string | null
          created_at: string | null
          description: string | null
          gate_type: Database["public"]["Enums"]["gate_type"]
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          building_id?: string | null
          created_at?: string | null
          description?: string | null
          gate_type: Database["public"]["Enums"]["gate_type"]
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          building_id?: string | null
          created_at?: string | null
          description?: string | null
          gate_type?: Database["public"]["Enums"]["gate_type"]
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
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
      event_registrations: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          notes: string | null
          registration_date: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          notes?: string | null
          registration_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          notes?: string | null
          registration_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_discussions: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string | null
          id: string
          organization_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      helpdesk_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          organization_id: string | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          ticket_number: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          organization_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          ticket_number: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          organization_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          ticket_number?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hosts: {
        Row: {
          auto_approve_visitors: boolean | null
          availability_status: string | null
          created_at: string | null
          department: string | null
          id: string
          job_title: string | null
          notification_preferences: Json | null
          organization_id: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_approve_visitors?: boolean | null
          availability_status?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          job_title?: string | null
          notification_preferences?: Json | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_approve_visitors?: boolean | null
          availability_status?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          job_title?: string | null
          notification_preferences?: Json | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hosts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          line_items: Json | null
          notes: string | null
          organization_id: string | null
          outstanding_amount: number
          payment_terms: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          line_items?: Json | null
          notes?: string | null
          organization_id?: string | null
          outstanding_amount?: number
          payment_terms?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          line_items?: Json | null
          notes?: string | null
          organization_id?: string | null
          outstanding_amount?: number
          payment_terms?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          id: string
          organization_id: string
          reference_number: string | null
          status: string | null
          total_credit_amount: number
          total_debit_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          entry_date: string
          entry_number: string
          id?: string
          organization_id: string
          reference_number?: string | null
          status?: string | null
          total_credit_amount?: number
          total_debit_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          organization_id?: string
          reference_number?: string | null
          status?: string | null
          total_credit_amount?: number
          total_debit_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          journal_entry_id: string
          line_number: number | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id: string
          line_number?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id?: string
          line_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          city_id: string | null
          Coordinates: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city_id?: string | null
          Coordinates?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city_id?: string | null
          Coordinates?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
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
          billing_period: string
          charge_category_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          organization_id: string | null
          status: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          billing_period: string
          charge_category_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_period?: string
          charge_category_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_charges_charge_category_id_fkey"
            columns: ["charge_category_id"]
            isOneToOne: false
            referencedRelation: "charge_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_charges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_charges_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "society_units"
            referencedColumns: ["id"]
          },
        ]
      }
      move_records: {
        Row: {
          checklist_completed: boolean | null
          checklist_items: Json | null
          created_at: string
          created_by: string | null
          deposit_status: string | null
          documentation: Json | null
          id: string
          key_handover: boolean | null
          move_date: string
          move_type: string
          notes: string | null
          organization_id: string
          resident_email: string | null
          resident_name: string
          resident_phone: string | null
          security_deposit: number | null
          status: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          checklist_completed?: boolean | null
          checklist_items?: Json | null
          created_at?: string
          created_by?: string | null
          deposit_status?: string | null
          documentation?: Json | null
          id?: string
          key_handover?: boolean | null
          move_date: string
          move_type: string
          notes?: string | null
          organization_id: string
          resident_email?: string | null
          resident_name: string
          resident_phone?: string | null
          security_deposit?: number | null
          status?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          checklist_completed?: boolean | null
          checklist_items?: Json | null
          created_at?: string
          created_by?: string | null
          deposit_status?: string | null
          documentation?: Json | null
          id?: string
          key_handover?: boolean | null
          move_date?: string
          move_type?: string
          notes?: string | null
          organization_id?: string
          resident_email?: string | null
          resident_name?: string
          resident_phone?: string | null
          security_deposit?: number | null
          status?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          city_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          parent_id: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          parent_id?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_type?: Database["public"]["Enums"]["organization_type"]
          parent_id?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
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
          area: string | null
          assigned_unit_id: string | null
          building_id: string | null
          created_at: string
          floor_level: number | null
          id: string
          is_reserved: boolean | null
          monthly_fee: number | null
          notes: string | null
          organization_id: string | null
          slot_number: string
          slot_type: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          assigned_unit_id?: string | null
          building_id?: string | null
          created_at?: string
          floor_level?: number | null
          id?: string
          is_reserved?: boolean | null
          monthly_fee?: number | null
          notes?: string | null
          organization_id?: string | null
          slot_number: string
          slot_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          assigned_unit_id?: string | null
          building_id?: string | null
          created_at?: string
          floor_level?: number | null
          id?: string
          is_reserved?: boolean | null
          monthly_fee?: number | null
          notes?: string | null
          organization_id?: string | null
          slot_number?: string
          slot_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parking_slots_assigned_unit_id_fkey"
            columns: ["assigned_unit_id"]
            isOneToOne: false
            referencedRelation: "society_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parking_slots_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parking_slots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_albums: {
        Row: {
          album_name: string
          cover_photo_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          event_id: string | null
          id: string
          is_public: boolean | null
          organization_id: string
          photos: Json | null
          updated_at: string
        }
        Insert: {
          album_name: string
          cover_photo_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_public?: boolean | null
          organization_id: string
          photos?: Json | null
          updated_at?: string
        }
        Update: {
          album_name?: string
          cover_photo_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string
          photos?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          option_order: number | null
          option_text: string
          poll_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_order?: number | null
          option_text: string
          poll_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_order?: number | null
          option_text?: string
          poll_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string | null
          poll_id: string | null
          voter_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          poll_id?: string | null
          voter_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          poll_id?: string | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_registrations: {
        Row: {
          approved_by: string | null
          company: string | null
          created_at: string | null
          created_by: string | null
          duration_hours: number | null
          group_size: number | null
          host_id: string | null
          id: string
          location_id: string | null
          organization_id: string | null
          purpose: string
          scheduled_date: string
          scheduled_time: string | null
          special_requirements: string | null
          status: string | null
          updated_at: string | null
          visitor_details: Json | null
          visitor_email: string | null
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          approved_by?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_hours?: number | null
          group_size?: number | null
          host_id?: string | null
          id?: string
          location_id?: string | null
          organization_id?: string | null
          purpose: string
          scheduled_date: string
          scheduled_time?: string | null
          special_requirements?: string | null
          status?: string | null
          updated_at?: string | null
          visitor_details?: Json | null
          visitor_email?: string | null
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          approved_by?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_hours?: number | null
          group_size?: number | null
          host_id?: string | null
          id?: string
          location_id?: string | null
          organization_id?: string | null
          purpose?: string
          scheduled_date?: string
          scheduled_time?: string | null
          special_requirements?: string | null
          status?: string | null
          updated_at?: string | null
          visitor_details?: Json | null
          visitor_email?: string | null
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_registrations_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_registrations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_registrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      premise_types: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_login: string | null
          organization_id: string | null
          password_reset_expires: string | null
          password_reset_token: string | null
          permissions: string[] | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_login?: string | null
          organization_id?: string | null
          password_reset_expires?: string | null
          password_reset_token?: string | null
          permissions?: string[] | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          organization_id?: string | null
          password_reset_expires?: string | null
          password_reset_token?: string | null
          permissions?: string[] | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
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
      project_meetings: {
        Row: {
          action_items: Json | null
          agenda: string | null
          created_at: string
          created_by: string | null
          decisions: Json | null
          description: string | null
          id: string
          location: string | null
          meeting_date: string | null
          meeting_time: string | null
          meeting_type: string | null
          minutes: string | null
          organization_id: string
          participants: Json | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          action_items?: Json | null
          agenda?: string | null
          created_at?: string
          created_by?: string | null
          decisions?: Json | null
          description?: string | null
          id?: string
          location?: string | null
          meeting_date?: string | null
          meeting_time?: string | null
          meeting_type?: string | null
          minutes?: string | null
          organization_id: string
          participants?: Json | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          action_items?: Json | null
          agenda?: string | null
          created_at?: string
          created_by?: string | null
          decisions?: Json | null
          description?: string | null
          id?: string
          location?: string | null
          meeting_date?: string | null
          meeting_time?: string | null
          meeting_type?: string | null
          minutes?: string | null
          organization_id?: string
          participants?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_change_audit: {
        Row: {
          changed_at: string | null
          changed_by: string
          id: string
          new_role: Database["public"]["Enums"]["user_role"]
          old_role: Database["public"]["Enums"]["user_role"] | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          id?: string
          new_role: Database["public"]["Enums"]["user_role"]
          old_role?: Database["public"]["Enums"]["user_role"] | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          id?: string
          new_role?: Database["public"]["Enums"]["user_role"]
          old_role?: Database["public"]["Enums"]["user_role"] | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          actions_taken: string | null
          assigned_to: string | null
          created_at: string
          description: string
          evidence: Json | null
          id: string
          incident_date: string
          incident_number: string
          incident_type: string
          location: string | null
          organization_id: string
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string
          witnesses: Json | null
        }
        Insert: {
          actions_taken?: string | null
          assigned_to?: string | null
          created_at?: string
          description: string
          evidence?: Json | null
          id?: string
          incident_date: string
          incident_number: string
          incident_type: string
          location?: string | null
          organization_id: string
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string
          witnesses?: Json | null
        }
        Update: {
          actions_taken?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string
          evidence?: Json | null
          id?: string
          incident_date?: string
          incident_number?: string
          incident_type?: string
          location?: string | null
          organization_id?: string
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          witnesses?: Json | null
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          amount: number | null
          booking_date: string
          created_at: string
          customer_id: string | null
          id: string
          organization_id: string
          payment_status: string | null
          service_description: string | null
          service_provider_id: string | null
          service_type: string
          special_instructions: string | null
          status: string | null
          time_slot: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          booking_date: string
          created_at?: string
          customer_id?: string | null
          id?: string
          organization_id: string
          payment_status?: string | null
          service_description?: string | null
          service_provider_id?: string | null
          service_type: string
          special_instructions?: string | null
          status?: string | null
          time_slot?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          booking_date?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          organization_id?: string
          payment_status?: string | null
          service_description?: string | null
          service_provider_id?: string | null
          service_type?: string
          special_instructions?: string | null
          status?: string | null
          time_slot?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_types: {
        Row: {
          billing_model: string
          created_at: string | null
          default_rate: number | null
          description: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          service_category: string
          service_name: string
          unit_type: string
          updated_at: string | null
        }
        Insert: {
          billing_model?: string
          created_at?: string | null
          default_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          service_category: string
          service_name: string
          unit_type?: string
          updated_at?: string | null
        }
        Update: {
          billing_model?: string
          created_at?: string | null
          default_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          service_category?: string
          service_name?: string
          unit_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_network_posts: {
        Row: {
          attachments: Json | null
          author_id: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          organization_id: string
          post_type: string | null
          status: string | null
          title: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          organization_id: string
          post_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          organization_id?: string
          post_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      society_units: {
        Row: {
          area_sqft: number | null
          bathrooms: number | null
          bedrooms: number | null
          building_id: string | null
          created_at: string | null
          floor: number | null
          id: string
          is_occupied: boolean | null
          monthly_flat_rate: number | null
          monthly_maintenance: number | null
          monthly_rate_per_sqft: number | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          parking_slots: number | null
          status: string | null
          tenant_email: string | null
          tenant_name: string | null
          tenant_phone: string | null
          unit_number: string
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          building_id?: string | null
          created_at?: string | null
          floor?: number | null
          id?: string
          is_occupied?: boolean | null
          monthly_flat_rate?: number | null
          monthly_maintenance?: number | null
          monthly_rate_per_sqft?: number | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking_slots?: number | null
          status?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          unit_number: string
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          building_id?: string | null
          created_at?: string | null
          floor?: number | null
          id?: string
          is_occupied?: boolean | null
          monthly_flat_rate?: number | null
          monthly_maintenance?: number | null
          monthly_rate_per_sqft?: number | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking_slots?: number | null
          status?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          unit_number?: string
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "society_units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string | null
          employee_id: string | null
          full_name: string
          hire_date: string | null
          id: string
          organization_id: string | null
          phone: string | null
          position: string | null
          salary: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          employee_id?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          position?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          position?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          code: string | null
          country_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          country_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          country_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string | null
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
      utility_readings: {
        Row: {
          bill_number: string | null
          building_id: string | null
          consumption: number | null
          created_at: string
          created_by: string | null
          current_reading: number
          due_date: string | null
          id: string
          meter_number: string | null
          organization_id: string
          payment_status: string | null
          previous_reading: number | null
          rate_per_unit: number | null
          reading_date: string
          total_amount: number | null
          unit_id: string | null
          updated_at: string
          utility_type: string
        }
        Insert: {
          bill_number?: string | null
          building_id?: string | null
          consumption?: number | null
          created_at?: string
          created_by?: string | null
          current_reading: number
          due_date?: string | null
          id?: string
          meter_number?: string | null
          organization_id: string
          payment_status?: string | null
          previous_reading?: number | null
          rate_per_unit?: number | null
          reading_date: string
          total_amount?: number | null
          unit_id?: string | null
          updated_at?: string
          utility_type: string
        }
        Update: {
          bill_number?: string | null
          building_id?: string | null
          consumption?: number | null
          created_at?: string
          created_by?: string | null
          current_reading?: number
          due_date?: string | null
          id?: string
          meter_number?: string | null
          organization_id?: string
          payment_status?: string | null
          previous_reading?: number | null
          rate_per_unit?: number | null
          reading_date?: string
          total_amount?: number | null
          unit_id?: string | null
          updated_at?: string
          utility_type?: string
        }
        Relationships: []
      }
      vehicle_blacklist: {
        Row: {
          created_at: string | null
          id: string
          incident_date: string | null
          is_active: boolean | null
          license_plate: string
          organization_id: string | null
          reason: string
          reported_by: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          incident_date?: string | null
          is_active?: boolean | null
          license_plate: string
          organization_id?: string | null
          reason: string
          reported_by?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          incident_date?: string | null
          is_active?: boolean | null
          license_plate?: string
          organization_id?: string | null
          reason?: string
          reported_by?: string | null
          updated_at?: string | null
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
          id: string
          is_active: boolean | null
          license_plate: string
          organization_id: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate: string
          organization_id?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate?: string
          organization_id?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
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
      vendor_contracts: {
        Row: {
          contract_end_date: string | null
          contract_start_date: string
          contract_type: string
          contract_value: number | null
          created_at: string
          created_by: string | null
          documents: Json | null
          id: string
          organization_id: string
          payment_terms: string | null
          performance_rating: number | null
          renewal_notice_period: number | null
          service_description: string | null
          status: string | null
          updated_at: string
          vendor_contact_person: string | null
          vendor_email: string | null
          vendor_name: string
          vendor_phone: string | null
        }
        Insert: {
          contract_end_date?: string | null
          contract_start_date: string
          contract_type: string
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          documents?: Json | null
          id?: string
          organization_id: string
          payment_terms?: string | null
          performance_rating?: number | null
          renewal_notice_period?: number | null
          service_description?: string | null
          status?: string | null
          updated_at?: string
          vendor_contact_person?: string | null
          vendor_email?: string | null
          vendor_name: string
          vendor_phone?: string | null
        }
        Update: {
          contract_end_date?: string | null
          contract_start_date?: string
          contract_type?: string
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          documents?: Json | null
          id?: string
          organization_id?: string
          payment_terms?: string | null
          performance_rating?: number | null
          renewal_notice_period?: number | null
          service_description?: string | null
          status?: string | null
          updated_at?: string
          vendor_contact_person?: string | null
          vendor_email?: string | null
          vendor_name?: string
          vendor_phone?: string | null
        }
        Relationships: []
      }
      visitor_invitations: {
        Row: {
          created_at: string
          current_uses: number | null
          guest_code: string
          host_id: string
          id: string
          is_recurring: boolean | null
          max_uses: number | null
          organization_id: string
          purpose: string | null
          qr_code_data: string | null
          status: string | null
          updated_at: string
          vehicle_number: string | null
          visit_date: string
          visit_time_from: string | null
          visit_time_to: string | null
          visitor_email: string | null
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          current_uses?: number | null
          guest_code: string
          host_id: string
          id?: string
          is_recurring?: boolean | null
          max_uses?: number | null
          organization_id: string
          purpose?: string | null
          qr_code_data?: string | null
          status?: string | null
          updated_at?: string
          vehicle_number?: string | null
          visit_date: string
          visit_time_from?: string | null
          visit_time_to?: string | null
          visitor_email?: string | null
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          current_uses?: number | null
          guest_code?: string
          host_id?: string
          id?: string
          is_recurring?: boolean | null
          max_uses?: number | null
          organization_id?: string
          purpose?: string | null
          qr_code_data?: string | null
          status?: string | null
          updated_at?: string
          vehicle_number?: string | null
          visit_date?: string
          visit_time_from?: string | null
          visit_time_to?: string | null
          visitor_email?: string | null
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          company: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          host_id: string | null
          id: string
          last_name: string | null
          last_visit_date: string | null
          organization_id: string | null
          phone: string | null
          purpose: string
          security_status: string | null
          status: string | null
          updated_at: string | null
          visit_count: number | null
          visitor_email: string | null
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          host_id?: string | null
          id?: string
          last_name?: string | null
          last_visit_date?: string | null
          organization_id?: string | null
          phone?: string | null
          purpose: string
          security_status?: string | null
          status?: string | null
          updated_at?: string | null
          visit_count?: number | null
          visitor_email?: string | null
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          host_id?: string | null
          id?: string
          last_name?: string | null
          last_visit_date?: string | null
          organization_id?: string | null
          phone?: string | null
          purpose?: string
          security_status?: string | null
          status?: string | null
          updated_at?: string | null
          visit_count?: number | null
          visitor_email?: string | null
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitors_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          expected_checkout_time: string | null
          host_id: string | null
          id: string
          location_id: string | null
          organization_id: string | null
          purpose: string
          status: string | null
          updated_at: string | null
          visitor_id: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          expected_checkout_time?: string | null
          host_id?: string | null
          id?: string
          location_id?: string | null
          organization_id?: string | null
          purpose: string
          status?: string | null
          updated_at?: string | null
          visitor_id?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          expected_checkout_time?: string | null
          host_id?: string | null
          id?: string
          location_id?: string | null
          organization_id?: string | null
          purpose?: string
          status?: string | null
          updated_at?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_visitor_id_fkey"
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
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "low" | "medium" | "high" | "critical"
      alert_type: "system" | "security" | "maintenance" | "detection"
      badge_template_type: "visitor" | "emergency" | "vip" | "contractor"
      building_type: "office" | "residential" | "commercial" | "industrial"
      gate_type: "main" | "visitor" | "service" | "emergency"
      organization_type: "platform" | "franchise" | "customer"
      subscription_plan: "basic" | "premium" | "enterprise"
      user_role:
        | "platform_admin"
        | "franchise_admin"
        | "customer_admin"
        | "operator"
        | "resident"
      user_status: "active" | "inactive" | "suspended"
      vehicle_type: "car" | "motorcycle" | "truck" | "van" | "bus"
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
    Enums: {
      alert_severity: ["low", "medium", "high", "critical"],
      alert_type: ["system", "security", "maintenance", "detection"],
      badge_template_type: ["visitor", "emergency", "vip", "contractor"],
      building_type: ["office", "residential", "commercial", "industrial"],
      gate_type: ["main", "visitor", "service", "emergency"],
      organization_type: ["platform", "franchise", "customer"],
      subscription_plan: ["basic", "premium", "enterprise"],
      user_role: [
        "platform_admin",
        "franchise_admin",
        "customer_admin",
        "operator",
        "resident",
      ],
      user_status: ["active", "inactive", "suspended"],
      vehicle_type: ["car", "motorcycle", "truck", "van", "bus"],
    },
  },
} as const
