import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organization_id: z.string().min(1, 'Organization is required'),
  address: z.string().min(1, 'Address is required'),
  city_id: z.string().min(1, 'City is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  Coordinates: z.string().optional(),
})

type LocationFormData = z.infer<typeof locationSchema>

interface LocationFormProps {
  onSuccess?: () => void
  editData?: {
    id: string
    name: string
    organization_id: string
    address: string
    city_id: string
    latitude?: string
    longitude?: string
    Coordinates?: string
  }
}

export const LocationForm: React.FC<LocationFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  
  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: editData?.name || '',
      organization_id: editData?.organization_id || '',
      address: editData?.address || '',
      city_id: editData?.city_id || '',
      latitude: editData?.latitude || '',
      longitude: editData?.longitude || '',
      Coordinates: editData?.Coordinates || '',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      const [orgsResult, citiesResult] = await Promise.all([
        supabase.from('organizations').select('id, name'),
        supabase.from('cities').select('id, name')
      ])
      
      if (orgsResult.data) setOrganizations(orgsResult.data)
      if (citiesResult.data) setCities(citiesResult.data)
    }
    
    fetchData()
  }, [])

  const onSubmit = async (data: LocationFormData) => {
    if (!user || !userProfile) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to manage locations',
        variant: 'destructive',
      })
      return
    }

    try {
      if (editData) {
        // Update existing location
        const { error } = await supabase
          .from('locations')
          .update({
            name: data.name,
            organization_id: data.organization_id,
            address: data.address,
            city_id: data.city_id,
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,
            Coordinates: data.Coordinates || null,
          })
          .eq('id', editData.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Location updated successfully',
        })
      } else {
        // Create new location
        const { error } = await supabase
          .from('locations')
          .insert({
            name: data.name,
            organization_id: data.organization_id,
            address: data.address,
            city_id: data.city_id,
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,
            Coordinates: data.Coordinates || null,
          })

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Location created successfully',
        })
      }
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Location operation error:', error)
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editData ? 'update' : 'create'} location`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Location' : 'Add Location'}</CardTitle>
        <CardDescription>{editData ? 'Update location information' : 'Create a new location for an organization'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location name" {...field} />
                  </FormControl>
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 28.6139" type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 77.2090" type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="Coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordinates Text (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Near Metro Station, Sector 18" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update Location' : 'Create Location'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}