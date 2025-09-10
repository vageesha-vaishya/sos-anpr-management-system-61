import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions, Permission, UserRole } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, ArrowLeft } from 'lucide-react'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  minimumRole?: UserRole
  requireAll?: boolean
  fallbackPath?: string
  showAccessDenied?: boolean
}

const AccessDeniedPage: React.FC<{ fallbackPath?: string }> = ({ fallbackPath = '/dashboard' }) => {
  const { userProfile } = useAuth()
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Current Role: <span className="font-medium">{userProfile?.role || 'Unknown'}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Path: {location.pathname}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.history.go(-1)} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => window.location.href = fallbackPath} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  permission,
  permissions,
  minimumRole,
  requireAll = false,
  fallbackPath = '/dashboard',
  showAccessDenied = true
}) => {
  const { user, loading, userProfile } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasMinimumRole } = usePermissions()
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  // Redirect to dashboard if no profile
  if (!userProfile) {
    return <Navigate to="/dashboard" replace />
  }
  
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
  
  // Show access denied page or redirect
  if (showAccessDenied) {
    return <AccessDeniedPage fallbackPath={fallbackPath} />
  }
  
  return <Navigate to={fallbackPath} replace />
}