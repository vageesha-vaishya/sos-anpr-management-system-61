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

const billingCustomerSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
  billing_plan: z.string().min(1, 'Billing plan is required'),
  payment_method: z.string().optional()
})

type BillingCustomerFormData = z.infer<typeof billingCustomerSchema>

interface BillingCustomerFormProps {
  onSuccess?: () => void
  editData?: any
}

export const BillingCustomerFormFull: React.FC<BillingCustomerFormProps> = ({ onSuccess, editData }) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const form = useForm<BillingCustomerFormData>({
    resolver: zodResolver(billingCustomerSchema),
    defaultValues: editData || {
      customer_name: '',
      email: '',
      phone: '',
      address: '',
      billing_plan: '',
      payment_method: ''
    }
  })

  const onSubmit = async (data: BillingCustomerFormData) => {
    try {
      const paymentMethod = data.payment_method ? JSON.parse(data.payment_method) : null

      if (editData) {
        const { error } = await supabase
          .from('billing_customers')
          .update({
            customer_name: data.customer_name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            billing_plan: data.billing_plan,
            payment_method: paymentMethod,
            organization_id: userProfile?.organization_id
          })
          .eq('id', editData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('billing_customers')
          .insert({
            customer_name: data.customer_name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            billing_plan: data.billing_plan,
            payment_method: paymentMethod,
            organization_id: userProfile?.organization_id
          })

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Billing customer ${editData ? 'updated' : 'created'} successfully`
      })

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving billing customer:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save billing customer",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit' : 'Add'} Billing Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billing_plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update' : 'Add'} Billing Customer
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}