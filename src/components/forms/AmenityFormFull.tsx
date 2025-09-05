import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const amenitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  amenity_type: z.string().min(1, 'Type is required'),
  building_id: z.string().min(1, 'Building is required'),
  capacity: z.number().min(1).optional(),
  operating_hours: z.string().optional(),
  booking_required: z.boolean().optional(),
  pricing: z.string().optional()
})

type AmenityFormData = z.infer<typeof amenitySchema>

interface AmenityFormProps {
  onSuccess?: () => void
  editData?: any
  onCancel?: () => void
}

export const AmenityFormFull: React.FC<AmenityFormProps> = ({ onSuccess, editData, onCancel }) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const [buildings, setBuildings] = useState<any[]>([])

  const form = useForm<AmenityFormData>({
    resolver: zodResolver(amenitySchema),
    defaultValues: editData || {
      name: '',
      description: '',
      amenity_type: '',
      building_id: '',
      capacity: 0,
      operating_hours: '',
      booking_required: true,
      pricing: ''
    }
  })

  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    if (!userProfile?.organization_id) return
    
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select(`
          id, 
          name,
          location_id,
          locations!inner(organization_id)
        `)
        .eq('locations.organization_id', userProfile.organization_id)
        .eq('is_active', true)

      if (error) throw error
      setBuildings(data || [])
    } catch (error) {
      console.error('Error fetching buildings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch buildings",
        variant: "destructive"
      })
    }
  }

  const onSubmit = async (data: AmenityFormData) => {
    if (!userProfile?.organization_id) {
      toast({
        title: "Error",
        description: "User organization not found. Please log in again.",
        variant: "destructive"
      })
      return
    }

    try {
      const operatingHours = data.operating_hours ? JSON.parse(data.operating_hours) : null
      const pricing = data.pricing ? JSON.parse(data.pricing) : null

      if (editData) {
        const { error } = await supabase
          .from('amenities')
          .update({
            name: data.name,
            description: data.description,
            amenity_type: data.amenity_type,
            building_id: data.building_id,
            capacity: data.capacity,
            operating_hours: operatingHours,
            booking_required: data.booking_required,
            pricing: pricing
          })
          .eq('id', editData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('amenities')
          .insert({
            name: data.name,
            description: data.description,
            amenity_type: data.amenity_type,
            building_id: data.building_id,
            capacity: data.capacity,
            operating_hours: operatingHours,
            booking_required: data.booking_required,
            pricing: pricing
          })

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Amenity ${editData ? 'updated' : 'created'} successfully`
      })

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving amenity:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save amenity",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit' : 'Add'} Amenity</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter amenity name" {...field} />
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
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amenity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select amenity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pool">Swimming Pool</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="clubhouse">Clubhouse</SelectItem>
                      <SelectItem value="playground">Playground</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="garden">Garden</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="building_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
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
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter capacity" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update' : 'Add'} Amenity
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}