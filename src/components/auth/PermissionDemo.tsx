import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionWrapper } from '@/components/auth/PermissionWrapper'
import { useRoleCheck, useIsAdmin, useCanManageUsers } from '@/hooks/useRoleCheck'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, DollarSign, Settings, TrendingUp } from 'lucide-react'

export const PermissionDemo: React.FC = () => {
  const { 
    hasPermission, 
    hasMinimumRole, 
    role, 
    isAdmin, 
    isPlatformAdmin,
    canManageUsers,
    canViewAnalytics,
    canManageFinances
  } = usePermissions()
  
  const { hasAccess: canManageSettings } = useRoleCheck({ 
    permission: 'manage_settings' 
  })
  
  const { hasAccess: isAdminRole } = useIsAdmin()
  const { hasAccess: canManageUsersHook } = useCanManageUsers()
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permission System Demo
          </CardTitle>
          <CardDescription>
            Demonstration of the role-based permission system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Current Role</h4>
              <Badge variant="outline">{role || 'None'}</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Admin Status</h4>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? 'Admin' : 'Non-Admin'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Permission Checks</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Can manage users:</span>
                <Badge variant={canManageUsers ? "default" : "secondary"}>
                  {canManageUsers ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Can view analytics:</span>
                <Badge variant={canViewAnalytics ? "default" : "secondary"}>
                  {canViewAnalytics ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Can manage finances:</span>
                <Badge variant={canManageFinances ? "default" : "secondary"}>
                  {canManageFinances ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Is Platform Admin:</span>
                <Badge variant={isPlatformAdmin ? "default" : "secondary"}>
                  {isPlatformAdmin ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Conditional UI Components</CardTitle>
          <CardDescription>
            Components that appear based on permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PermissionWrapper permission="manage_users">
            <Button className="w-full" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              User Management (Visible if can manage users)
            </Button>
          </PermissionWrapper>
          
          <PermissionWrapper permission="view_analytics">
            <Button className="w-full" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics Dashboard (Visible if can view analytics)
            </Button>
          </PermissionWrapper>
          
          <PermissionWrapper permission="manage_finances">
            <Button className="w-full" variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Management (Visible if can manage finances)
            </Button>
          </PermissionWrapper>
          
          <PermissionWrapper minimumRole="customer_admin">
            <Button className="w-full" variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Admin Settings (Visible for Customer Admin+)
            </Button>
          </PermissionWrapper>
          
          <PermissionWrapper 
            permissions={['manage_users', 'manage_finances']}
            requireAll={false}
          >
            <Button className="w-full" variant="outline">
              Multi-permission Button (Either permission works)
            </Button>
          </PermissionWrapper>
          
          <PermissionWrapper 
            permissions={['manage_users', 'view_analytics']}
            requireAll={true}
          >
            <Button className="w-full" variant="outline">
              Strict Permission Button (Both permissions required)
            </Button>
          </PermissionWrapper>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fallback Content</CardTitle>
          <CardDescription>
            Examples with fallback content for unauthorized users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PermissionWrapper 
            permission="system_admin"
            showFallback={true}
            fallback={
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  You need System Admin privileges to access this feature
                </p>
              </div>
            }
          >
            <Button className="w-full" variant="destructive">
              System Admin Only Feature
            </Button>
          </PermissionWrapper>
        </CardContent>
      </Card>
    </div>
  )
}