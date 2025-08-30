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
import { Building2 } from 'lucide-react'

const citySchema = z.object({
  name: z.string().min(1, 'City name is required'),
  state_id: z.string().min(1, 'State is required'),
})

type CityFormData = z.infer<typeof citySchema>

interface CityFormProps {
  onSuccess?: () => void
  editData?: any
}

export const CityForm: React.FC<CityFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const [states, setStates] = useState<any[]>([])

  const form = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: editData?.name || '',
      state_id: editData?.state_id || '',
    },
  })

  useEffect(() => {
    const fetchStates = async () => {
      const { data, error } = await supabase
        .from('states')
        .select(`
          id, 
          name,
          countries!inner(name)
        `)
        .order('name')

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch states',
          variant: 'destructive',
        })
      } else {
        setStates(data || [])
      }
    }

    fetchStates()
  }, [toast])

  const onSubmit = async (data: CityFormData) => {
    try {
      if (editData) {
        const { error } = await supabase
          .from('cities')
          .update(data)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'City updated successfully' })
      } else {
        const { error } = await supabase
          .from('cities')
          .insert(data as { name: string; state_id: string })
        
        if (error) throw error
        toast({ title: 'Success', description: 'City created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save city',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          {editData ? 'Edit City' : 'Add New City'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update city information' : 'Create a new city entry'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Los Angeles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state: any) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name} ({state.countries.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update City' : 'Create City'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}