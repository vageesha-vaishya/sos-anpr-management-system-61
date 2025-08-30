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
import { Flag } from 'lucide-react'

const countrySchema = z.object({
  name: z.string().min(1, 'Country name is required'),
  code: z.string().min(2, 'Country code is required').max(3, 'Code must be 2-3 characters'),
  continent_id: z.string().min(1, 'Continent is required'),
  plate_format: z.string().min(1, 'License plate format is required'),
})

type CountryFormData = z.infer<typeof countrySchema>

interface CountryFormProps {
  onSuccess?: () => void
  editData?: any
}

export const CountryForm: React.FC<CountryFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const [continents, setContinents] = useState<any[]>([])

  const form = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: editData?.name || '',
      code: editData?.code || '',
      continent_id: editData?.continent_id || '',
      plate_format: editData?.plate_format || '',
    },
  })

  useEffect(() => {
    const fetchContinents = async () => {
      const { data, error } = await supabase
        .from('continents')
        .select('id, name')
        .order('name')

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch continents',
          variant: 'destructive',
        })
      } else {
        setContinents(data || [])
      }
    }

    fetchContinents()
  }, [toast])

  const onSubmit = async (data: CountryFormData) => {
    try {
      if (editData) {
        const { error } = await supabase
          .from('countries')
          .update(data)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Country updated successfully' })
      } else {
        const { error } = await supabase
          .from('countries')
          .insert(data as { name: string; code: string; continent_id: string; plate_format: string })
        
        if (error) throw error
        toast({ title: 'Success', description: 'Country created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save country',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          {editData ? 'Edit Country' : 'Add New Country'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update country information' : 'Create a new country entry'}
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
                  <FormLabel>Country Name</FormLabel>
                  <FormControl>
                    <Input placeholder="United States" {...field} />
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
                  <FormLabel>Country Code</FormLabel>
                  <FormControl>
                    <Input placeholder="US" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="continent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Continent</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a continent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {continents.map((continent) => (
                        <SelectItem key={continent.id} value={continent.id}>
                          {continent.name}
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
              name="plate_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate Format</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-1234 or AAA-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update Country' : 'Create Country'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}