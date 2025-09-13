import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, User, MessageSquare, ArrowUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface TicketAction {
  id: string
  action_type: string
  action_description: string
  previous_value?: any
  new_value?: any
  resolution_details?: string
  time_spent_minutes: number
  is_internal: boolean
  created_at: string
  action_by: string
  profile: {
    full_name: string
    email: string
  }
}

interface TicketComment {
  id: string
  comment_text: string
  author_type: string
  is_internal: boolean
  created_at: string
  profile: {
    full_name: string
    email: string
  }
}

interface TicketTimelineProps {
  ticketId: string
  showInternalActions?: boolean
}

export function TicketTimeline({ ticketId, showInternalActions = true }: TicketTimelineProps) {
  const [actions, setActions] = useState<TicketAction[]>([])
  const [comments, setComments] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimelineData()
  }, [ticketId])

  const loadTimelineData = async () => {
    try {
      // Load actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('ticket_action_history')
        .select(`
          *,
          profile:profiles!ticket_action_history_action_by_fkey(full_name, email)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })

      if (actionsError) throw actionsError

      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          profile:profiles!ticket_comments_author_id_fkey(full_name, email)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })

      if (commentsError) throw commentsError

      setActions(actionsData || [])
      setComments(commentsData || [])
    } catch (error) {
      console.error('Error loading timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return <AlertTriangle className="h-4 w-4" />
      case 'assigned':
        return <User className="h-4 w-4" />
      case 'status_changed':
        return <CheckCircle className="h-4 w-4" />
      case 'priority_changed':
        return <ArrowUp className="h-4 w-4" />
      case 'commented':
        return <MessageSquare className="h-4 w-4" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      case 'escalated':
        return <ArrowUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return 'bg-blue-500'
      case 'assigned':
        return 'bg-purple-500'
      case 'status_changed':
        return 'bg-green-500'
      case 'priority_changed':
        return 'bg-orange-500'
      case 'commented':
        return 'bg-gray-500'
      case 'resolved':
        return 'bg-green-600'
      case 'escalated':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  // Combine and sort actions and comments by timestamp
  const allEvents = [
    ...actions.filter(action => showInternalActions || !action.is_internal).map(action => ({
      ...action,
      type: 'action',
      timestamp: action.created_at
    })),
    ...comments.filter(comment => showInternalActions || !comment.is_internal).map(comment => ({
      ...comment,
      type: 'comment',
      timestamp: comment.created_at
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-4">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {allEvents.map((event, index) => (
              <div key={`${event.type}-${event.id}`} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      event.type === 'action' 
                        ? getActionColor((event as any).action_type)
                        : 'bg-blue-500'
                    }`}
                  >
                    {event.type === 'action' 
                      ? getActionIcon((event as any).action_type)
                      : <MessageSquare className="h-4 w-4" />
                    }
                  </div>
                  {index < allEvents.length - 1 && (
                    <div className="w-px h-12 bg-border mt-2"></div>
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {event.profile?.full_name || 'Unknown User'}
                      </span>
                      {event.type === 'action' && (event as any).is_internal && (
                        <Badge variant="secondary" className="text-xs">Internal</Badge>
                      )}
                      {event.type === 'comment' && (event as any).author_type === 'staff' && (
                        <Badge variant="outline" className="text-xs">Staff</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  {event.type === 'action' ? (
                    <div>
                      <p className="text-sm mb-1">
                        {(event as any).action_description}
                      </p>
                      {(event as any).resolution_details && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <p className="text-sm">
                            <strong>Resolution:</strong> {(event as any).resolution_details}
                          </p>
                        </div>
                      )}
                      {(event as any).time_spent_minutes > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Time spent: {(event as any).time_spent_minutes} minutes
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">
                        {(event as any).comment_text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}