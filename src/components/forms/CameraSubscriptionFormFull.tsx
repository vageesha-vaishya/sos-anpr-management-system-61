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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const cameraSubscriptionSchema = z.object({
  camera_id: z.string().min(1, 'Camera is required'),
  subscription_plan: z.string().min(1, 'Subscription plan is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  monthly_cost: z.number().min(0).optional(),
  features: z.string().optional()
})

type CameraSubscriptionFormData = z.infer<typeof cameraSubscriptionSchema>

interface CameraSubscriptionFormProps {
  onSuccess?: () => void
  editData?: any
}

export const CameraSubscriptionFormFull: React.FC<CameraSubscriptionFormProps> = ({ onSuccess, editData }) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const [cameras, setCameras] = useState<any[]>([])

  const form = useForm<CameraSubscriptionFormData>({
    resolver: zodResolver(cameraSubscriptionSchema),
    defaultValues: editData || {
      camera_id: '',
      subscription_plan: '',
      start_date: '',
      end_date: '',
      monthly_cost: 0,
      features: ''
    }
  })

  useEffect(() => {
    fetchCameras()
  }, [])

  const fetchCameras = async () => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('id, name')
        .eq('is_active', true)

      if (error) throw error
      setCameras(data || [])
    } catch (error) {
      console.error('Error fetching cameras:', error)
      toast({
        title: "Error",
        description: "Failed to fetch cameras",
        variant: "destructive"
      })
    }
  }

  const onSubmit = async (data: CameraSubscriptionFormData) => {
    try {
      const features = data.features ? JSON.parse(data.features) : null

      if (editData) {
        const { error } = await supabase
          .from('camera_subscriptions')
          .update({
            camera_id: data.camera_id,
            subscription_plan: data.subscription_plan,
            start_date: data.start_date,
            end_date: data.end_date,
            monthly_cost: data.monthly_cost,
            features: features,
            organization_id: userProfile?.organization_id
          })
          .eq('id', editData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('camera_subscriptions')
          .insert({
            camera_id: data.camera_id,
            subscription_plan: data.subscription_plan,
            start_date: data.start_date,
            end_date: data.end_date,
            monthly_cost: data.monthly_cost,
            features: features,
            organization_id: userProfile?.organization_id
          })

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Camera subscription ${editData ? 'updated' : 'created'} successfully`
      })

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving camera subscription:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save camera subscription",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit' : 'Add'} Camera Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="camera_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cameras.map((camera) => (
                        <SelectItem key={camera.id} value={camera.id}>
                          {camera.name}
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
              name="subscription_plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subscription plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthly_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Cost</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter monthly cost" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update' : 'Add'} Camera Subscription
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}