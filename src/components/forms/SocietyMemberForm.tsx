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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { generateSecurePassword, validateSecureEmail, sanitizeInput } from '@/lib/security'

const societyMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['society_president', 'society_secretary', 'society_treasurer', 'society_committee_member', 'resident', 'tenant', 'owner', 'family_member']),
  status: z.enum(['active', 'inactive', 'pending']),
  phone_number: z.string().optional(),
  unit_id: z.string().optional(),
  assignment_type: z.enum(['owner', 'tenant', 'family_member']).optional(),
  // Family member fields
  family_members: z.array(z.object({
    full_name: z.string().min(1, 'Name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    age: z.number().optional(),
    phone_number: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    is_emergency_contact: z.boolean().optional(),
  })).optional(),
})

type SocietyMemberFormData = z.infer<typeof societyMemberSchema>

interface SocietyMemberFormProps {
  onSuccess?: () => void
  editData?: any
}

export const SocietyMemberForm: React.FC<SocietyMemberFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  const [societyUnits, setSocietyUnits] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('basic')
  
  const form = useForm<SocietyMemberFormData>({
    resolver: zodResolver(societyMemberSchema),
    defaultValues: {
      email: editData?.email || '',
      full_name: editData?.full_name || '',
      role: (editData?.role as any) || 'resident',
      status: (editData?.status as any) || 'active',
      phone_number: editData?.phone_number || '',
      unit_id: editData?.unit_id || '',
      assignment_type: (editData?.assignment_type as any) || 'owner',
      family_members: editData?.family_members || [],
    },
  })

  useEffect(() => {
    const fetchSocietyUnits = async () => {
      try {
        const { data, error } = await supabase
          .from('society_units')
          .select('id, unit_number, unit_type, floor, building_id, occupancy_status')
          .order('unit_number')

        if (error) throw error
        setSocietyUnits(data || [])
      } catch (err) {
        console.error('Error fetching society units:', err)
      }
    }
    
    fetchSocietyUnits()
  }, [])

  const onSubmit = async (data: SocietyMemberFormData) => {
    try {
      if (editData) {
        // Update existing member
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: data.full_name,
            role: data.role as any,
            status: data.status as any,
            phone_number: data.phone_number,
          })
          .eq('id', editData.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Society member updated successfully',
        })
      } else {
        // Create new member
        if (!validateSecureEmail(data.email)) {
          throw new Error('Invalid email format')
        }

        const sanitizedFullName = sanitizeInput(data.full_name)
        const temporaryPassword = generateSecurePassword(16)
        
        // Create new user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: temporaryPassword,
          options: {
            data: {
              full_name: sanitizedFullName,
              requires_password_change: true,
            },
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        })

        if (authError) throw authError

        if (authData.user) {
          // Update profile with society-specific data
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              role: data.role as any,
              status: data.status as any,
              organization_id: userProfile?.organization_id,
              phone_number: data.phone_number,
            })
            .eq('id', authData.user.id)

          if (profileError) throw profileError

          // Create unit assignment if provided
          if (data.unit_id && data.assignment_type) {
            const { error: assignmentError } = await supabase
              .from('unit_assignments')
              .insert({
                unit_id: data.unit_id,
                resident_id: authData.user.id,
                assignment_type: data.assignment_type,
                is_primary: true,
                organization_id: userProfile?.organization_id,
              })

            if (assignmentError) console.warn('Unit assignment error:', assignmentError)

            // Update unit occupancy status
            await supabase
              .from('society_units')
              .update({ 
                occupancy_status: 'occupied',
                primary_resident_id: authData.user.id 
              })
              .eq('id', data.unit_id)
          }

          // Add family members if provided
          if (data.family_members && data.family_members.length > 0) {
            const familyMembersData = data.family_members.map(member => ({
              unit_id: data.unit_id,
              primary_resident_id: authData.user.id,
              full_name: member.full_name,
              relationship: member.relationship,
              age: member.age,
              phone_number: member.phone_number,
              email: member.email || null,
              is_emergency_contact: member.is_emergency_contact || false,
              organization_id: userProfile?.organization_id,
            }))

            const { error: familyError } = await supabase
              .from('household_members')
              .insert(familyMembersData)

            if (familyError) console.warn('Family members error:', familyError)
          }

          toast({
            title: 'Success',
            description: `Society member created successfully. They will receive an email with login instructions.`,
          })
        }
      }
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Society member operation error:', error)
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editData ? 'update' : 'create'} society member`,
        variant: 'destructive',
      })
    }
  }

  const addFamilyMember = () => {
    const currentMembers = form.getValues('family_members') || []
    form.setValue('family_members', [
      ...currentMembers,
      {
        full_name: '',
        relationship: '',
        age: undefined,
        phone_number: '',
        email: '',
        is_emergency_contact: false,
      }
    ])
  }

  const removeFamilyMember = (index: number) => {
    const currentMembers = form.getValues('family_members') || []
    form.setValue('family_members', currentMembers.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Society Member' : 'Add Society Member'}</CardTitle>
        <CardDescription>
          {editData ? 'Update society member information' : 'Register a new society member with unit assignment'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="unit">Unit Assignment</TabsTrigger>
                <TabsTrigger value="family">Family Members</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="member@example.com" {...field} />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

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
              </TabsContent>

              <TabsContent value="unit" className="space-y-4">
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
                                {unit.occupancy_status === 'occupied' && ' - Occupied'}
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
              </TabsContent>

              <TabsContent value="family" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Family Members</h3>
                  <Button type="button" onClick={addFamilyMember} variant="outline">
                    Add Family Member
                  </Button>
                </div>

                {form.watch('family_members')?.map((_, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Family Member {index + 1}</h4>
                      <Button 
                        type="button" 
                        onClick={() => removeFamilyMember(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`family_members.${index}.full_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`family_members.${index}.relationship`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`family_members.${index}.age`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Age" 
                                {...field}
                                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`family_members.${index}.phone_number`}
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
                        name={`family_members.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`family_members.${index}.is_emergency_contact`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Emergency Contact</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Mark as emergency contact
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
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                {editData ? 'Update Member' : 'Create Member'}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}