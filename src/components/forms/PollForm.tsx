import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

const pollSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  options: z.array(z.string()).min(2, 'At least 2 options are required'),
  multiple_choice: z.boolean(),
  anonymous_voting: z.boolean(),
  end_date: z.string().optional(),
})

type PollFormData = z.infer<typeof pollSchema>

interface PollFormProps {
  onSuccess?: () => void
  editData?: any
}

export const PollForm: React.FC<PollFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: editData?.title || '',
      description: editData?.description || '',
      options: editData?.options || ['', ''],
      multiple_choice: editData?.multiple_choice || false,
      anonymous_voting: editData?.anonymous_voting || false,
      end_date: editData?.end_date || '',
    },
  })

  const addOption = () => {
    const currentOptions = form.getValues('options')
    form.setValue('options', [...currentOptions, ''])
  }

  const removeOption = (index: number) => {
    const currentOptions = form.getValues('options')
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== index)
      form.setValue('options', newOptions)
    }
  }

  const onSubmit = async (data: PollFormData) => {
    if (!userProfile?.organization_id || !userProfile?.id) {
      toast({
        title: 'Error',
        description: 'User profile not found. Please log in again.',
        variant: 'destructive',
      })
      return
    }

    try {
      const pollData = {
        title: data.title,
        description: data.description,
        organization_id: userProfile.organization_id,
        created_by: userProfile.id,
        options: data.options.filter(option => option.trim() !== ''),
        multiple_choice: data.multiple_choice,
        anonymous_voting: data.anonymous_voting,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
        status: 'active',
      }

      if (editData) {
        const { error } = await supabase
          .from('alerts')
          .update({
            title: data.title,
            message: data.description || `Poll: ${data.title}`,
            type: 'announcement',
            severity: 'medium',
            organization_id: userProfile.organization_id,
            status: 'active'
          })
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Poll updated successfully' })
      } else {
        const { error } = await supabase
          .from('alerts')
          .insert({
            title: data.title,
            message: data.description || `Poll: ${data.title}`,
            type: 'announcement',
            severity: 'medium',
            organization_id: userProfile.organization_id,
            status: 'active'
          })
        
        if (error) throw error
        toast({ title: 'Success', description: 'Poll created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save poll',
        variant: 'destructive',
      })
    }
  }

  const options = form.watch('options')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Poll' : 'Create New Poll'}</CardTitle>
        <CardDescription>
          {editData ? 'Update poll information' : 'Get community opinion on important matters'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poll Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Ask a question..." {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide context for your poll" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Poll Options</FormLabel>
              {options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options]
                      newOptions[index] = e.target.value
                      form.setValue('options', newOptions)
                    }}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="multiple_choice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow multiple choices</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anonymous_voting"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Anonymous voting</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update Poll' : 'Create Poll'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}