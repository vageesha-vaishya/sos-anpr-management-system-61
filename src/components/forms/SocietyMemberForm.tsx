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
  phone: z.string().min(10, "Valid phone number is required").regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format"),
  building_id: z.string().optional(),
  unit_id: z.string().optional(),
  assignment_type: z.enum(['owner', 'tenant', 'family_member']).optional(),
  // Family member fields
  family_members: z.array(z.object({
    full_name: z.string().min(1, 'Name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    age: z.number().optional(),
    phone_number: z.string().optional().refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), "Invalid phone number format"),
    email: z.string().optional().refine(
      (val) => !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Invalid email format" }
    ),
    is_emergency_contact: z.boolean().optional(),
  })).optional(),
})

type SocietyMemberFormData = z.infer<typeof societyMemberSchema>

interface SocietyMemberFormProps {
  onSuccess?: () => void
  editData?: any
}

interface SocietyUnit {
  id: string;
  unit_number: string;
  unit_type: string;
  building_id: string | null;
  status: string;
  building?: {
    id: string;
    name: string;
    building_type: string;
    location?: {
      id: string;
      name: string;
    };
  };
}

interface Building {
  id: string;
  name: string;
  building_type: string;
  floors: number;
}

export const SocietyMemberForm: React.FC<SocietyMemberFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  const [societyUnits, setSocietyUnits] = useState<SocietyUnit[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("")
  const [activeTab, setActiveTab] = useState('basic')
  
  const form = useForm<SocietyMemberFormData>({
    resolver: zodResolver(societyMemberSchema),
    defaultValues: {
      email: editData?.email || '',
      full_name: editData?.full_name || '',
      role: (editData?.role as any) || 'resident',
      status: (editData?.status as any) || 'active',
      phone: editData?.phone || '',
      building_id: editData?.building_id || '',
      unit_id: editData?.unit_id || '',
      assignment_type: (editData?.assignment_type as any) || 'owner',
      family_members: editData?.family_members || [],
    },
  })

  useEffect(() => {
    const fetchBuildingsAndUnits = async () => {
      try {
        // Get current user's organization
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id, role')
          .eq('id', user.id)
          .single();

        if (!profile) return;

        // Fetch buildings based on organization hierarchy
        let buildingsQuery = supabase
          .from('buildings')
          .select(`
            id,
            name,
            building_type,
            floors,
            location:locations(
              id,
              name,
              organization_id
            )
          `);

        // Apply organization filtering based on user role
        if (profile.role !== 'platform_admin') {
          // Non-admins: only active buildings in their organization
          buildingsQuery = buildingsQuery
            .eq('is_active', true)
            .eq('locations.organization_id', profile.organization_id);
        }

        const { data: buildingsData, error: buildingsError } = await buildingsQuery;

        if (buildingsError) {
          console.error('Error fetching buildings:', buildingsError);
          return;
        }

        // Filter buildings to only include those in user's organization scope
        const filteredBuildings = buildingsData?.filter(building => 
          building.location && (
            profile.role === 'platform_admin' || 
            building.location.organization_id === profile.organization_id
          )
        ) || [];

        setBuildings(filteredBuildings.map(b => ({
          id: b.id,
          name: b.name,
          building_type: b.building_type,
          floors: b.floors
        })));

        // Fetch units with building and location context
        let unitsQuery = supabase
          .from('society_units')
          .select(`
            id,
            unit_number,
            unit_type,
            building_id,
            status,
            area_sqft,
            bedrooms,
            bathrooms,
            owner_name,
            tenant_name,
            building:buildings(
              id,
              name,
              building_type,
              location:locations(
                id,
                name,
                organization_id
              )
            )
          `);
        
        // For platform admins, show all units; for others, filter by assignable statuses
        if (profile.role !== 'platform_admin') {
          unitsQuery = unitsQuery.in('status', ['available', 'active']);
        }

        // Filter units to only those in user's organization buildings (non-admin)
        if (profile.role !== 'platform_admin' && filteredBuildings.length > 0) {
          unitsQuery = unitsQuery.in('building_id', filteredBuildings.map(b => b.id));
        }

        const { data: unitsData, error: unitsError } = await unitsQuery;

        if (unitsError) {
          console.error('Error fetching units:', unitsError);
        } else {
          setSocietyUnits(unitsData || []);
        }
      } catch (error) {
        console.error('Error in fetchBuildingsAndUnits:', error);
      }
    };

    fetchBuildingsAndUnits();
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
            phone: data.phone,
          })
          .eq('id', editData.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Society member updated successfully',
        })
      } else {
        // Create new member via Edge Function (uses service role)
        if (!validateSecureEmail(data.email)) {
          throw new Error('Invalid email format')
        }

        const payload = {
          email: data.email,
          full_name: sanitizeInput(data.full_name),
          phone: data.phone,
          role: data.role,
          status: data.status,
          unit_id: data.unit_id || undefined,
          assignment_type: data.assignment_type || undefined,
          family_members: (data.family_members || []).map(m => ({
            full_name: sanitizeInput(m.full_name),
            relationship: sanitizeInput(m.relationship),
            age: m.age ?? null,
            phone_number: m.phone_number || null,
            email: m.email && m.email !== '' ? m.email : null,
            is_emergency_contact: !!m.is_emergency_contact,
          })),
        };

        const { data: fnData, error: fnError } = await supabase.functions.invoke('admin-create-member', {
          body: payload,
        });
        if (fnError) throw fnError;

        toast({
          title: 'Success',
          description: `Society member created successfully.`,
        })
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

  // Filter units based on selected building
  const filteredUnits = selectedBuildingId 
    ? societyUnits.filter(unit => unit.building_id === selectedBuildingId)
    : societyUnits;

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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter phone number (e.g., +91-9876543210)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="unit" className="space-y-4">
                {/* Unit Statistics Display */}
                {buildings.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{buildings.length}</div>
                      <div className="text-sm text-muted-foreground">Buildings Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{societyUnits.filter(u => u.status === 'available').length}</div>
                      <div className="text-sm text-muted-foreground">Available Units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{filteredUnits.length}</div>
                      <div className="text-sm text-muted-foreground">Units in Selected Building</div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="building_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value)
                            setSelectedBuildingId(value)
                            // Reset unit selection when building changes
                            form.setValue('unit_id', '')
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select building" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buildings.map((building) => (
                              <SelectItem key={building.id} value={building.id}>
                                {building.name} - {building.building_type} ({building.floors} floors)
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
                            {filteredUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.unit_number} - {unit.unit_type} ({unit.status})
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
                              <SelectValue placeholder="Select assignment type" />
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
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Family Members</h3>
                  <Button type="button" onClick={addFamilyMember} variant="outline">
                    Add Family Member
                  </Button>
                </div>

                {form.watch('family_members')?.map((_, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
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
                              <Input placeholder="Family member name" {...field} />
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
                                <SelectItem value="Spouse">Spouse</SelectItem>
                                <SelectItem value="Son">Son</SelectItem>
                                <SelectItem value="Daughter">Daughter</SelectItem>
                                <SelectItem value="Father">Father</SelectItem>
                                <SelectItem value="Mother">Mother</SelectItem>
                                <SelectItem value="Brother">Brother</SelectItem>
                                <SelectItem value="Sister">Sister</SelectItem>
                                <SelectItem value="Grandparent">Grandparent</SelectItem>
                                <SelectItem value="Grandchild">Grandchild</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
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
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                              <Input type="email" placeholder="Email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`family_members.${index}.is_emergency_contact`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Emergency Contact</FormLabel>
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

                {(!form.watch('family_members') || form.watch('family_members')?.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No family members added yet. Click "Add Family Member" to get started.
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset Form
              </Button>
              <div className="space-x-2">
                {activeTab !== 'basic' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      const tabs = ['basic', 'unit', 'family']
                      const currentIndex = tabs.indexOf(activeTab)
                      if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1])
                    }}
                  >
                    Previous
                  </Button>
                )}
                {activeTab !== 'family' ? (
                  <Button 
                    type="button" 
                    onClick={() => {
                      const tabs = ['basic', 'unit', 'family']
                      const currentIndex = tabs.indexOf(activeTab)
                      if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1])
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit">
                    {editData ? 'Update Member' : 'Create Member'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}