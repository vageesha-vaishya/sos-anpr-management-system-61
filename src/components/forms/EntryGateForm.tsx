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

const entryGateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  building_id: z.string().min(1, 'Building is required'),
  type: z.string().min(1, 'Gate type is required'),
  status: z.enum(['active', 'inactive', 'maintenance']),
})

type EntryGateFormData = z.infer<typeof entryGateSchema>

interface EntryGateFormProps {
  onSuccess?: () => void
}

export const EntryGateForm: React.FC<EntryGateFormProps> = ({ onSuccess }) => {
  const { toast } = useToast()
  const [buildings, setBuildings] = useState<any[]>([])
  
  const form = useForm<EntryGateFormData>({
    resolver: zodResolver(entryGateSchema),
    defaultValues: {
      name: '',
      building_id: '',
      type: 'main',
      status: 'active',
    },
  })

  useEffect(() => {
    const fetchBuildings = async () => {
      const { data } = await supabase
        .from('buildings')
        .select('id, name, locations(name)')
      
      if (data) setBuildings(data)
    }
    
    fetchBuildings()
  }, [])

  const onSubmit = async (data: EntryGateFormData) => {
    try {
      const { error } = await supabase
        .from('entry_gates')
        .insert({
          name: data.name,
          building_id: data.building_id,
          gate_type: data.type as any,
          is_active: data.status === 'active',
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Entry gate created successfully',
      })
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Entry gate creation error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create entry gate',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Entry Gate</CardTitle>
        <CardDescription>Create a new entry/exit point for a building</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gate Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Entrance, Visitor Gate" {...field} />
                  </FormControl>
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
                          {building.name} - {building.locations?.name}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gate Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gate type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="main">Main Entrance</SelectItem>
                        <SelectItem value="visitor">Visitor Gate</SelectItem>
                        <SelectItem value="service">Service Gate</SelectItem>
                        <SelectItem value="emergency">Emergency Exit</SelectItem>
                        <SelectItem value="vip">VIP Entrance</SelectItem>
                        <SelectItem value="staff">Staff Entrance</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Create Entry Gate
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}