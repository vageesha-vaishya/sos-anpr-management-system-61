import { useMemo } from 'react'
import { usePermissions, Permission, UserRole } from '@/hooks/usePermissions'

interface RoleCheckConfig {
  permission?: Permission
  permissions?: Permission[]
  minimumRole?: UserRole
  requireAll?: boolean
  roles?: UserRole[]
}

export function useRoleCheck(config: RoleCheckConfig) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasMinimumRole, role } = usePermissions()
  
  const result = useMemo(() => {
    let hasAccess = true
    
    // Check single permission
    if (config.permission) {
      hasAccess = hasPermission(config.permission)
    }
    
    // Check multiple permissions
    if (config.permissions && config.permissions.length > 0) {
      hasAccess = config.requireAll 
        ? hasAllPermissions(config.permissions)
        : hasAnyPermission(config.permissions)
    }
    
    // Check minimum role
    if (config.minimumRole && hasAccess) {
      hasAccess = hasMinimumRole(config.minimumRole)
    }
    
    // Check specific roles
    if (config.roles && config.roles.length > 0 && hasAccess) {
      hasAccess = role ? config.roles.includes(role) : false
    }
    
    return {
      hasAccess,
      currentRole: role,
      canAccess: hasAccess
    }
  }, [config, hasPermission, hasAnyPermission, hasAllPermissions, hasMinimumRole, role])
  
  return result
}

// Convenience hooks for common role checks
export function useIsAdmin() {
  return useRoleCheck({ minimumRole: 'customer_admin' })
}

export function useIsPlatformAdmin() {
  return useRoleCheck({ roles: ['platform_admin'] })
}

export function useIsFranchiseAdmin() {
  return useRoleCheck({ roles: ['franchise_admin'] })
}

export function useIsCustomerAdmin() {
  return useRoleCheck({ roles: ['customer_admin'] })
}

export function useIsSocietyAdmin() {
  return useRoleCheck({ 
    roles: ['society_president', 'society_secretary', 'society_treasurer'] 
  })
}

export function useCanManageUsers() {
  return useRoleCheck({ permission: 'manage_users' })
}

export function useCanViewAnalytics() {
  return useRoleCheck({ permission: 'view_analytics' })
}

export function useCanManageFinances() {
  return useRoleCheck({ permission: 'manage_finances' })
}