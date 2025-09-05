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
import { Building2, Lock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const citySchema = z.object({
  name: z.string().min(1, 'City name is required'),
  state_id: z.string().min(1, 'State is required'),
})

type CityFormData = z.infer<typeof citySchema>

interface CityFormProps {
  onSuccess?: () => void
  editData?: any
}

export const CityForm: React.FC<CityFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const [states, setStates] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: editData?.name || '',
      state_id: editData?.state_id || '',
    },
  })

  const isPlatformAdmin = userProfile?.role === 'platform_admin'
  const canManage = user && isPlatformAdmin

  useEffect(() => {
    const fetchStates = async () => {
      const { data, error } = await supabase
        .from('states')
        .select(`
          id, 
          name,
          countries!inner(name)
        `)
        .order('name')

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch states',
          variant: 'destructive',
        })
      } else {
        setStates(data || [])
      }
    }

    fetchStates()
  }, [toast])

  const onSubmit = async (data: CityFormData) => {
    if (!canManage) {
      toast({
        title: 'Permission Denied',
        description: 'Only platform administrators can manage city data',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editData) {
        const { error } = await supabase
          .from('cities')
          .update(data)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'City updated successfully' })
      } else {
        const { error } = await supabase
          .from('cities')
          .insert(data as { name: string; state_id: string })
        
        if (error) throw error
        toast({ title: 'Success', description: 'City created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      let errorMessage = 'Failed to save city'
      
      if (error.message?.includes('row-level security policy')) {
        errorMessage = 'You need to be logged in as a platform administrator to manage geographical data'
      } else if (error.message?.includes('foreign key constraint') || error.code === '23503') {
        errorMessage = 'Please select a valid state'
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
          <Building2 className="w-5 h-5" />
          {editData ? 'Edit City' : 'Add New City'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update city information' : 'Create a new city entry'}
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
                  <FormLabel>City Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Los Angeles" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state: any) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name} ({state.countries.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editData ? 'Update City' : 'Create City')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}