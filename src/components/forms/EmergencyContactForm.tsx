import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_type: z.string().min(1, 'Contact type is required'),
  phone_primary: z.string().min(1, 'Primary phone is required'),
  phone_secondary: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().optional(),
  availability: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface EmergencyContactFormProps {
  editData?: any
  onSuccess: () => void
  onCancel: () => void
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_name: editData?.contact_name || '',
      contact_type: editData?.contact_type || 'police',
      phone_primary: editData?.phone_primary || '',
      phone_secondary: editData?.phone_secondary || '',
      email: editData?.email || '',
      address: editData?.address || '',
      availability: editData?.availability || '24x7',
      notes: editData?.notes || '',
      is_primary: editData?.is_primary ?? false,
      is_active: editData?.is_active ?? true,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const dataToSubmit = {
        contact_name: values.contact_name,
        contact_type: values.contact_type,
        phone_primary: values.phone_primary,
        phone_secondary: values.phone_secondary,
        email: values.email,
        address: values.address,
        availability: values.availability,
        notes: values.notes,
        is_primary: values.is_primary,
        is_active: values.is_active,
        organization_id: userProfile?.organization_id!,
      }

      if (editData) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update(dataToSubmit)
          .eq('id', editData.id)

        if (error) throw error
        toast({ title: 'Success', description: 'Emergency contact updated successfully' })
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert([dataToSubmit])

        if (error) throw error
        toast({ title: 'Success', description: 'Emergency contact created successfully' })
      }

      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save emergency contact',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="police">Police</SelectItem>
                    <SelectItem value="fire">Fire Department</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="ambulance">Ambulance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_primary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter primary phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_secondary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter secondary phone" {...field} />
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
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="24x7">24x7</SelectItem>
                    <SelectItem value="business_hours">Business Hours</SelectItem>
                    <SelectItem value="emergency_only">Emergency Only</SelectItem>
                    <SelectItem value="weekdays">Weekdays Only</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="is_primary"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel>Primary Contact</FormLabel>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editData ? 'Update' : 'Create'} Emergency Contact
          </Button>
        </div>
      </form>
    </Form>
  )
}