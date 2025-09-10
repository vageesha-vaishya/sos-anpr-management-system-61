import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Permission, UserRole, ROLE_PERMISSIONS } from "@/hooks/usePermissions"
import { User, Search, Shield, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface UserWithPermissions {
  id: string
  email: string
  full_name: string
  role: UserRole
  permissions: string[]
  organization_name?: string
}

export const UserPermissionEditor: React.FC = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserWithPermissions[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const allPermissions: Permission[] = [
    'view_dashboard', 'manage_users', 'manage_organizations', 'manage_locations',
    'manage_cameras', 'manage_vehicles', 'manage_alerts', 'manage_settings',
    'view_analytics', 'manage_billing', 'manage_residents', 'manage_visitors',
    'manage_amenities', 'manage_events', 'manage_documents', 'manage_staff',
    'manage_finances', 'view_reports', 'system_admin'
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, role, permissions,
          organizations(name)
        `)
        .order('full_name')

      if (error) throw error

      setUsers(data?.map(user => ({
        ...user,
        permissions: user.permissions || [],
        organization_name: user.organizations?.name
      })) || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      })
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUserSelect = (user: UserWithPermissions) => {
    setSelectedUser(user)
  }

  const handlePermissionToggle = (permission: Permission, checked: boolean) => {
    if (!selectedUser) return

    const updatedPermissions = checked
      ? [...selectedUser.permissions, permission]
      : selectedUser.permissions.filter(p => p !== permission)

    setSelectedUser({
      ...selectedUser,
      permissions: updatedPermissions
    })
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ permissions: selectedUser.permissions })
        .eq('id', selectedUser.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'User permissions updated successfully',
      })

      fetchUsers()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  const getEffectivePermissions = (user: UserWithPermissions): Permission[] => {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || []
    const userPermissions = user.permissions.filter(p => p !== '*') as Permission[]
    
    if (rolePermissions.includes('*') || user.permissions.includes('*')) {
      return allPermissions
    }

    return [...new Set([...rolePermissions, ...userPermissions])]
  }

  const getPermissionSource = (user: UserWithPermissions, permission: Permission): 'role' | 'user' | 'admin' => {
    if (user.permissions.includes('*')) return 'admin'
    if (user.permissions.includes(permission)) return 'user'
    return 'role'
  }

  const getPermissionName = (permission: Permission) => {
    return permission.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Select User
          </CardTitle>
          <CardDescription>
            Choose a user to manage their individual permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                    selectedUser?.id === user.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {user.role.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                        {user.permissions.includes('*') && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Super Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            User Permissions
            {selectedUser && (
              <Badge variant="outline" className="ml-auto">
                {selectedUser.full_name}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {selectedUser 
              ? 'Manage individual permissions for this user'
              : 'Select a user to edit their permissions'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedUser ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedUser.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedUser.full_name}</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.organization_name}</div>
                  </div>
                </div>
              </div>

              {/* Permissions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Permissions</h4>
                  <Button onClick={handleSavePermissions} disabled={loading} size="sm">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {allPermissions.map(permission => {
                    const effectivePermissions = getEffectivePermissions(selectedUser)
                    const hasPermission = effectivePermissions.includes(permission)
                    const source = getPermissionSource(selectedUser, permission)
                    const isUserOverride = selectedUser.permissions.includes(permission)

                    return (
                      <div key={permission} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isUserOverride}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(permission, checked as boolean)
                            }
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {getPermissionName(permission)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {hasPermission ? (
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {source === 'role' ? 'From role' : 
                                   source === 'user' ? 'User override' : 'Admin access'}
                                </span>
                              ) : (
                                'Not granted'
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {hasPermission && (
                            <Badge 
                              variant={source === 'user' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {source === 'role' ? 'Role' : 
                               source === 'user' ? 'User' : 'Admin'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a user from the list to edit their permissions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}