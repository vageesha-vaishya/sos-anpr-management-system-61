import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

const forumDiscussionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category_id: z.string().min(1, 'Category is required'),
})

type ForumDiscussionFormData = z.infer<typeof forumDiscussionSchema>

interface ForumDiscussionFormProps {
  onSuccess?: () => void
  editData?: any
}

export const ForumDiscussionForm: React.FC<ForumDiscussionFormProps> = ({ onSuccess, editData }) => {
  const { toast } = useToast()
  const { userProfile } = useAuth()

  const form = useForm<ForumDiscussionFormData>({
    resolver: zodResolver(forumDiscussionSchema),
    defaultValues: {
      title: editData?.title || '',
      content: editData?.content || '',
      category_id: editData?.category_id || '',
    },
  })

  const onSubmit = async (data: ForumDiscussionFormData) => {
    if (!userProfile?.organization_id || !userProfile?.id) {
      toast({
        title: 'Error',
        description: 'User profile not found. Please log in again.',
        variant: 'destructive',
      })
      return
    }

    try {
      const discussionData = {
        ...data,
        organization_id: userProfile.organization_id,
        author_id: userProfile.id,
        status: 'active',
      }

      if (editData) {
        const { error } = await supabase
          .from('alerts')
          .update({
            title: data.title,
            message: data.content,
            type: 'announcement',
            severity: 'medium',
            organization_id: userProfile.organization_id,
            status: 'active'
          })
          .eq('id', editData.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Discussion updated successfully' })
      } else {
        const { error } = await supabase
          .from('alerts')
          .insert({
            title: data.title,
            message: data.content,
            type: 'announcement',
            severity: 'medium',
            organization_id: userProfile.organization_id,
            status: 'active'
          })
        
        if (error) throw error
        toast({ title: 'Success', description: 'Discussion created successfully' })
      }

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save discussion',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Discussion' : 'Start New Discussion'}</CardTitle>
        <CardDescription>
          {editData ? 'Update discussion information' : 'Share your thoughts with the community'}
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What's on your mind?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
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
                      <SelectItem value="general">General Discussion</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="events">Events & Social</SelectItem>
                      <SelectItem value="complaints">Complaints</SelectItem>
                      <SelectItem value="buy_sell">Buy/Sell/Rent</SelectItem>
                      <SelectItem value="notices">Official Notices</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your thoughts..." 
                      rows={4} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update Discussion' : 'Post Discussion'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}