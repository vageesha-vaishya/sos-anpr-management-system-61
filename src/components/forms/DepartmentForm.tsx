import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  head_of_department: z.string().optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  status: z.string().min(1, 'Status is required'),
})

type FormValues = z.infer<typeof formSchema>

interface DepartmentFormProps {
  editData?: any
  onSuccess: () => void
  onCancel: () => void
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editData?.name || '',
      description: editData?.description || '',
      head_of_department: editData?.head_of_department || '',
      budget: editData?.budget || 0,
      status: editData?.status || 'active',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const dataToSubmit = {
        name: values.name,
        description: values.description,
        head_of_department: values.head_of_department,
        budget: values.budget,
        status: values.status,
        organization_id: userProfile?.organization_id!,
      }

      if (editData) {
        const { error } = await supabase
          .from('departments')
          .update(dataToSubmit)
          .eq('id', editData.id)

        if (error) throw error
        toast({ title: 'Success', description: 'Department updated successfully' })
      } else {
        const { error } = await supabase
          .from('departments')
          .insert([dataToSubmit])

        if (error) throw error
        toast({ title: 'Success', description: 'Department created successfully' })
      }

      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save department',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter department name" {...field} />
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
                <Textarea placeholder="Enter department description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="head_of_department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Head of Department</FormLabel>
                <FormControl>
                  <Input placeholder="Enter head of department" {...field} />
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
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="restructuring">Restructuring</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editData ? 'Update' : 'Create'} Department
          </Button>
        </div>
      </form>
    </Form>
  )
}