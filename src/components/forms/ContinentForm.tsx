import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Globe } from 'lucide-react'

const continentSchema = z.object({
  name: z.string().min(1, 'Continent name is required'),
  code: z.string().min(2, 'Continent code is required').max(3, 'Code must be 2-3 characters'),
})

type ContinentFormData = z.infer<typeof continentSchema>

interface ContinentFormProps {
  onSuccess?: () => void
  editData?: any
}

export const ContinentForm: React.FC<ContinentFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()

  const form = useForm<ContinentFormData>({
    resolver: zodResolver(continentSchema),
    defaultValues: {
      name: editData?.name || '',
      code: editData?.code || '',
    },
  })

  const onSubmit = async (data: ContinentFormData) => {
    try {
      if (editData) {
        const { error } = await supabase
          .from('continents')
          .update(data)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Continent updated successfully' })
      } else {
        const { error } = await supabase
          .from('continents')
          .insert(data as { name: string; code: string })
        
        if (error) throw error
        toast({ title: 'Success', description: 'Continent created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save continent',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {editData ? 'Edit Continent' : 'Add New Continent'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update continent information' : 'Create a new continent entry'}
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
                  <FormLabel>Continent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="North America" {...field} />
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
                  <FormLabel>Continent Code</FormLabel>
                  <FormControl>
                    <Input placeholder="NA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update Continent' : 'Create Continent'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}