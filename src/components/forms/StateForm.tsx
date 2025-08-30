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
import { MapPin } from 'lucide-react'

const stateSchema = z.object({
  name: z.string().min(1, 'State name is required'),
  code: z.string().min(2, 'State code is required').max(10, 'Code must be 2-10 characters'),
  country_id: z.string().min(1, 'Country is required'),
})

type StateFormData = z.infer<typeof stateSchema>

interface StateFormProps {
  onSuccess?: () => void
  editData?: any
}

export const StateForm: React.FC<StateFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const [countries, setCountries] = useState<any[]>([])

  const form = useForm<StateFormData>({
    resolver: zodResolver(stateSchema),
    defaultValues: {
      name: editData?.name || '',
      code: editData?.code || '',
      country_id: editData?.country_id || '',
    },
  })

  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name')
        .order('name')

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch countries',
          variant: 'destructive',
        })
      } else {
        setCountries(data || [])
      }
    }

    fetchCountries()
  }, [toast])

  const onSubmit = async (data: StateFormData) => {
    try {
      if (editData) {
        const { error } = await supabase
          .from('states')
          .update(data)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'State updated successfully' })
      } else {
        const { error } = await supabase
          .from('states')
          .insert(data as { name: string; code: string; country_id: string })
        
        if (error) throw error
        toast({ title: 'Success', description: 'State created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save state',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {editData ? 'Edit State' : 'Add New State'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update state information' : 'Create a new state entry'}
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
                  <FormLabel>State Name</FormLabel>
                  <FormControl>
                    <Input placeholder="California" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State Code</FormLabel>
                  <FormControl>
                    <Input placeholder="CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update State' : 'Create State'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}