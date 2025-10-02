import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

const buildingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location_id: z.string().min(1, 'Location is required'),
  building_type: z.enum(['office', 'residential', 'commercial', 'industrial']),
  floors: z.number().min(1, 'At least 1 floor required'),
})

type BuildingFormData = z.infer<typeof buildingSchema>

interface BuildingFormProps {
  onSuccess?: () => void
  organizationId?: string
  showAllOrganizations?: boolean
  editData?: {
    id: string
    name: string
    location_id: string
    building_type: string
    floors: number
  }
}

export const BuildingForm: React.FC<BuildingFormProps> = ({ onSuccess, organizationId, showAllOrganizations = false, editData }) => {
  const { toast } = useToast()
  const [locations, setLocations] = useState<any[]>([])
  
  const form = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: editData?.name || '',
      location_id: editData?.location_id || '',
      building_type: (editData?.building_type as any) || 'office',
      floors: editData?.floors || 1,
    },
  })

  useEffect(() => {
    const fetchLocations = async () => {
      if (!showAllOrganizations && !organizationId) {
        console.log('No organizationId provided, skipping location fetch')
        return
      }

      try {
        console.log('Fetching locations for dropdown...')
        let query = supabase
          .from('locations')
          .select('id, name, organization_id, organizations!inner(name)')
          .order('name')
        
        // Only filter by organization if not showing all organizations
        if (!showAllOrganizations && organizationId) {
          query = query.eq('organization_id', organizationId)
        }

        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching locations:', error)
          toast({
            title: 'Error loading locations',
            description: error.message,
            variant: 'destructive',
          })
        } else {
          console.log(`Loaded ${data?.length || 0} locations`)
          setLocations(data || [])
        }
      } catch (error: any) {
        console.error('Error in fetchLocations:', error)
        toast({
          title: 'Error loading locations',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
    
    fetchLocations()
  }, [organizationId, showAllOrganizations, toast])

  const onSubmit = async (data: BuildingFormData) => {
    try {
      if (editData) {
        // Update existing building
        const { error } = await supabase
          .from('buildings')
          .update({
            name: data.name,
            location_id: data.location_id,
            building_type: data.building_type,
            floors: data.floors,
          })
          .eq('id', editData.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Building updated successfully',
        })
      } else {
        // Create new building
        const { error } = await supabase
          .from('buildings')
          .insert({
            name: data.name,
            location_id: data.location_id,
            building_type: data.building_type,
            floors: data.floors,
          })

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Building created successfully',
        })
      }
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Building operation error:', error)
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editData ? 'update' : 'create'} building`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Building' : 'Add Building'}</CardTitle>
        <CardDescription>{editData ? 'Update building information' : 'Register a new building at a location'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter building name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.organizations?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="building_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="office">Office Building</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Floors</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="1" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              {editData ? 'Update Building' : 'Create Building'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}