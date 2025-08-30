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
  rtsp_url: z.string().min(1, 'RTSP URL is required'),
  model: z.string().min(1, 'Model is required'),
  resolution: z.string().min(1, 'Resolution is required'),
  fps: z.number().min(1, 'FPS must be at least 1'),
  status: z.enum(['online', 'offline', 'maintenance']),
})

type CameraFormData = z.infer<typeof cameraSchema>

interface CameraFormProps {
  onSuccess?: () => void
  editData?: {
    id: string
    name: string
    entry_gate_id: string
    ip_address: string
    rtsp_url: string
    model: string
    resolution: string
    fps: number
    status: string
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
      model: editData?.model || '',
      resolution: editData?.resolution || '1920x1080',
      fps: editData?.fps || 30,
      status: (editData?.status as any) || 'offline',
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
            rtsp_url: data.rtsp_url,
            model: data.model,
            resolution: data.resolution,
            fps: data.fps,
            status: data.status,
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
            rtsp_url: data.rtsp_url,
            model: data.model,
            resolution: data.resolution,
            fps: data.fps,
            status: data.status,
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

            <div className="grid grid-cols-2 gap-4">
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
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Hikvision DS-2CD2043G0-I" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rtsp_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RTSP URL</FormLabel>
                  <FormControl>
                    <Input placeholder="rtsp://admin:password@192.168.1.100:554/stream" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="resolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                        <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                        <SelectItem value="2560x1440">2560x1440 (QHD)</SelectItem>
                        <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FPS</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
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
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              {editData ? 'Update Camera' : 'Register Camera'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}