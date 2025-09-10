import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Permission, UserRole, hasPermission, hasMinimumRole, ROLE_PERMISSIONS } from '@/hooks/usePermissions'

interface PermissionContextType {
  hasPermission: (permission: Permission) => boolean
  hasMinimumRole: (minimumRole: UserRole) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canAccess: (config: AccessConfig) => boolean
  getUserPermissions: () => Permission[]
  getEffectivePermissions: () => Permission[]
  role: UserRole | null
  isLoading: boolean
}

interface AccessConfig {
  permission?: Permission
  permissions?: Permission[]
  minimumRole?: UserRole
  requireAll?: boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export const usePermissionContext = () => {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider')
  }
  return context
}

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useAuth()
  
  const role = useMemo(() => userProfile?.role as UserRole | null, [userProfile?.role])
  const userPermissions = useMemo(() => userProfile?.permissions || [], [userProfile?.permissions])
  
  const checkPermission = useCallback((permission: Permission): boolean => {
    return hasPermission(role, userPermissions, permission)
  }, [role, userPermissions])
  
  const checkMinimumRole = useCallback((minimumRole: UserRole): boolean => {
    return hasMinimumRole(role, minimumRole)
  }, [role])
  
  const checkAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => checkPermission(permission))
  }, [checkPermission])
  
  const checkAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(permission => checkPermission(permission))
  }, [checkPermission])
  
  const canAccess = useCallback((config: AccessConfig): boolean => {
    let hasAccess = true
    
    if (config.permission) {
      hasAccess = checkPermission(config.permission)
    }
    
    if (config.permissions && config.permissions.length > 0) {
      hasAccess = config.requireAll 
        ? checkAllPermissions(config.permissions)
        : checkAnyPermission(config.permissions)
    }
    
    if (config.minimumRole && hasAccess) {
      hasAccess = checkMinimumRole(config.minimumRole)
    }
    
    return hasAccess
  }, [checkPermission, checkAllPermissions, checkAnyPermission, checkMinimumRole])
  
  const getUserPermissions = useCallback((): Permission[] => {
    return userPermissions as Permission[]
  }, [userPermissions])
  
  const getEffectivePermissions = useCallback((): Permission[] => {
    if (!role) return []
    
    const rolePermissions = ROLE_PERMISSIONS[role] || []
    const explicitPermissions = userPermissions as Permission[]
    
    // If user has wildcard permission, return all permissions
    if (explicitPermissions.includes('*') || rolePermissions.includes('*')) {
      return ['*']
    }
    
    // Combine role permissions and explicit permissions
    const allPermissions = [...new Set([...rolePermissions, ...explicitPermissions])]
    return allPermissions
  }, [role, userPermissions])
  
  const value = useMemo(() => ({
    hasPermission: checkPermission,
    hasMinimumRole: checkMinimumRole,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canAccess,
    getUserPermissions,
    getEffectivePermissions,
    role,
    isLoading: loading
  }), [
    checkPermission,
    checkMinimumRole,
    checkAnyPermission,
    checkAllPermissions,
    canAccess,
    getUserPermissions,
    getEffectivePermissions,
    role,
    loading
  ])
  
  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}