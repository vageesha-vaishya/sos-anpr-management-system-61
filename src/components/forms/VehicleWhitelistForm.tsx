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

const vehicleWhitelistSchema = z.object({
  license_plate: z.string().min(1, 'License plate is required'),
  owner_name: z.string().min(1, 'Owner name is required'),
  owner_contact: z.string().optional(),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  status: z.enum(['active', 'inactive', 'expired']),
  expires_at: z.string().optional(),
  notes: z.string().optional(),
})

type VehicleWhitelistFormData = z.infer<typeof vehicleWhitelistSchema>

interface VehicleWhitelistFormProps {
  onSuccess?: () => void
  editData?: {
    id: string
    license_plate: string
    owner_name: string
    owner_contact?: string
    vehicle_type: string
    status: string
    expires_at?: string
    notes?: string
  }
}

export const VehicleWhitelistForm: React.FC<VehicleWhitelistFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  
  const form = useForm<VehicleWhitelistFormData>({
    resolver: zodResolver(vehicleWhitelistSchema),
    defaultValues: {
      license_plate: editData?.license_plate || '',
      owner_name: editData?.owner_name || '',
      owner_contact: editData?.owner_contact || '',
      vehicle_type: editData?.vehicle_type || 'car',
      status: (editData?.status as any) || 'active',
      expires_at: editData?.expires_at ? new Date(editData.expires_at).toISOString().slice(0, 16) : '',
      notes: editData?.notes || '',
    },
  })

  const onSubmit = async (data: VehicleWhitelistFormData) => {
    if (!userProfile?.organization_id) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to manage vehicle whitelist',
        variant: 'destructive',
      })
      return
    }

    try {
      if (editData) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicle_whitelist')
          .update({
            license_plate: data.license_plate.toUpperCase(),
            owner_name: data.owner_name,
            owner_contact: data.owner_contact || null,
        vehicle_type: data.vehicle_type as 'car' | 'motorcycle' | 'truck' | 'van' | 'bus',
            status: data.status,
            expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
            notes: data.notes || null,
          })
          .eq('id', editData.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Vehicle updated successfully',
        })
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicle_whitelist')
          .insert({
            license_plate: data.license_plate.toUpperCase(),
            owner_name: data.owner_name,
            owner_contact: data.owner_contact || null,
            vehicle_type: data.vehicle_type as 'car' | 'motorcycle' | 'truck' | 'van' | 'bus',
            status: data.status,
            expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
            notes: data.notes || null,
            organization_id: userProfile.organization_id,
          })

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Vehicle added to whitelist successfully',
        })
      }
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Whitelisted Vehicle' : 'Add Vehicle to Whitelist'}</CardTitle>
        <CardDescription>{editData ? 'Update vehicle information' : 'Authorize a vehicle for access'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="license_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Contact (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes about this vehicle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update Vehicle' : 'Add to Whitelist'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}