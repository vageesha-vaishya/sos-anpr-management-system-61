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

const alertSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  alert_type: z.enum(['system', 'security', 'maintenance', 'detection']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  camera_id: z.string().optional(),
})

type AlertFormData = z.infer<typeof alertSchema>

interface AlertFormProps {
  onSuccess?: () => void
}

export const AlertForm: React.FC<AlertFormProps> = ({ onSuccess }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  const [cameras, setCameras] = useState<any[]>([])
  
  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: '',
      message: '',
      alert_type: 'system',
      severity: 'medium',
      camera_id: '',
    },
  })

  useEffect(() => {
    const fetchCameras = async () => {
      const { data } = await supabase
        .from('cameras')
        .select('id, name, entry_gates(name)')
      
      if (data) setCameras(data)
    }
    
    fetchCameras()
  }, [])

  const onSubmit = async (data: AlertFormData) => {
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
        .from('alerts')
        .insert({
          title: data.title,
          message: data.message,
          alert_type: data.alert_type,
          severity: data.severity,
          created_by: userProfile.id,
          organization_id: userProfile.organization_id,
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Alert created successfully',
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
        <CardTitle>Create Alert</CardTitle>
        <CardDescription>Create a new system or security alert</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter alert title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed alert description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="alert_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="system">System Alert</SelectItem>
                        <SelectItem value="security">Security Alert</SelectItem>
                        <SelectItem value="maintenance">Maintenance Alert</SelectItem>
                        <SelectItem value="detection">Detection Alert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="camera_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Camera (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera if applicable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No specific camera</SelectItem>
                      {cameras.map((camera) => (
                        <SelectItem key={camera.id} value={camera.id}>
                          {camera.name} - {camera.entry_gates?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Create Alert
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}