import React from 'react'
import { usePermissions, Permission, UserRole } from '@/hooks/usePermissions'

interface PermissionWrapperProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  minimumRole?: UserRole
  requireAll?: boolean
  fallback?: React.ReactNode
  showFallback?: boolean
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  permissions,
  minimumRole,
  requireAll = false,
  fallback = null,
  showFallback = false
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasMinimumRole } = usePermissions()
  
  let hasAccess = true
  
  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission)
  }
  
  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }
  
  // Check minimum role
  if (minimumRole && hasAccess) {
    hasAccess = hasMinimumRole(minimumRole)
  }
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  if (showFallback && fallback) {
    return <>{fallback}</>
  }
  
  return null
}