import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Settings, CheckCircle } from 'lucide-react'

const serviceTypeSchema = z.object({
  service_name: z.string().min(1, 'Service name is required'),
  service_category: z.string().min(1, 'Service category is required'),
  description: z.string().optional(),
  billing_model: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'fixed']),
  unit_type: z.enum(['hour', 'day', 'week', 'month', 'unit']),
  default_rate: z.number().min(0, 'Rate must be positive').optional(),
})

type ServiceTypeFormData = z.infer<typeof serviceTypeSchema>

interface ServiceTypeFormProps {
  onSuccess?: () => void
  editData?: any
  onCancel?: () => void
}

export const ServiceTypeFormFull: React.FC<ServiceTypeFormProps> = ({ onSuccess, editData, onCancel }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ServiceTypeFormData>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      service_name: editData?.service_name || '',
      service_category: editData?.service_category || '',
      description: editData?.description || '',
      billing_model: editData?.billing_model || 'hourly',
      unit_type: editData?.unit_type || 'hour',
      default_rate: editData?.default_rate || undefined,
    },
  })

  const onSubmit = async (data: ServiceTypeFormData) => {
    if (!userProfile?.organization_id) {
      toast({
        title: 'Error',
        description: 'Organization not found',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const serviceData = {
        service_name: data.service_name,
        service_category: data.service_category,
        description: data.description || null,
        billing_model: data.billing_model,
        unit_type: data.unit_type,
        default_rate: data.default_rate || null,
        organization_id: userProfile.organization_id,
        is_active: true,
      }

      let error
      if (editData) {
        const { error: updateError } = await supabase
          .from('service_types')
          .update(serviceData)
          .eq('id', editData.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('service_types')
          .insert(serviceData)
        error = insertError
      }

      if (error) throw error

      toast({
        title: 'Success',
        description: `Service type ${editData ? 'updated' : 'created'} successfully`,
      })
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          {editData ? 'Edit Service Type' : 'Add Service Type'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update service type details' : 'Configure a new service type and billing model'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="service_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service category" {...field} />
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
                    <Textarea placeholder="Enter service description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="unit">Unit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="default_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Rate ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="Enter default rate" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1 transition-all duration-300 hover:scale-105" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    {editData ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {editData ? 'Update Service Type' : 'Create Service Type'}
                  </div>
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}