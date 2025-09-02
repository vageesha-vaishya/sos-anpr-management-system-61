import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Plus, X, Vote } from 'lucide-react'

const pollFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  poll_type: z.enum(['single_choice', 'multiple_choice']),
  end_date: z.string().optional(),
  is_anonymous: z.boolean().default(false),
  options: z.array(z.object({
    option_text: z.string().min(1, 'Option text is required')
  })).min(2, 'At least 2 options are required'),
})

type PollFormValues = z.infer<typeof pollFormSchema>

interface PollFormProps {
  onSuccess?: () => void
  editData?: any
  trigger?: React.ReactNode
}

export const PollForm: React.FC<PollFormProps> = ({ onSuccess, editData, trigger }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: editData?.title || '',
      description: editData?.description || '',
      poll_type: editData?.poll_type || 'single_choice',
      end_date: editData?.end_date ? new Date(editData.end_date).toISOString().split('T')[0] : '',
      is_anonymous: editData?.is_anonymous || false,
      options: editData?.poll_options || [{ option_text: '' }, { option_text: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  })

  const onSubmit = async (values: PollFormValues) => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userData.user?.id)
        .single()

      const pollData = {
        title: values.title,
        description: values.description || null,
        poll_type: values.poll_type,
        end_date: values.end_date ? new Date(values.end_date).toISOString() : null,
        is_anonymous: values.is_anonymous,
        created_by: userData.user?.id,
        organization_id: profile?.organization_id,
      }

      if (editData?.id) {
        const { error } = await (supabase as any)
          .from('community_polls')
          .update(pollData)
          .eq('id', editData.id)

        if (error) throw error

        // Update poll options
        await (supabase as any).from('poll_options').delete().eq('poll_id', editData.id)
        
        const optionsData = values.options.map(option => ({
          poll_id: editData.id,
          option_text: option.option_text,
          vote_count: 0
        }))

        await (supabase as any).from('poll_options').insert(optionsData)

        toast({
          title: 'Success',
          description: 'Poll updated successfully',
        })
      } else {
        const { data: pollResult, error } = await (supabase as any)
          .from('community_polls')
          .insert([pollData])
          .select()
          .single()

        if (error) throw error

        // Insert poll options
        const optionsData = values.options.map(option => ({
          poll_id: pollResult.id,
          option_text: option.option_text,
          vote_count: 0
        }))

        await (supabase as any).from('poll_options').insert(optionsData)

        toast({
          title: 'Success',
          description: 'Poll created successfully',
        })
      }

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving poll:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save poll',
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
            <Vote className="h-4 w-4 mr-2" />
            Create Poll
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Poll' : 'Create New Poll'}
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
                      <FormLabel>Poll Title</FormLabel>
                      <FormControl>
                        <Input placeholder="What should we vote on?" {...field} />
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
                        <Textarea 
                          placeholder="Provide more context about this poll..."
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
                    name="poll_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poll Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select poll type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single_choice">Single Choice</SelectItem>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_anonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Anonymous Voting</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Hide voter identities for this poll
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Poll Options</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ option_text: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`options.${index}.option_text`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Input 
                                placeholder={`Option ${index + 1}`} 
                                {...field} 
                              />
                            </FormControl>
                            {fields.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

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
                    {editData ? 'Update Poll' : 'Create Poll'}
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