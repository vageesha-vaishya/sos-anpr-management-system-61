import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Plus } from 'lucide-react'

const departmentFormSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional(),
  head_of_department: z.string().optional(),
  budget: z.string().optional(),
})

type DepartmentFormValues = z.infer<typeof departmentFormSchema>

interface DepartmentFormProps {
  department?: any
  onSuccess: () => void
  trigger?: React.ReactNode
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ 
  department, 
  onSuccess, 
  trigger 
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: department?.name || '',
      description: department?.description || '',
      head_of_department: department?.head_of_department || '',
      budget: department?.budget?.toString() || '',
    },
  })

  const onSubmit = async (values: DepartmentFormValues) => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userData.user?.id)
        .single()

      const departmentData = {
        ...values,
        budget: values.budget ? parseFloat(values.budget) : null,
        organization_id: profile?.organization_id,
      }

      if (department?.id) {
        const { error } = await (supabase as any)
          .from('departments')
          .update(departmentData)
          .eq('id', department.id)

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Department updated successfully',
        })
      } else {
        const { error } = await (supabase as any)
          .from('departments')
          .insert([departmentData])

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Department created successfully',
        })
      }

      setOpen(false)
      form.reset()
      onSuccess()
    } catch (error: any) {
      console.error('Error saving department:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save department',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {department ? 'Edit Department' : 'Add New Department'}
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Security" {...field} />
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
                          placeholder="Department responsibilities and overview" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="head_of_department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Head of Department</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {department ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}