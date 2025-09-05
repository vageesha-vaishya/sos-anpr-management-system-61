import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Globe, Lock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const continentSchema = z.object({
  name: z.string().min(1, 'Continent name is required'),
  code: z.string().min(2, 'Continent code is required').max(3, 'Code must be 2-3 characters'),
})

type ContinentFormData = z.infer<typeof continentSchema>

interface ContinentFormProps {
  onSuccess?: () => void
  editData?: any
}

export const ContinentForm: React.FC<ContinentFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContinentFormData>({
    resolver: zodResolver(continentSchema),
    defaultValues: {
      name: editData?.name || '',
      code: editData?.code || '',
    },
  })

  const isPlatformAdmin = userProfile?.role === 'platform_admin'
  const canManage = user && isPlatformAdmin

  const onSubmit = async (data: ContinentFormData) => {
    if (!canManage) {
      toast({
        title: 'Permission Denied',
        description: 'Only platform administrators can manage continent data',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editData) {
        const { error } = await supabase
          .from('continents')
          .update(data)
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Continent updated successfully' })
      } else {
        const { error } = await supabase
          .from('continents')
          .insert(data as { name: string; code: string })
        
        if (error) throw error
        toast({ title: 'Success', description: 'Continent created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      let errorMessage = 'Failed to save continent'
      
      if (error.message?.includes('row-level security policy')) {
        errorMessage = 'You need to be logged in as a platform administrator to manage geographical data'
      } else if (error.message?.includes('unique constraint') || error.code === '23505') {
        errorMessage = 'A continent with this code already exists'
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
          <Globe className="w-5 h-5" />
          {editData ? 'Edit Continent' : 'Add New Continent'}
        </CardTitle>
        <CardDescription>
          {editData ? 'Update continent information' : 'Create a new continent entry'}
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
                  <FormLabel>Continent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="North America" {...field} disabled={isSubmitting} />
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
                  <FormLabel>Continent Code</FormLabel>
                  <FormControl>
                    <Input placeholder="NA" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editData ? 'Update Continent' : 'Create Continent')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}