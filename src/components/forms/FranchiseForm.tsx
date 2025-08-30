import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProgressBar } from '@/components/ui/progress-bar'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Building2, CheckCircle } from 'lucide-react'

const franchiseSchema = z.object({
  name: z.string().min(1, 'Franchise name is required'),
  subscription_plan: z.enum(['basic', 'premium', 'enterprise']),
  status: z.enum(['active', 'inactive', 'suspended']),
  contact_email: z.string().email('Valid email is required').optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
})

type FranchiseFormData = z.infer<typeof franchiseSchema>

interface FranchiseFormProps {
  onSuccess?: () => void
  editData?: any
}

export const FranchiseForm: React.FC<FranchiseFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)
  
  const form = useForm<FranchiseFormData>({
    resolver: zodResolver(franchiseSchema),
    defaultValues: {
      name: editData?.name || '',
      subscription_plan: editData?.subscription_plan || 'basic',
      status: editData?.status || 'active',
      contact_email: editData?.contact_email || '',
      contact_phone: editData?.contact_phone || '',
      address: editData?.address || '',
      description: editData?.description || '',
    },
  })

  const onSubmit = async (data: FranchiseFormData) => {
    setIsSubmitting(true)
    setSubmitProgress(0)

    try {
      setSubmitProgress(25)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const organizationData = {
        name: data.name,
        type: 'franchise',
        subscription_plan: data.subscription_plan,
        status: data.status,
        parent_id: null, // Franchises are top-level organizations under platform
      }

      setSubmitProgress(50)
      
      let result
      if (editData) {
        result = await supabase
          .from('organizations')
          .update(organizationData)
          .eq('id', editData.id)
      } else {
        result = await supabase
          .from('organizations')
          .insert(organizationData)
      }

      setSubmitProgress(75)
      if (result.error) throw result.error

      setSubmitProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))

      toast({
        title: 'Success',
        description: `Franchise ${editData ? 'updated' : 'created'} successfully`,
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
      setSubmitProgress(0)
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          {editData ? 'Edit Franchise' : 'Add Franchise Partner'}
        </CardTitle>
        <CardDescription>
          {editData 
            ? 'Update franchise partner information' 
            : 'Create a new franchise partner organization'
          }
        </CardDescription>
        {isSubmitting && (
          <div className="space-y-2">
            <ProgressBar value={submitProgress} variant="default" showValue />
            <p className="text-xs text-muted-foreground">
              {editData ? 'Updating' : 'Creating'} franchise...
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franchise Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter franchise name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subscription_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic Plan</SelectItem>
                        <SelectItem value="premium">Premium Plan</SelectItem>
                        <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="franchise@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        {...field} 
                      />
                    </FormControl>
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
                    <Input 
                      placeholder="Enter franchise address" 
                      {...field} 
                    />
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
                      placeholder="Brief description of the franchise partner"
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full transition-all duration-300 hover:scale-105" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  {editData ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {editData ? 'Update Franchise' : 'Create Franchise'}
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}