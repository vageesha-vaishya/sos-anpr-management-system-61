import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Wrench, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock,
  Star,
  Phone
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ServiceRequest {
  id: string
  service_type: string
  description: string
  preferred_date: string
  preferred_time: string
  status: string
  urgency: string
  contact_person: string
  contact_phone: string
  created_at: string
}

export default function HomeServices() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null)
  const { toast } = useToast()

  // Mock data for now
  useEffect(() => {
    const mockData: ServiceRequest[] = [
      {
        id: '1',
        service_type: 'Plumbing',
        description: 'Kitchen sink repair needed',
        preferred_date: '2024-01-15',
        preferred_time: '10:00',
        status: 'pending',
        urgency: 'medium',
        contact_person: 'John Doe',
        contact_phone: '+91 9876543210',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        service_type: 'Electrical',
        description: 'AC maintenance required',
        preferred_date: '2024-01-16',
        preferred_time: '14:00',
        status: 'scheduled',
        urgency: 'low',
        contact_person: 'Jane Smith',
        contact_phone: '+91 9876543211',
        created_at: '2024-01-11T10:00:00Z'
      }
    ]
    setRequests(mockData)
  }, [])

  const handleSaveRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    try {
      const requestData: ServiceRequest = {
        id: editingRequest ? editingRequest.id : Math.random().toString(),
        service_type: formData.get('service_type') as string,
        description: formData.get('description') as string,
        preferred_date: formData.get('preferred_date') as string,
        preferred_time: formData.get('preferred_time') as string,
        urgency: formData.get('urgency') as string,
        contact_person: formData.get('contact_person') as string,
        contact_phone: formData.get('contact_phone') as string,
        status: editingRequest?.status || 'pending',
        created_at: editingRequest?.created_at || new Date().toISOString()
      }

      if (editingRequest) {
        setRequests(prev => prev.map(req => req.id === editingRequest.id ? requestData : req))
        toast({ title: 'Success', description: 'Service request updated successfully' })
      } else {
        setRequests(prev => [...prev, requestData])
        toast({ title: 'Success', description: 'Service request created successfully' })
      }

      setIsDialogOpen(false)
      setEditingRequest(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save service request',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteRequest = async (id: string) => {
    try {
      setRequests(prev => prev.filter(req => req.id !== id))
      toast({ title: 'Success', description: 'Service request deleted successfully' })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete service request',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'scheduled': return 'default'
      case 'in_progress': return 'default'
      case 'completed': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const serviceStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    scheduled: requests.filter(r => r.status === 'scheduled').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Home Services</h1>
          <p className="text-muted-foreground">Request and manage home service bookings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRequest(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Service Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRequest ? 'Edit Service Request' : 'New Service Request'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select name="service_type" defaultValue={editingRequest?.service_type || 'plumbing'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="painting">Painting</SelectItem>
                      <SelectItem value="carpentry">Carpentry</SelectItem>
                      <SelectItem value="ac_repair">AC Repair</SelectItem>
                      <SelectItem value="pest_control">Pest Control</SelectItem>
                      <SelectItem value="appliance_repair">Appliance Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select name="urgency" defaultValue={editingRequest?.urgency || 'medium'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingRequest?.description}
                  placeholder="Describe the service required..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferred_date">Preferred Date</Label>
                  <Input
                    id="preferred_date"
                    name="preferred_date"
                    type="date"
                    defaultValue={editingRequest?.preferred_date}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preferred_time">Preferred Time</Label>
                  <Input
                    id="preferred_time"
                    name="preferred_time"
                    type="time"
                    defaultValue={editingRequest?.preferred_time}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    defaultValue={editingRequest?.contact_person}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    defaultValue={editingRequest?.contact_phone}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRequest ? 'Update' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{serviceStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{serviceStats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{serviceStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Service Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Preferred Date/Time</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="capitalize">{request.service_type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm truncate">{request.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.contact_person}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {request.contact_phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{new Date(request.preferred_date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">{request.preferred_time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingRequest(request)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No service requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}