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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, UserPlus } from 'lucide-react'

const visitorFormSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  company: z.string().optional(),
  purpose_of_visit: z.string().min(1, 'Purpose of visit is required'),
  host_name: z.string().min(1, 'Host name is required'),
  host_unit: z.string().min(1, 'Host unit is required'),
  identification_type: z.string().min(1, 'Identification type is required'),
  identification_number: z.string().min(1, 'Identification number is required'),
  vehicle_number: z.string().optional(),
})

type VisitorFormValues = z.infer<typeof visitorFormSchema>

interface VisitorFormProps {
  visitor?: any
  onSuccess: () => void
  trigger?: React.ReactNode
}

const VisitorForm: React.FC<VisitorFormProps> = ({ visitor, onSuccess, trigger }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      full_name: visitor?.full_name || '',
      phone: visitor?.phone || '',
      email: visitor?.email || '',
      company: visitor?.company || '',
      purpose_of_visit: visitor?.purpose_of_visit || '',
      host_name: visitor?.host_name || '',
      host_unit: visitor?.host_unit || '',
      identification_type: visitor?.identification_type || '',
      identification_number: visitor?.identification_number || '',
      vehicle_number: visitor?.vehicle_number || '',
    },
  })

  const onSubmit = async (values: VisitorFormValues) => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userData.user?.id)
        .single()

      const visitorData = {
        ...values,
        email: values.email || null,
        company: values.company || null,
        vehicle_number: values.vehicle_number || null,
        visitor_status: visitor?.visitor_status || 'pending',
        check_in_time: visitor?.check_in_time || null,
        organization_id: profile?.organization_id,
      }

      if (visitor?.id) {
        const { error } = await (supabase as any)
          .from('visitors')
          .update(visitorData)
          .eq('id', visitor.id)

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Visitor updated successfully',
        })
      } else {
        const { error } = await (supabase as any)
          .from('visitors')
          .insert([visitorData])

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Visitor registered successfully',
        })
      }

      setOpen(false)
      form.reset()
      onSuccess()
    } catch (error: any) {
      console.error('Error saving visitor:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save visitor',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!visitor?.id) return
    
    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('visitors')
        .update({
          visitor_status: 'checked_in',
          check_in_time: new Date().toISOString(),
        })
        .eq('id', visitor.id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Visitor checked in successfully',
      })
      
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error checking in visitor:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to check in visitor',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!visitor?.id) return
    
    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('visitors')
        .update({
          visitor_status: 'checked_out',
          check_out_time: new Date().toISOString(),
        })
        .eq('id', visitor.id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Visitor checked out successfully',
      })
      
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error checking out visitor:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to check out visitor',
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
            <UserPlus className="h-4 w-4 mr-2" />
            Add Visitor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {visitor ? 'Edit Visitor' : 'Register New Visitor'}
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            {visitor && visitor.visitor_status && (
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Status: {visitor.visitor_status}</p>
                    {visitor.check_in_time && (
                      <p className="text-sm text-muted-foreground">
                        Checked in: {new Date(visitor.check_in_time).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="space-x-2">
                    {visitor.visitor_status === 'pending' && (
                      <Button onClick={handleCheckIn} disabled={loading}>
                        Check In
                      </Button>
                    )}
                    {visitor.visitor_status === 'checked_in' && (
                      <Button onClick={handleCheckOut} disabled={loading}>
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1-555-0123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="purpose_of_visit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Visit</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Business meeting, delivery, personal visit, etc."
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
                    name="host_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="host_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="A-101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="identification_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identification Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Driver License">Driver License</SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="ID Card">ID Card</SelectItem>
                            <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="identification_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identification Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ID Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="vehicle_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
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
                    {visitor ? 'Update' : 'Register'}
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

export default VisitorForm