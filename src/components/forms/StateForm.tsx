import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { MapPin, Lock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const stateSchema = z.object({
  name: z.string().min(1, 'State name is required'),
  code: z.string().min(2, 'State code is required').max(10, 'Code must be 2-10 characters'),
  country_id: z.string().min(1, 'Country is required'),
})

type StateFormData = z.infer<typeof stateSchema>

interface StateFormProps {
  onSuccess?: () => void
  editData?: any
}

export const StateForm: React.FC<StateFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const [countries, setCountries] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<StateFormData>({
    resolver: zodResolver(stateSchema),
    defaultValues: {
      name: editData?.name || '',
      code: editData?.code || '',
      country_id: editData?.country_id || '',
    },
  })

  const isPlatformAdmin = userProfile?.role === 'platform_admin'
  const canManage = user && isPlatformAdmin

  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name')
        .order('name')

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch countries',
          variant: 'destructive',
        })
      } else {
        setCountries(data || [])
      }
    }

    fetchCountries()
  }, [toast])

  const onSubmit = async (data: StateFormData) => {
    if (!canManage) {
      toast({
        title: 'Permission Denied',
        description: 'Only platform administrators can manage state data',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editData) {
        const { error } = await supabase
          .from('states')
          .update(data)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'State updated successfully' })
      } else {
        const { error } = await supabase
          .from('states')
          .insert(data as { name: string; code: string; country_id: string })
        
        if (error) throw error
        toast({ title: 'Success', description: 'State created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      let errorMessage = 'Failed to save state'
      
      if (error.message?.includes('row-level security policy')) {
        errorMessage = 'You need to be logged in as a platform administrator to manage geographical data'
      } else if (error.message?.includes('unique constraint') || error.code === '23505') {
        errorMessage = 'A state with this code already exists in the selected country'
      } else if (error.message?.includes('foreign key constraint') || error.code === '23503') {
        errorMessage = 'Please select a valid country'
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: 'Database Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access geographical data management.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!canManage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Only platform administrators can manage geographical master data. 
              Current role: {userProfile?.role || 'Unknown'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {editData ? 'Edit State' : 'Add New State'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update state information' : 'Create a new state entry'}
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
                  <FormLabel>State Name</FormLabel>
                  <FormControl>
                    <Input placeholder="California" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State Code</FormLabel>
                  <FormControl>
                    <Input placeholder="CA" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editData ? 'Update State' : 'Create State')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}