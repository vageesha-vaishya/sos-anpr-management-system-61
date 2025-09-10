import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { UserRole, ROLE_HIERARCHY } from "@/hooks/usePermissions"
import { Crown, Users, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  hierarchy_level: z.number().min(1).max(100),
  parent_role: z.string().optional(),
  color: z.string().optional(),
})

type RoleFormData = z.infer<typeof roleSchema>

interface CustomRole {
  id: string
  name: string
  description?: string
  hierarchy_level: number
  parent_role?: string
  color?: string
  is_system: boolean
  created_at: string
}

export const RoleManager: React.FC = () => {
  const { toast } = useToast()
  const [roles, setRoles] = useState<CustomRole[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null)

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      hierarchy_level: 10,
    }
  })

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    // Convert built-in roles to display format
    const systemRoles: CustomRole[] = Object.entries(ROLE_HIERARCHY).map(([name, level]) => ({
      id: name,
      name: name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      hierarchy_level: level,
      is_system: true,
      created_at: new Date().toISOString(),
    }))

    setRoles(systemRoles)
  }

  const handleCreateRole = async (data: RoleFormData) => {
    try {
      const newRole: CustomRole = {
        id: `custom_${data.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: data.name,
        description: data.description,
        hierarchy_level: data.hierarchy_level,
        parent_role: data.parent_role,
        color: data.color,
        is_system: false,
        created_at: new Date().toISOString(),
      }

      setRoles(prev => [...prev, newRole])
      
      toast({
        title: 'Success',
        description: 'Custom role created successfully',
      })
      
      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive',
      })
    }
  }

  const handleEditRole = (role: CustomRole) => {
    if (role.is_system) {
      toast({
        title: 'Cannot Edit System Role',
        description: 'System roles cannot be modified',
        variant: 'destructive',
      })
      return
    }
    
    setEditingRole(role)
    form.reset({
      name: role.name,
      description: role.description,
      hierarchy_level: role.hierarchy_level,
      parent_role: role.parent_role,
      color: role.color,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role || role.is_system) {
      toast({
        title: 'Cannot Delete',
        description: 'System roles cannot be deleted',
        variant: 'destructive',
      })
      return
    }

    setRoles(prev => prev.filter(r => r.id !== roleId))
    
    toast({
      title: 'Success',
      description: 'Role deleted successfully',
    })
  }

  const getRoleColor = (role: CustomRole) => {
    if (role.color) return role.color
    if (role.hierarchy_level >= 90) return 'bg-red-500'
    if (role.hierarchy_level >= 70) return 'bg-orange-500'
    if (role.hierarchy_level >= 50) return 'bg-yellow-500'
    if (role.hierarchy_level >= 30) return 'bg-green-500'
    return 'bg-blue-500'
  }

  const sortedRoles = [...roles].sort((a, b) => b.hierarchy_level - a.hierarchy_level)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Role Management
          </CardTitle>
          <CardDescription>
            Manage system roles and create custom roles for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {roles.filter(r => !r.is_system).length} custom roles, {roles.filter(r => r.is_system).length} system roles
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingRole(null)
                  form.reset({ hierarchy_level: 10 })
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? 'Edit Custom Role' : 'Create Custom Role'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateRole)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Senior Manager" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Role description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hierarchy_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hierarchy Level (1-100)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="100" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parent_role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Role (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select parent role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.filter(r => r.is_system).map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingRole ? 'Update Role' : 'Create Role'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRoles.map((role) => (
              <Card key={role.id} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div 
                      className={`w-3 h-3 rounded-full ${getRoleColor(role)}`}
                    />
                    {role.name}
                    {role.is_system && (
                      <Badge variant="secondary" className="text-xs">
                        System
                      </Badge>
                    )}
                  </CardTitle>
                  {role.description && (
                    <CardDescription className="text-sm">
                      {role.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Level:</span>
                      <Badge variant="outline">{role.hierarchy_level}</Badge>
                    </div>
                    
                    {role.parent_role && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Parent:</span>
                        <span className="text-xs">{role.parent_role}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      
                      {!role.is_system && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                {role.is_system && (
                  <div className="absolute top-2 right-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Hierarchy Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Role Hierarchy</CardTitle>
          <CardDescription>
            Visual representation of role hierarchy and inheritance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedRoles.map((role, index) => (
              <div key={role.id} className="flex items-center gap-4 p-2 border rounded">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className={`w-4 h-4 rounded-full ${getRoleColor(role)}`}
                  />
                  <span className="font-medium">{role.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Level {role.hierarchy_level}
                  </Badge>
                  {role.is_system && (
                    <Badge variant="secondary" className="text-xs">
                      System
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {/* This would show user count in a real implementation */}
                    0 users
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}