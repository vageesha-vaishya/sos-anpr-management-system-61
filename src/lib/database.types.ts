export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          type: 'platform' | 'franchise' | 'customer'
          parent_id: string | null
          subscription_plan: string
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'platform' | 'franchise' | 'customer'
          parent_id?: string | null
          subscription_plan: string
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'platform' | 'franchise' | 'customer'
          parent_id?: string | null
          subscription_plan?: string
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      continents: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
        }
      }
      countries: {
        Row: {
          id: string
          continent_id: string
          name: string
          code: string
          plate_format: string
          created_at: string
        }
        Insert: {
          id?: string
          continent_id: string
          name: string
          code: string
          plate_format: string
          created_at?: string
        }
        Update: {
          id?: string
          continent_id?: string
          name?: string
          code?: string
          plate_format?: string
          created_at?: string
        }
      }
      states: {
        Row: {
          id: string
          country_id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          country_id: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          country_id?: string
          name?: string
          code?: string
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          state_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          state_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          state_id?: string
          name?: string
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          city_id: string
          organization_id: string
          name: string
          address: string
          coordinates: string | null
          created_at: string
        }
        Insert: {
          id?: string
          city_id: string
          organization_id: string
          name: string
          address: string
          coordinates?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          organization_id?: string
          name?: string
          address?: string
          coordinates?: string | null
          created_at?: string
        }
      }
      buildings: {
        Row: {
          id: string
          location_id: string
          name: string
          type: 'residential' | 'commercial' | 'industrial'
          floors: number
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          name: string
          type: 'residential' | 'commercial' | 'industrial'
          floors: number
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          name?: string
          type?: 'residential' | 'commercial' | 'industrial'
          floors?: number
          created_at?: string
        }
      }
      entry_gates: {
        Row: {
          id: string
          building_id: string
          name: string
          type: 'main' | 'visitor' | 'service' | 'emergency'
          status: 'active' | 'inactive' | 'maintenance'
          created_at: string
        }
        Insert: {
          id?: string
          building_id: string
          name: string
          type: 'main' | 'visitor' | 'service' | 'emergency'
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          name?: string
          type?: 'main' | 'visitor' | 'service' | 'emergency'
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
        }
      }
      cameras: {
        Row: {
          id: string
          entry_gate_id: string
          name: string
          ip_address: string
          rtsp_url: string
          status: 'online' | 'offline' | 'error'
          model: string
          resolution: string
          fps: number
          yolo_config: any
          created_at: string
          last_ping: string | null
        }
        Insert: {
          id?: string
          entry_gate_id: string
          name: string
          ip_address: string
          rtsp_url: string
          status?: 'online' | 'offline' | 'error'
          model: string
          resolution: string
          fps: number
          yolo_config?: any
          created_at?: string
          last_ping?: string | null
        }
        Update: {
          id?: string
          entry_gate_id?: string
          name?: string
          ip_address?: string
          rtsp_url?: string
          status?: 'online' | 'offline' | 'error'
          model?: string
          resolution?: string
          fps?: number
          yolo_config?: any
          created_at?: string
          last_ping?: string | null
        }
      }
      users: {
        Row: {
          id: string
          auth_user_id: string
          organization_id: string
          email: string
          full_name: string
          role: 'platform_admin' | 'franchise_admin' | 'franchise_user' | 'customer_admin' | 'customer_user'
          permissions: string[]
          status: 'active' | 'inactive' | 'pending'
          last_login: string | null
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          organization_id: string
          email: string
          full_name: string
          role: 'platform_admin' | 'franchise_admin' | 'franchise_user' | 'customer_admin' | 'customer_user'
          permissions?: string[]
          status?: 'active' | 'inactive' | 'pending'
          last_login?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          organization_id?: string
          email?: string
          full_name?: string
          role?: 'platform_admin' | 'franchise_admin' | 'franchise_user' | 'customer_admin' | 'customer_user'
          permissions?: string[]
          status?: 'active' | 'inactive' | 'pending'
          last_login?: string | null
          created_at?: string
        }
      }
      anpr_detections: {
        Row: {
          id: string
          camera_id: string
          license_plate: string
          confidence: number
          vehicle_type: string
          color: string | null
          timestamp: string
          image_url: string
          bounding_box: any
          processing_time: number
          created_at: string
        }
        Insert: {
          id?: string
          camera_id: string
          license_plate: string
          confidence: number
          vehicle_type: string
          color?: string | null
          timestamp: string
          image_url: string
          bounding_box: any
          processing_time: number
          created_at?: string
        }
        Update: {
          id?: string
          camera_id?: string
          license_plate?: string
          confidence?: number
          vehicle_type?: string
          color?: string | null
          timestamp?: string
          image_url?: string
          bounding_box?: any
          processing_time?: number
          created_at?: string
        }
      }
      vehicle_whitelist: {
        Row: {
          id: string
          organization_id: string
          license_plate: string
          owner_name: string
          owner_contact: string | null
          vehicle_type: string
          notes: string | null
          expires_at: string | null
          status: 'active' | 'expired' | 'blocked'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          license_plate: string
          owner_name: string
          owner_contact?: string | null
          vehicle_type: string
          notes?: string | null
          expires_at?: string | null
          status?: 'active' | 'expired' | 'blocked'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          license_plate?: string
          owner_name?: string
          owner_contact?: string | null
          vehicle_type?: string
          notes?: string | null
          expires_at?: string | null
          status?: 'active' | 'expired' | 'blocked'
          created_at?: string
        }
      }
      vehicle_blacklist: {
        Row: {
          id: string
          organization_id: string
          license_plate: string
          reason: string
          reported_by: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          notes: string | null
          status: 'active' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          license_plate: string
          reason: string
          reported_by: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          notes?: string | null
          status?: 'active' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          license_plate?: string
          reason?: string
          reported_by?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          notes?: string | null
          status?: 'active' | 'resolved'
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          organization_id: string
          camera_id: string | null
          type: 'blacklist_detected' | 'unknown_vehicle' | 'camera_offline' | 'system_error'
          title: string
          message: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'unread' | 'read' | 'resolved'
          metadata: any
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          camera_id?: string | null
          type: 'blacklist_detected' | 'unknown_vehicle' | 'camera_offline' | 'system_error'
          title: string
          message: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'unread' | 'read' | 'resolved'
          metadata?: any
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          camera_id?: string | null
          type?: 'blacklist_detected' | 'unknown_vehicle' | 'camera_offline' | 'system_error'
          title?: string
          message?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'unread' | 'read' | 'resolved'
          metadata?: any
          created_at?: string
          resolved_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}