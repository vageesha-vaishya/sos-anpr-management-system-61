import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ROLE_PERMISSIONS, ROLE_HIERARCHY, UserRole, Permission } from "@/hooks/usePermissions"
import { Shield, Save, RotateCcw, AlertTriangle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

export const PermissionMatrixEditor: React.FC = () => {
  const { toast } = useToast()
  const [permissions, setPermissions] = useState<Record<UserRole, Permission[]>>(ROLE_PERMISSIONS)
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(false)

  const allPermissions: Permission[] = [
    'view_dashboard', 'manage_users', 'manage_organizations', 'manage_locations',
    'manage_cameras', 'manage_vehicles', 'manage_alerts', 'manage_settings',
    'view_analytics', 'manage_billing', 'manage_residents', 'manage_visitors',
    'manage_amenities', 'manage_events', 'manage_documents', 'manage_staff',
    'manage_finances', 'view_reports', 'system_admin'
  ]

  const roleHierarchy = Object.entries(ROLE_HIERARCHY)
    .sort(([,a], [,b]) => b - a)
    .map(([role]) => role as UserRole)

  const handlePermissionChange = (role: UserRole, permission: Permission, checked: boolean) => {
    setPermissions(prev => {
      const newPermissions = { ...prev }
      if (checked) {
        newPermissions[role] = [...(newPermissions[role] || []), permission]
      } else {
        newPermissions[role] = (newPermissions[role] || []).filter(p => p !== permission)
      }
      return newPermissions
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save to database - you would implement this based on your schema
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast({
        title: 'Success',
        description: 'Permission matrix updated successfully',
      })
      setHasChanges(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save permission matrix',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  const handleReset = () => {
    setPermissions(ROLE_PERMISSIONS)
    setHasChanges(false)
  }

  const getPermissionName = (permission: Permission) => {
    return permission.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getRoleLevel = (role: UserRole) => ROLE_HIERARCHY[role] || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Permission Matrix Editor
        </CardTitle>
        <CardDescription>
          Configure permissions for each role. Higher roles inherit permissions from lower roles.
        </CardDescription>
        {hasChanges && (
          <Badge variant="secondary" className="w-fit">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unsaved Changes
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={handleSave} disabled={!hasChanges || loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Permission</th>
                  {roleHierarchy.map(role => (
                    <th key={role} className="text-center p-2 min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium">
                          {role.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Level {getRoleLevel(role)}
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions.map(permission => (
                  <tr key={permission} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">
                      {getPermissionName(permission)}
                    </td>
                    {roleHierarchy.map(role => {
                      const hasPermission = permissions[role]?.includes(permission) || 
                                          permissions[role]?.includes('*')
                      const isInherited = !permissions[role]?.includes(permission) && 
                                        permissions[role]?.includes('*')
                      
                      return (
                        <td key={`${role}-${permission}`} className="text-center p-2">
                          <Checkbox
                            checked={hasPermission}
                            disabled={isInherited}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(role, permission, checked as boolean)
                            }
                          />
                          {isInherited && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Inherited (*)
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Permission Inheritance Rules</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Platform Admin has all permissions (*)</li>
              <li>• Higher role levels can be granted additional permissions</li>
              <li>• Individual users can have permission overrides</li>
              <li>• Permission conflicts are resolved by the highest level</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}