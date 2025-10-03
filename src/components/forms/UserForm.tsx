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
import { generateSecurePassword, validateSecureEmail, sanitizeInput } from '@/lib/security'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.string(),
  status: z.enum(['active', 'inactive', 'pending']),
  organization_id: z.string().min(1, 'Organization is required'),
  phone_number: z.string().optional(),
  active_from: z.string().optional(),
  active_until: z.string().optional(),
  two_factor_enabled: z.boolean().optional(),
  preferred_2fa_method: z.enum(['email', 'sms', 'whatsapp']).optional(),
  unit_id: z.string().optional(),
  assignment_type: z.enum(['owner', 'tenant', 'family_member']).optional(),
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
    unit_id?: string
    assignment_type?: string
  }
}

export const UserForm: React.FC<UserFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [societyUnits, setSocietyUnits] = useState<any[]>([])
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: editData?.email || '',
      full_name: editData?.full_name || '',
      role: (editData?.role as any) || 'resident',
      status: (editData?.status as any) || 'active',
      organization_id: editData?.organization_id || userProfile?.organization_id || '00000000-0000-0000-0000-000000000003',
      phone_number: editData?.phone_number || '',
      active_from: editData?.active_from || '',
      active_until: editData?.active_until || '',
      two_factor_enabled: editData?.two_factor_enabled || false,
      preferred_2fa_method: (editData?.preferred_2fa_method as any) || 'email',
      unit_id: editData?.unit_id || '',
      assignment_type: (editData?.assignment_type as any) || 'owner',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch organizations
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name')
        
        if (orgsError) {
          console.error('Error fetching organizations:', orgsError)
          setOrganizations([
            { id: '00000000-0000-0000-0000-000000000003', name: 'Demo Organization' }
          ])
        } else if (orgsData) {
          setOrganizations(orgsData)
        }

        // Fetch society units for unit assignment
        const { data: unitsData } = await supabase
          .from('society_units')
          .select('id, unit_number, unit_type, floor, building_id')
          .order('unit_number')

        setSocietyUnits(unitsData || [])
      } catch (err) {
        console.error('Exception fetching data:', err)
        setOrganizations([
          { id: '00000000-0000-0000-0000-000000000003', name: 'Demo Organization' }
        ])
      }
    }
    
    fetchData()
  }, [])

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editData) {
        // Update existing user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
        role: data.role === 'franchise_user' ? 'operator' : data.role as any,
        status: data.status === 'pending' ? 'active' : data.status as any,
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
        // Sanitize input data
        const sanitizedFullName = sanitizeInput(data.full_name)
        
        // Generate secure temporary password
        const temporaryPassword = generateSecurePassword(16)
        
        // Normalize email to avoid validation issues (trim + lowercase)
        const cleanedEmail = (data.email || '').trim().toLowerCase()

        // Map legacy roles/status to valid enums
        const normalizedRole = data.role === 'customer_user' ? 'resident' : (data.role === 'franchise_user' ? 'operator' : (data.role as any))
        const normalizedStatus = data.status === 'pending' ? 'active' : (data.status as any)
        
        // Create new user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanedEmail,
          password: temporaryPassword,
          options: {
            data: {
              full_name: sanitizedFullName,
              requires_password_change: true, // Force password change on first login
            },
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        })

        if (authError) {
          // Fallback: use admin edge function to create the user when Supabase rejects the email
          const { data: sessionRes } = await supabase.auth.getSession()
          const accessToken = sessionRes.session?.access_token

          const payload = {
            email: cleanedEmail,
            full_name: sanitizedFullName,
            phone: data.phone_number || '',
            role: normalizedRole as any,
            status: normalizedStatus as any,
            unit_id: data.unit_id || undefined,
            assignment_type: (data.assignment_type as any) || undefined,
          }

          const { data: fnData, error: fnError } = await supabase.functions.invoke('admin-create-member', {
            body: payload,
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
          })

          if (fnError) throw fnError

          toast({
            title: 'Success',
            description: 'User created successfully via admin flow.',
          })
        } else if (authData.user) {
          // Update the automatically created profile with additional data
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              role: normalizedRole as any,
              status: normalizedStatus as any,
              organization_id: data.organization_id,
            })
            .eq('id', authData.user.id)

          if (profileError) throw profileError

          // Create unit assignment if unit and assignment type provided
          if (data.unit_id && data.assignment_type) {
            const { error: assignmentError } = await supabase
              .from('unit_assignments')
              .insert({
                unit_id: data.unit_id,
                resident_id: authData.user.id,
                assignment_type: data.assignment_type,
                is_primary: true,
                organization_id: data.organization_id,
              })

            if (assignmentError) console.warn('Unit assignment error:', assignmentError)
          }

          toast({
            title: 'Success',
            description: `User created successfully. They will receive an email with login instructions and must set a new password on first login.`,
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
                      <SelectItem value="society_president">Society President</SelectItem>
                      <SelectItem value="society_secretary">Society Secretary</SelectItem>
                      <SelectItem value="society_treasurer">Society Treasurer</SelectItem>
                      <SelectItem value="society_committee_member">Committee Member</SelectItem>
                      <SelectItem value="resident">Resident</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="family_member">Family Member</SelectItem>
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

          {/* Unit Assignment Section for Society Members */}
          {(form.watch('role') === 'resident' || form.watch('role') === 'tenant' || form.watch('role') === 'owner') && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">Unit Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unit_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {societyUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              Unit {unit.unit_number} - {unit.unit_type} (Floor {unit.floor})
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
                  name="assignment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="family_member">Family Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            {editData ? 'Update User' : 'Create User'}
          </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}