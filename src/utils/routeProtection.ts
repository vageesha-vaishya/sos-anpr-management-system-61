import { Permission, UserRole } from '@/hooks/usePermissions'

// Route protection configuration
export interface RouteConfig {
  path: string
  permission?: Permission
  permissions?: Permission[]
  minimumRole?: UserRole
  requireAll?: boolean
  fallbackPath?: string
}

// Define protected routes with their access requirements
export const PROTECTED_ROUTES: RouteConfig[] = [
  // Admin Routes
  { path: '/users', permission: 'manage_users' },
  { path: '/master-data-management', minimumRole: 'franchise_admin' },
  { path: '/franchises', permission: 'manage_organizations' },
  { path: '/admin-hub', minimumRole: 'franchise_admin' },
  
  // Analytics & Reports
  { path: '/analytics', permission: 'view_analytics' },
  
  // Financial Management
  { path: '/billing', permission: 'manage_billing' },
  { path: '/maintenance-billing', permission: 'manage_billing' },
  { path: '/financial-hub', permission: 'manage_finances' },
  { path: '/general-ledger', permission: 'manage_finances' },
  { path: '/income-tracker', permission: 'manage_finances' },
  { path: '/expense-tracker', permission: 'manage_finances' },
  { path: '/bank-cash', permission: 'manage_finances' },
  { path: '/utility-tracker', permission: 'manage_finances' },
  
  // Society Management
  { path: '/society-member-management', minimumRole: 'customer_admin' },
  { path: '/staff-management', permission: 'manage_staff' },
  { path: '/residents', permission: 'manage_residents' },
  
  // Infrastructure Management
  { path: '/cameras', permission: 'manage_cameras' },
  { path: '/locations', permission: 'manage_locations' },
  { path: '/vehicles', permission: 'manage_vehicles' },
  
  // Operations
  { path: '/alerts', permission: 'manage_alerts' },
  { path: '/amenity-management', permission: 'manage_amenities' },
  { path: '/events', permission: 'manage_events' },
  { path: '/visitor-management', permission: 'manage_visitors' },
  { path: '/visitors', permission: 'manage_visitors' },
  { path: '/hosts', permission: 'manage_visitors' },
  { path: '/pre-registrations', permission: 'manage_visitors' },
  { path: '/visitor-checkin', permission: 'manage_visitors' },
  { path: '/visitor-dashboard', permission: 'manage_visitors' },
  
  // Documents & Settings
  { path: '/documents', permission: 'manage_documents' },
  { path: '/settings', permission: 'manage_settings' },
  
  // Minimum role requirements for admin sections
  { path: '/data-management', minimumRole: 'customer_admin' },
  { path: '/assets', minimumRole: 'customer_admin' },
  { path: '/parking', minimumRole: 'customer_admin' },
  { path: '/routine-management', minimumRole: 'customer_admin' },
  { path: '/gatekeeper', minimumRole: 'customer_admin' },
]

// Get route configuration by path
export function getRouteConfig(path: string): RouteConfig | undefined {
  return PROTECTED_ROUTES.find(route => route.path === path)
}

// Check if a route requires protection
export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => route.path === path)
}

// Get all routes that require a specific permission
export function getRoutesByPermission(permission: Permission): RouteConfig[] {
  return PROTECTED_ROUTES.filter(route => 
    route.permission === permission || 
    route.permissions?.includes(permission)
  )
}

// Get all routes accessible by a minimum role
export function getRoutesByMinimumRole(role: UserRole): RouteConfig[] {
  return PROTECTED_ROUTES.filter(route => route.minimumRole === role)
}