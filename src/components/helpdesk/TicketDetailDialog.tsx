import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TicketTimeline } from './TicketTimeline'
import { CommentSystem } from './CommentSystem'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { 
  Clock, 
  User, 
  Calendar, 
  AlertTriangle, 
  ArrowUp, 
  Save,
  Timer
} from 'lucide-react'

interface TicketDetailDialogProps {
  ticketId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketUpdated?: () => void
}

interface TicketDetail {
  id: string
  ticket_number: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  escalation_level: number
  total_time_spent: number
  due_date?: string
  tags: any
  created_at: string
  created_by_profile?: {
    full_name: string
    email: string
  }
  assigned_staff?: {
    full_name: string
    position: string
  }
}

interface StaffMember {
  id: string
  full_name: string
  position: string
}

export function TicketDetailDialog({ 
  ticketId, 
  open, 
  onOpenChange,
  onTicketUpdated 
}: TicketDetailDialogProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (ticketId && open) {
      loadTicketDetail()
      loadStaffMembers()
    }
  }, [ticketId, open])

  const loadTicketDetail = async () => {
    if (!ticketId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('helpdesk_tickets')
        .select(`
          *,
          created_by_profile:profiles!fk_helpdesk_tickets_created_by(full_name, email),
          assigned_staff:staff_members!fk_helpdesk_tickets_assigned_to(full_name, position)
        `)
        .eq('id', ticketId)
        .single()

      if (error) throw error
      setTicket(data)
    } catch (error) {
      console.error('Error loading ticket detail:', error)
      toast({
        title: "Error",
        description: "Failed to load ticket details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('id, full_name, position')
        .eq('status', 'active')
        .order('full_name')

      if (error) throw error
      setStaffMembers(data || [])
    } catch (error) {
      console.error('Error loading staff members:', error)
    }
  }

  const updateTicketField = async (field: string, value: any) => {
    if (!ticket) return

    try {
      const { error } = await supabase
        .from('helpdesk_tickets')
        .update({ [field]: value })
        .eq('id', ticket.id)

      if (error) throw error

      setTicket({ ...ticket, [field]: value })
      onTicketUpdated?.()
      
      toast({
        title: "Success",
        description: `Ticket ${field.replace('_', ' ')} updated successfully`
      })
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      toast({
        title: "Error",
        description: `Failed to update ticket ${field.replace('_', ' ')}`,
        variant: "destructive"
      })
    }
  }

  const logTimeSpent = async () => {
    if (!ticket || timeSpent <= 0) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Log the time as an action
      await supabase
        .from('ticket_action_history')
        .insert({
          ticket_id: ticket.id,
          action_by: user.id,
          action_type: 'commented',
          action_description: `Logged ${timeSpent} minutes of work time`,
          time_spent_minutes: timeSpent,
          resolution_details: resolutionNotes || undefined,
          is_internal: true
        })

      // Update total time spent
      const newTotalTime = (ticket.total_time_spent || 0) + timeSpent
      await updateTicketField('total_time_spent', newTotalTime)

      setTimeSpent(0)
      setResolutionNotes('')
      
      toast({
        title: "Success",
        description: `Logged ${timeSpent} minutes of work time`
      })
    } catch (error) {
      console.error('Error logging time:', error)
      toast({
        title: "Error",
        description: "Failed to log time",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-orange-500'
      case 'urgent': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500'
      case 'in_progress': return 'bg-purple-500'
      case 'pending': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  if (!ticket) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Loading Ticket Details...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-20 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {ticket.ticket_number} - {ticket.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[70vh] mt-4">
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => updateTicketField('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={ticket.priority}
                        onValueChange={(value) => updateTicketField('priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Assigned To</Label>
                      <Select
                        value={ticket.assigned_staff?.full_name || "unassigned"}
                        onValueChange={(value) => updateTicketField('assigned_to', value === "unassigned" ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.full_name} - {staff.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      {ticket.escalation_level > 0 && (
                        <Badge variant="destructive">
                          Level {ticket.escalation_level}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium">
                          {ticket.created_by_profile?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.created_by_profile?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Created: {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>

                    {ticket.due_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          Due: {format(new Date(ticket.due_date), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span className="text-sm">
                        Time Spent: {ticket.total_time_spent || 0} minutes
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{ticket.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <TicketTimeline ticketId={ticket.id} />
            </TabsContent>

            <TabsContent value="comments">
              <CommentSystem 
                ticketId={ticket.id}
                onCommentAdded={loadTicketDetail}
                isStaff={true}
              />
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              {/* Time Logging */}
              <Card>
                <CardHeader>
                  <CardTitle>Log Work Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Time Spent (minutes)</Label>
                    <Input
                      type="number"
                      value={timeSpent}
                      onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
                      placeholder="Enter minutes worked"
                    />
                  </div>
                  
                  <div>
                    <Label>Work Notes (optional)</Label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe the work performed..."
                    />
                  </div>
                  
                  <Button onClick={logTimeSpent} disabled={timeSpent <= 0}>
                    <Save className="h-4 w-4 mr-2" />
                    Log Time
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}