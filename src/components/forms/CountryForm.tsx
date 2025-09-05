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
import { Flag, Lock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const countrySchema = z.object({
  name: z.string().min(1, 'Country name is required'),
  code: z.string().min(2, 'Country code is required').max(3, 'Code must be 2-3 characters'),
  continent_id: z.string().min(1, 'Continent is required'),
  plate_format: z.string().min(1, 'License plate format is required'),
})

type CountryFormData = z.infer<typeof countrySchema>

interface CountryFormProps {
  onSuccess?: () => void
  editData?: any
}

export const CountryForm: React.FC<CountryFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const [continents, setContinents] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: editData?.name || '',
      code: editData?.code || '',
      continent_id: editData?.continent_id || '',
      plate_format: editData?.plate_format || '',
    },
  })

  const isPlatformAdmin = userProfile?.role === 'platform_admin'
  const canManage = user && isPlatformAdmin

  useEffect(() => {
    const fetchContinents = async () => {
      const { data, error } = await supabase
        .from('continents')
        .select('id, name')
        .order('name')

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch continents',
          variant: 'destructive',
        })
      } else {
        setContinents(data || [])
      }
    }

    fetchContinents()
  }, [toast])

  const onSubmit = async (data: CountryFormData) => {
    if (!canManage) {
      toast({
        title: 'Permission Denied',
        description: 'Only platform administrators can manage country data',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editData) {
        const { error } = await supabase
          .from('countries')
          .update(data)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Country updated successfully' })
      } else {
        const { error } = await supabase
          .from('countries')
          .insert(data as { name: string; code: string; continent_id: string; plate_format: string })
        
        if (error) throw error
        toast({ title: 'Success', description: 'Country created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      let errorMessage = 'Failed to save country'
      
      if (error.message?.includes('row-level security policy')) {
        errorMessage = 'You need to be logged in as a platform administrator to manage geographical data'
      } else if (error.message?.includes('unique constraint') || error.code === '23505') {
        errorMessage = 'A country with this code already exists'
      } else if (error.message?.includes('foreign key constraint') || error.code === '23503') {
        errorMessage = 'Please select a valid continent'
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
          <Flag className="w-5 h-5" />
          {editData ? 'Edit Country' : 'Add New Country'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update country information' : 'Create a new country entry'}
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
                  <FormLabel>Country Name</FormLabel>
                  <FormControl>
                    <Input placeholder="United States" {...field} disabled={isSubmitting} />
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
                  <FormLabel>Country Code</FormLabel>
                  <FormControl>
                    <Input placeholder="US" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="continent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Continent</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a continent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {continents.map((continent) => (
                        <SelectItem key={continent.id} value={continent.id}>
                          {continent.name}
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
              name="plate_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate Format</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-1234 or AAA-000" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editData ? 'Update Country' : 'Create Country')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}