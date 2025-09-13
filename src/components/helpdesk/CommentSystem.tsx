import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { MessageSquare, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CommentSystemProps {
  ticketId: string
  onCommentAdded?: () => void
  isStaff?: boolean
}

export function CommentSystem({ ticketId, onCommentAdded, isStaff = false }: CommentSystemProps) {
  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to comment",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          author_id: user.id,
          comment_text: comment,
          is_internal: isStaff ? isInternal : false,
          author_type: isStaff ? 'staff' : 'customer'
        })

      if (error) throw error

      // Also log this as an action
      await supabase
        .from('ticket_action_history')
        .insert({
          ticket_id: ticketId,
          action_by: user.id,
          action_type: 'commented',
          action_description: `Added a ${isInternal ? 'internal' : 'public'} comment`,
          is_internal: isInternal
        })

      setComment('')
      setIsInternal(false)
      onCommentAdded?.()
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Add Comment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
        
        {isStaff && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="internal"
              checked={isInternal}
              onCheckedChange={(checked) => setIsInternal(checked as boolean)}
            />
            <label
              htmlFor="internal"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Internal comment (not visible to customer)
            </label>
          </div>
        )}
        
        <Button 
          onClick={handleSubmitComment} 
          disabled={loading || !comment.trim()}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Adding Comment...' : 'Add Comment'}
        </Button>
      </CardContent>
    </Card>
  )
}