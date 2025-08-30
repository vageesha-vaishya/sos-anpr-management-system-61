import React from 'react'
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

const vehicleBlacklistSchema = z.object({
  license_plate: z.string().min(1, 'License plate is required'),
  reason: z.string().min(1, 'Reason is required'),
  severity: z.enum(['low', 'medium', 'high']),
  reported_by: z.string().min(1, 'Reporter name is required'),
  status: z.enum(['active', 'inactive', 'expired']),
  notes: z.string().optional(),
})

type VehicleBlacklistFormData = z.infer<typeof vehicleBlacklistSchema>

interface VehicleBlacklistFormProps {
  onSuccess?: () => void
}

export const VehicleBlacklistForm: React.FC<VehicleBlacklistFormProps> = ({ onSuccess }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  
  const form = useForm<VehicleBlacklistFormData>({
    resolver: zodResolver(vehicleBlacklistSchema),
    defaultValues: {
      license_plate: '',
      reason: '',
      severity: 'medium',
      reported_by: '',
      status: 'active',
      notes: '',
    },
  })

  const onSubmit = async (data: VehicleBlacklistFormData) => {
    if (!userProfile?.organization_id) {
      toast({
        title: 'Error',
        description: 'User organization not found. Please log in again.',
        variant: 'destructive',
      })
      return
    }

    try {
      const { error } = await supabase
        .from('vehicle_blacklist')
        .insert({
          license_plate: data.license_plate.toUpperCase(),
          reason: data.reason,
          severity: data.severity,
          reported_by: data.reported_by,
          status: data.status,
          notes: data.notes || null,
          organization_id: userProfile.organization_id,
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Vehicle added to blacklist successfully',
      })
      
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
        <CardTitle>Add Vehicle to Blacklist</CardTitle>
        <CardDescription>Block unauthorized or problematic vehicles</CardDescription>
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
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threat Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Blacklisting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="theft">Vehicle Theft</SelectItem>
                      <SelectItem value="vandalism">Property Vandalism</SelectItem>
                      <SelectItem value="trespassing">Unauthorized Access</SelectItem>
                      <SelectItem value="harassment">Harassment/Threats</SelectItem>
                      <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                      <SelectItem value="court_order">Court Order</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reported_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reported By</FormLabel>
                    <FormControl>
                      <Input placeholder="Security Officer / Resident Name" {...field} />
                    </FormControl>
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active Block</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Temporary (Expired)</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional details about the incident or vehicle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="destructive" className="w-full">
              Add to Blacklist
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}