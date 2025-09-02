import React, { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Plus, Ticket } from 'lucide-react'

const ticketFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high']),
  assigned_to: z.string().optional(),
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

interface StaffMember {
  id: string
  full_name: string
  position: string
}

interface HelpDeskTicketFormProps {
  ticket?: any
  onSuccess: () => void
  trigger?: React.ReactNode
}

export const HelpDeskTicketForm: React.FC<HelpDeskTicketFormProps> = ({ 
  ticket, 
  onSuccess, 
  trigger 
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const { toast } = useToast()

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: ticket?.title || '',
      description: ticket?.description || '',
      category: ticket?.category || '',
      priority: ticket?.priority || 'medium',
      assigned_to: ticket?.assigned_to || '',
    },
  })

  const loadStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('id, full_name, position')
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setStaffMembers(data || [])
    } catch (error) {
      console.error('Error loading staff members:', error)
    }
  }

  useEffect(() => {
    if (open) {
      loadStaffMembers()
    }
  }, [open])

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    return `TKT-${timestamp}`
  }

  const onSubmit = async (values: TicketFormValues) => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userData.user?.id)
        .single()

      const ticketData = {
        ...values,
        assigned_to: values.assigned_to || null,
        created_by: userData.user?.id,
        organization_id: profile?.organization_id,
        ticket_number: ticket?.ticket_number || generateTicketNumber(),
        status: ticket?.status || 'open',
      }

      if (ticket?.id) {
        const { error } = await supabase
          .from('helpdesk_tickets')
          .update(ticketData)
          .eq('id', ticket.id)

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Ticket updated successfully',
        })
      } else {
        const { error } = await supabase
          .from('helpdesk_tickets')
          .insert([ticketData])

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Ticket created successfully',
        })
      }

      setOpen(false)
      form.reset()
      onSuccess()
    } catch (error: any) {
      console.error('Error saving ticket:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save ticket',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Maintenance',
    'Security',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Landscaping',
    'IT',
    'Administration',
    'Safety',
    'Waste Management',
    'Other'
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Ticket className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ticket ? 'Edit Ticket' : 'Create New Ticket'}
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the issue" {...field} />
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
                          placeholder="Detailed description of the issue, including location and any relevant details"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.full_name} - {staff.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    {ticket ? 'Update' : 'Create'} Ticket
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