import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Settings } from 'lucide-react'

const premiseTypeSchema = z.object({
  name: z.string().min(1, 'Premise type name is required'),
  description: z.string().optional(),
  config: z.string().optional(),
})

type PremiseTypeFormData = z.infer<typeof premiseTypeSchema>

interface PremiseTypeFormProps {
  onSuccess?: () => void
  editData?: any
}

export const PremiseTypeForm: React.FC<PremiseTypeFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()

  const form = useForm<PremiseTypeFormData>({
    resolver: zodResolver(premiseTypeSchema),
    defaultValues: {
      name: editData?.name || '',
      description: editData?.description || '',
      config: editData?.config ? JSON.stringify(editData.config, null, 2) : '{}',
    },
  })

  const onSubmit = async (data: PremiseTypeFormData) => {
    try {
      let config = {}
      if (data.config) {
        try {
          config = JSON.parse(data.config)
        } catch (e) {
          toast({
            title: 'Error',
            description: 'Invalid JSON format in configuration',
            variant: 'destructive',
          })
          return
        }
      }

      const submitData = {
        name: data.name,
        description: data.description || null,
        config,
      }

      if (editData) {
        const { error } = await supabase
          .from('premise_types')
          .update(submitData)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Premise type updated successfully' })
      } else {
        const { error } = await supabase
          .from('premise_types')
          .insert(submitData)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Premise type created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save premise type',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {editData ? 'Edit Premise Type' : 'Add New Premise Type'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update premise type information' : 'Create a new premise type entry'}
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
                  <FormLabel>Premise Type Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Office Building" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description of the premise type..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="config"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuration (JSON)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='{"security_level": "high", "access_hours": "24/7"}'
                      className="font-mono text-sm"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update Premise Type' : 'Create Premise Type'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}