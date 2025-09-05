import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
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
  Phone,
  MapPin
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ServiceProvider {
  id: string
  name: string
  service_type: string
  phone: string
  email: string | null
  rating: number
  available_hours: string
  pricing: string
  description: string | null
  is_verified: boolean
  created_at: string
}

interface ServiceBooking {
  id: string
  service_provider_id: string
  service_date: string
  service_time: string
  status: string
  notes: string | null
  cost: number | null
  provider_name?: string
  provider_phone?: string
}

export default function HomeServices() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all')
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load service providers
      const { data: providersData, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false })

      if (providersError) throw providersError

      // Load service bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_bookings')
        .select(`
          *,
          service_providers(name, phone)
        `)
        .order('service_date', { ascending: false })

      if (bookingsError) throw bookingsError

      setProviders(providersData || [])
      
      const formattedBookings = bookingsData?.map(booking => ({
        ...booking,
        provider_name: booking.service_providers?.name,
        provider_phone: booking.service_providers?.phone
      })) || []
      
      setBookings(formattedBookings)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load service data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveProvider = async (formData: FormData) => {
    try {
      const providerData = {
        name: formData.get('name') as string,
        service_type: formData.get('service_type') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string || null,
        rating: parseFloat(formData.get('rating') as string) || 0,
        available_hours: formData.get('available_hours') as string,
        pricing: formData.get('pricing') as string,
        description: formData.get('description') as string || null,
        is_verified: formData.get('is_verified') === 'true',
      }

      if (editingProvider) {
        const { error } = await supabase
          .from('service_providers')
          .update(providerData)
          .eq('id', editingProvider.id)
        if (error) throw error
        toast({ title: 'Success', description: 'Service provider updated successfully' })
      } else {
        const { error } = await supabase
          .from('service_providers')
          .insert(providerData)
        if (error) throw error
        toast({ title: 'Success', description: 'Service provider added successfully' })
      }

      setIsProviderDialogOpen(false)
      setEditingProvider(null)
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save service provider',
        variant: 'destructive',
      })
    }
  }

  const handleBookService = async (formData: FormData) => {
    try {
      const bookingData = {
        service_provider_id: formData.get('service_provider_id') as string,
        service_date: formData.get('service_date') as string,
        service_time: formData.get('service_time') as string,
        notes: formData.get('notes') as string || null,
        cost: parseFloat(formData.get('cost') as string) || null,
        status: 'scheduled'
      }

      const { error } = await supabase
        .from('service_bookings')
        .insert(bookingData)

      if (error) throw error
      
      toast({ title: 'Success', description: 'Service booked successfully' })
      setIsBookingDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to book service',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Success', description: 'Service provider removed successfully' })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove service provider',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default'
      case 'in_progress': return 'default'
      case 'completed': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = serviceTypeFilter === 'all' || provider.service_type === serviceTypeFilter
    return matchesSearch && matchesType
  })

  const serviceTypes = [...new Set(providers.map(p => p.service_type))]

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
          <p className="text-muted-foreground">Book home services and manage service providers</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Book Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book a Service</DialogTitle>
              </DialogHeader>
              <form action={handleBookService} className="space-y-4">
                <div>
                  <Label htmlFor="service_provider_id">Service Provider</Label>
                  <Select name="service_provider_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name} - {provider.service_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_date">Service Date</Label>
                    <Input
                      id="service_date"
                      name="service_date"
                      type="date"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_time">Service Time</Label>
                    <Input
                      id="service_time"
                      name="service_time"
                      type="time"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cost">Estimated Cost (₹)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    placeholder="Enter estimated cost"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special requirements or notes"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Book Service</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setEditingProvider(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProvider ? 'Edit Service Provider' : 'Add Service Provider'}
                </DialogTitle>
              </DialogHeader>
              <form action={handleSaveProvider} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Provider Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingProvider?.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_type">Service Type</Label>
                    <Input
                      id="service_type"
                      name="service_type"
                      defaultValue={editingProvider?.service_type}
                      placeholder="e.g., Plumbing, Electrical, Cleaning"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={editingProvider?.phone}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingProvider?.email || ''}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      defaultValue={editingProvider?.rating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="available_hours">Available Hours</Label>
                    <Input
                      id="available_hours"
                      name="available_hours"
                      defaultValue={editingProvider?.available_hours}
                      placeholder="e.g., 9 AM - 6 PM"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing">Pricing</Label>
                    <Input
                      id="pricing"
                      name="pricing"
                      defaultValue={editingProvider?.pricing}
                      placeholder="e.g., ₹500/hour"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProvider?.description || ''}
                    placeholder="Brief description of services"
                  />
                </div>
                <div>
                  <Label htmlFor="is_verified">Verified Provider</Label>
                  <Select name="is_verified" defaultValue={editingProvider?.is_verified?.toString() || 'false'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsProviderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProvider ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => 
                new Date(b.service_date).getMonth() === new Date().getMonth()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Service Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Types</SelectItem>
            {serviceTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Service Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {provider.available_hours}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{provider.service_type}</TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {provider.phone}
                      </div>
                      {provider.email && (
                        <div className="text-sm text-muted-foreground">{provider.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {provider.rating.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>{provider.pricing}</TableCell>
                  <TableCell>
                    <Badge variant={provider.is_verified ? 'default' : 'secondary'}>
                      {provider.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProvider(provider)
                          setIsProviderDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProvider(provider.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProviders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No service providers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Service Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.slice(0, 5).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.provider_name}</div>
                      <div className="text-sm text-muted-foreground">{booking.provider_phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(booking.service_date).toLocaleDateString()}</TableCell>
                  <TableCell>{booking.service_time}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.cost ? `₹${booking.cost.toLocaleString()}` : 'TBD'}
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No bookings found
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