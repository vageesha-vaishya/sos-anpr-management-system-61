import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const chargeCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  charge_type: z.string().min(1, 'Charge type is required'),
  base_amount: z.number().min(0).optional(),
  billing_cycle: z.string().min(1, 'Billing cycle is required')
})

type ChargeCategoryFormData = z.infer<typeof chargeCategorySchema>

interface ChargeCategoryFormProps {
  onSuccess?: () => void
  editData?: any
  onCancel?: () => void
}

export const ChargeCategoryFormFull: React.FC<ChargeCategoryFormProps> = ({ onSuccess, editData, onCancel }) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const form = useForm<ChargeCategoryFormData>({
    resolver: zodResolver(chargeCategorySchema),
    defaultValues: editData || {
      name: '',
      description: '',
      charge_type: '',
      base_amount: 0,
      billing_cycle: ''
    }
  })

  const onSubmit = async (data: ChargeCategoryFormData) => {
    if (!userProfile?.organization_id) {
      toast({
        title: "Error",
        description: "User organization not found. Please log in again.",
        variant: "destructive"
      })
      return
    }

    try {
      if (editData) {
        const { error } = await supabase
          .from('charge_categories')
          .update({
            name: data.name,
            description: data.description,
            charge_type: data.charge_type,
            base_amount: data.base_amount,
            billing_cycle: data.billing_cycle,
            organization_id: userProfile.organization_id
          })
          .eq('id', editData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('charge_categories')
          .insert({
            name: data.name,
            description: data.description,
            charge_type: data.charge_type,
            base_amount: data.base_amount,
            billing_cycle: data.billing_cycle,
            organization_id: userProfile.organization_id
          })

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Charge category ${editData ? 'updated' : 'created'} successfully`
      })

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving charge category:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save charge category",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit' : 'Add'} Charge Category</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
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
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="charge_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Charge Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select charge type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="utility">Utility</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="amenity">Amenity</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter base amount" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billing_cycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Cycle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update' : 'Add'} Charge Category
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}