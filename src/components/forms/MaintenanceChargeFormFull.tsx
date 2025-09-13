import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { DollarSign, CheckCircle } from 'lucide-react'

const maintenanceChargeSchema = z.object({
  unit_id: z.string().min(1, 'Unit is required'),
  charge_category_id: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  billing_period: z.string().min(1, 'Billing period is required'),
  due_date: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
})

type MaintenanceChargeFormData = z.infer<typeof maintenanceChargeSchema>

interface MaintenanceChargeFormProps {
  onSuccess?: () => void
  charge?: any
  units?: any[]
  onCancel?: () => void
}

export const MaintenanceChargeFormFull: React.FC<MaintenanceChargeFormProps> = ({ 
  onSuccess, 
  charge, 
  units: propUnits, 
  onCancel 
}) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [units, setUnits] = useState<any[]>(propUnits || [])
  const [chargeCategories, setChargeCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const form = useForm<MaintenanceChargeFormData>({
    resolver: zodResolver(maintenanceChargeSchema),
    defaultValues: {
      unit_id: charge?.unit_id || '',
      charge_category_id: charge?.charge_category_id || '',
      amount: charge?.amount || 0,
      billing_period: charge?.billing_period || '',
      due_date: charge?.due_date || '',
      status: charge?.status || 'pending',
    },
  })

  useEffect(() => {
    fetchData()
  }, [userProfile])

  const fetchData = async () => {
    if (!userProfile?.organization_id) return

    setLoading(true)
    try {
      // Fetch units if not provided
      if (!propUnits) {
        const { data: unitsData, error: unitsError } = await supabase
          .from('society_units')
          .select('id, unit_number, building_id')
          .order('unit_number')

        if (unitsError) throw unitsError
        setUnits(unitsData || [])
      }

      // Fetch charge categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('charge_categories')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('name')

      if (categoriesError) throw categoriesError
      setChargeCategories(categoriesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: MaintenanceChargeFormData) => {
    if (!userProfile?.organization_id) {
      toast({
        title: 'Error',
        description: 'Organization not found',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const chargeData = {
        unit_id: data.unit_id,
        charge_category_id: data.charge_category_id === 'none' || !data.charge_category_id ? null : data.charge_category_id,
        amount: data.amount,
        billing_period: data.billing_period,
        due_date: data.due_date || null,
        status: data.status,
        organization_id: userProfile.organization_id,
      }

      let error
      if (charge) {
        const { error: updateError } = await supabase
          .from('maintenance_charges')
          .update(chargeData)
          .eq('id', charge.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('maintenance_charges')
          .insert(chargeData)
        error = insertError
      }

      if (error) throw error

      toast({
        title: 'Success',
        description: `Maintenance charge ${charge ? 'updated' : 'created'} successfully`,
      })
      
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          {charge ? 'Edit Maintenance Charge' : 'Add Maintenance Charge'}
        </CardTitle>
        <CardDescription>
          {charge ? 'Update maintenance charge details' : 'Create a new maintenance charge for a unit'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          Unit {unit.unit_number}
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
              name="charge_category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Charge Category (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select charge category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {chargeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="Enter amount" 
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
                name="billing_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Period</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., January 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1 transition-all duration-300 hover:scale-105" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    {charge ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {charge ? 'Update Charge' : 'Create Charge'}
                  </div>
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}