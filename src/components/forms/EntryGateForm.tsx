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
  gate_type: z.enum(['main', 'visitor', 'service', 'emergency']),
  is_active: z.boolean().default(true),
})

type EntryGateFormData = z.infer<typeof entryGateSchema>

interface EntryGateFormProps {
  onSuccess?: () => void
  editData?: {
    id: string
    name: string
    building_id: string
    gate_type: string
    is_active: boolean
  }
}

export const EntryGateForm: React.FC<EntryGateFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const [buildings, setBuildings] = useState<any[]>([])
  
  const form = useForm<EntryGateFormData>({
    resolver: zodResolver(entryGateSchema),
    defaultValues: {
      name: editData?.name || '',
      building_id: editData?.building_id || '',
      gate_type: (editData?.gate_type as any) || 'main',
      is_active: editData?.is_active ?? true,
    },
  })

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        console.log('Fetching buildings for dropdown...')
        const { data, error } = await supabase
          .from('buildings')
          .select('id, name, locations!inner(name)')
          .order('name')
        
        if (error) {
          console.error('Error fetching buildings:', error)
          toast({
            title: 'Error loading buildings',
            description: error.message,
            variant: 'destructive',
          })
        } else {
          console.log(`Loaded ${data?.length || 0} buildings`)
          setBuildings(data || [])
        }
      } catch (error: any) {
        console.error('Error in fetchBuildings:', error)
        toast({
          title: 'Error loading buildings',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
    
    fetchBuildings()
  }, [])

  const onSubmit = async (data: EntryGateFormData) => {
    try {
      if (editData) {
        // Update existing entry gate
        const { error } = await supabase
          .from('entry_gates')
          .update({
            name: data.name,
            building_id: data.building_id,
            gate_type: data.gate_type,
            is_active: data.is_active,
          })
          .eq('id', editData.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Entry gate updated successfully',
        })
      } else {
        // Create new entry gate
        const { error } = await supabase
          .from('entry_gates')
          .insert({
            name: data.name,
            building_id: data.building_id,
            gate_type: data.gate_type,
            is_active: data.is_active,
          })

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Entry gate created successfully',
        })
      }
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Entry gate operation error:', error)
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editData ? 'update' : 'create'} entry gate`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Entry Gate' : 'Add Entry Gate'}</CardTitle>
        <CardDescription>{editData ? 'Update entry gate information' : 'Create a new entry/exit point for a building'}</CardDescription>
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
                name="gate_type"
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <Button type="submit" className="w-full">
              {editData ? 'Update Entry Gate' : 'Create Entry Gate'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}