import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_organizations'
  | 'manage_locations'
  | 'manage_cameras'
  | 'manage_vehicles'
  | 'manage_alerts'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_billing'
  | 'manage_residents'
  | 'manage_visitors'
  | 'manage_amenities'
  | 'manage_events'
  | 'manage_documents'
  | 'manage_staff'
  | 'manage_finances'
  | 'view_reports'
  | 'system_admin'
  | '*'

export type UserRole = 
  | 'platform_admin'
  | 'franchise_admin'
  | 'customer_admin'
  | 'society_president'
  | 'society_secretary'
  | 'society_treasurer'
  | 'society_committee_member'
  | 'treasurer'
  | 'property_manager'
  | 'security_staff'
  | 'maintenance_staff'
  | 'committee_member'
  | 'operator'
  | 'resident'
  | 'tenant'
  | 'owner'
  | 'family_member'

// Define role hierarchy levels
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'platform_admin': 100,
  'franchise_admin': 90,
  'customer_admin': 80,
  'society_president': 70,
  'society_secretary': 65,
  'society_treasurer': 65,
  'treasurer': 60,
  'property_manager': 55,
  'society_committee_member': 50,
  'committee_member': 50,
  'security_staff': 40,
  'maintenance_staff': 40,
  'operator': 30,
  'owner': 25,
  'resident': 20,
  'tenant': 15,
  'family_member': 10,
}

// Define default permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'platform_admin': ['*'],
  'franchise_admin': [
    'view_dashboard', 'manage_organizations', 'manage_users', 'manage_locations',
    'manage_cameras', 'manage_vehicles', 'manage_alerts', 'manage_settings',
    'view_analytics', 'manage_billing', 'view_reports', 'manage_residents',
    'manage_visitors', 'manage_amenities', 'manage_events', 'manage_documents',
    'manage_staff'
  ],
  'customer_admin': [
    'view_dashboard', 'manage_users', 'manage_locations', 'manage_cameras',
    'manage_vehicles', 'manage_alerts', 'manage_residents', 'manage_visitors',
    'manage_amenities', 'manage_events', 'manage_documents', 'manage_staff',
    'view_analytics', 'view_reports'
  ],
  'society_president': [
    'view_dashboard', 'manage_users', 'manage_residents', 'manage_visitors',
    'manage_amenities', 'manage_events', 'manage_documents', 'manage_finances',
    'view_analytics', 'view_reports'
  ],
  'society_secretary': [
    'view_dashboard', 'manage_residents', 'manage_visitors', 'manage_amenities',
    'manage_events', 'manage_documents', 'view_reports'
  ],
  'society_treasurer': [
    'view_dashboard', 'manage_finances', 'manage_billing', 'view_analytics', 'view_reports'
  ],
  'treasurer': [
    'view_dashboard', 'manage_finances', 'manage_billing', 'view_analytics', 'view_reports'
  ],
  'property_manager': [
    'view_dashboard', 'manage_residents', 'manage_visitors', 'manage_amenities',
    'manage_staff', 'view_reports'
  ],
  'society_committee_member': [
    'view_dashboard', 'manage_residents', 'manage_visitors', 'manage_amenities', 'view_reports'
  ],
  'committee_member': [
    'view_dashboard', 'manage_residents', 'manage_visitors', 'manage_amenities', 'view_reports'
  ],
  'security_staff': [
    'view_dashboard', 'manage_visitors', 'manage_vehicles', 'view_reports'
  ],
  'maintenance_staff': [
    'view_dashboard', 'manage_amenities', 'view_reports'
  ],
  'operator': [
    'view_dashboard', 'manage_visitors', 'view_reports'
  ],
  'owner': [
    'view_dashboard', 'manage_visitors'
  ],
  'resident': [
    'view_dashboard'
  ],
  'tenant': [
    'view_dashboard'
  ],
  'family_member': [
    'view_dashboard'
  ],
}

export function hasPermission(
  userRole: UserRole | null,
  userPermissions: string[] | null,
  requiredPermission: Permission
): boolean {
  if (!userRole) return false

  // Check for wildcard permission
  if (userPermissions?.includes('*')) return true

  // Check explicit permissions
  if (userPermissions?.includes(requiredPermission)) return true

  // Check role-based default permissions
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  
  // Check for wildcard in role permissions
  if (rolePermissions.includes('*')) return true
  
  // Check specific permission
  return rolePermissions.includes(requiredPermission)
}

export function hasMinimumRole(userRole: UserRole | null, minimumRole: UserRole): boolean {
  if (!userRole) return false
  
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0
  
  return userLevel >= requiredLevel
}

export function usePermissions() {
  const { userProfile } = useAuth()
  
  const permissions = useMemo(() => {
    const role = userProfile?.role as UserRole | null
    const userPermissions = userProfile?.permissions || []
    
    return {
      hasPermission: (permission: Permission) => 
        hasPermission(role, userPermissions, permission),
      hasMinimumRole: (minimumRole: UserRole) => 
        hasMinimumRole(role, minimumRole),
      hasAnyPermission: (permissions: Permission[]) => 
        permissions.some(permission => hasPermission(role, userPermissions, permission)),
      hasAllPermissions: (permissions: Permission[]) => 
        permissions.every(permission => hasPermission(role, userPermissions, permission)),
      role,
      userPermissions,
      isAdmin: hasMinimumRole(role, 'customer_admin'),
      isPlatformAdmin: role === 'platform_admin',
      isFranchiseAdmin: role === 'franchise_admin',
      isCustomerAdmin: role === 'customer_admin',
      isSocietyAdmin: role ? ['society_president', 'society_secretary', 'society_treasurer'].includes(role) : false,
      canManageUsers: hasPermission(role, userPermissions, 'manage_users'),
      canViewAnalytics: hasPermission(role, userPermissions, 'view_analytics'),
      canManageFinances: hasPermission(role, userPermissions, 'manage_finances'),
    }
  }, [userProfile])
  
  return permissions
}