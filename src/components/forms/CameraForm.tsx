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

const cameraSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  entry_gate_id: z.string().min(1, 'Entry gate is required'),
  ip_address: z.string().min(1, 'IP address is required'),
  rtsp_url: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  is_active: z.boolean().default(true),
})

type CameraFormData = z.infer<typeof cameraSchema>

interface CameraFormProps {
  onSuccess?: () => void
  editData?: {
    id: string
    name: string
    entry_gate_id: string
    ip_address: string
    rtsp_url?: string
    username?: string
    password?: string
    is_active: boolean
  }
}

export const CameraForm: React.FC<CameraFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const [entryGates, setEntryGates] = useState<any[]>([])
  
  const form = useForm<CameraFormData>({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      name: editData?.name || '',
      entry_gate_id: editData?.entry_gate_id || '',
      ip_address: editData?.ip_address || '',
      rtsp_url: editData?.rtsp_url || '',
      username: editData?.username || '',
      password: editData?.password || '',
      is_active: editData?.is_active ?? true,
    },
  })

  useEffect(() => {
    const fetchEntryGates = async () => {
      const { data } = await supabase
        .from('entry_gates')
        .select('id, name, building_id, buildings(name)')
      
      if (data) setEntryGates(data)
    }
    
    fetchEntryGates()
  }, [])

  const onSubmit = async (data: CameraFormData) => {
    try {
      if (editData) {
        // Update existing camera
        const { error } = await supabase
          .from('cameras')
          .update({
            name: data.name,
            entry_gate_id: data.entry_gate_id,
            ip_address: data.ip_address,
            rtsp_url: data.rtsp_url || null,
            username: data.username || null,
            password: data.password || null,
            is_active: data.is_active,
          })
          .eq('id', editData.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Camera updated successfully',
        })
      } else {
        // Create new camera
        const { error } = await supabase
          .from('cameras')
          .insert({
            name: data.name,
            entry_gate_id: data.entry_gate_id,
            ip_address: data.ip_address,  
            rtsp_url: data.rtsp_url || null,
            username: data.username || null,
            password: data.password || null,
            is_active: data.is_active,
          })

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Camera registered successfully',
        })
      }
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Camera operation error:', error)
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editData ? 'update' : 'register'} camera`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Camera' : 'Add Camera'}</CardTitle>
        <CardDescription>{editData ? 'Update camera configuration' : 'Register a new camera in the system'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter camera name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entry_gate_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Gate</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entry gate" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entryGates.map((gate) => (
                        <SelectItem key={gate.id} value={gate.id}>
                          {gate.name} - {gate.buildings?.name}
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
              name="ip_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input placeholder="192.168.1.100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rtsp_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RTSP URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="rtsp://admin:password@192.168.1.100:554/stream" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update Camera' : 'Register Camera'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}