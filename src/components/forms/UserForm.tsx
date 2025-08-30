import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['platform_admin', 'franchise_admin', 'franchise_user', 'customer_admin', 'customer_user']),
  status: z.enum(['active', 'inactive', 'pending']),
  organization_id: z.string().min(1, 'Organization is required'),
  phone_number: z.string().optional(),
  active_from: z.string().optional(),
  active_until: z.string().optional(),
  two_factor_enabled: z.boolean().optional(),
  preferred_2fa_method: z.enum(['email', 'sms', 'whatsapp']).optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  onSuccess?: () => void
  editData?: {
    id: string
    email: string
    full_name: string
    role: string
    status: string
    organization_id: string
    phone_number?: string
    active_from?: string
    active_until?: string
    two_factor_enabled?: boolean
    preferred_2fa_method?: string
  }
}

export const UserForm: React.FC<UserFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  const [organizations, setOrganizations] = useState<any[]>([])
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: editData?.email || '',
      full_name: editData?.full_name || '',
      role: (editData?.role as any) || 'customer_user',
      status: (editData?.status as any) || 'active',
      organization_id: editData?.organization_id || userProfile?.organization_id || '',
      phone_number: editData?.phone_number || '',
      active_from: editData?.active_from || '',
      active_until: editData?.active_until || '',
      two_factor_enabled: editData?.two_factor_enabled || false,
      preferred_2fa_method: (editData?.preferred_2fa_method as any) || 'email',
    },
  })

  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name')
      
      if (data) setOrganizations(data)
    }
    
    fetchOrganizations()
  }, [])

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editData) {
        // Update existing user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          role: data.role,
          status: data.status,
          organization_id: data.organization_id,
          phone_number: data.phone_number,
          active_from: data.active_from || null,
          active_until: data.active_until || null,
          two_factor_enabled: data.two_factor_enabled || false,
          preferred_2fa_method: data.preferred_2fa_method || 'email',
        })
        .eq('id', editData.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'User updated successfully',
        })
      } else {
        // Create new user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: 'TempPass123!', // Temporary password - user should change on first login
          options: {
            data: {
              full_name: data.full_name,
            },
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        })

        if (authError) throw authError

        if (authData.user) {
          // Update the automatically created profile with additional data
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              role: data.role,
              status: data.status,
              organization_id: data.organization_id,
            })
            .eq('id', authData.user.id)

          if (profileError) throw profileError

          toast({
            title: 'Success',
            description: `User created successfully. Confirmation email sent to ${data.email}`,
          })
        }
      }
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('User operation error:', error)
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editData ? 'update' : 'create'} user`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit User' : 'Add User'}</CardTitle>
        <CardDescription>{editData ? 'Update user information' : 'Create a new user account'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="platform_admin">Platform Admin</SelectItem>
                      <SelectItem value="franchise_admin">Franchise Admin</SelectItem>
                      <SelectItem value="franchise_user">Franchise User</SelectItem>
                      <SelectItem value="customer_admin">Customer Admin</SelectItem>
                      <SelectItem value="customer_user">Customer User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_2fa_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred 2FA Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select 2FA method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="active_from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active From</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active_until"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Until</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="two_factor_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Two-Factor Authentication
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Require additional verification for login
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {editData ? 'Update User' : 'Create User'}
          </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}