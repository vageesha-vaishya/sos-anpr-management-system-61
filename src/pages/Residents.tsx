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
import { Label } from '@/components/ui/label'
import { Users, Search, Plus, Edit, Trash2, Home, UserCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Resident {
  id: string
  full_name: string
  email: string
  phone: string | null
  unit_number: string | null
  building_name: string | null
  status: string
  move_in_date: string | null
  occupation: string | null
  emergency_contact: string | null
  created_at: string
}

export default function Residents() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResident, setEditingResident] = useState<Resident | null>(null)
  const { toast } = useToast()

  const loadResidents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'resident')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedData = data?.map(resident => ({
        id: resident.id,
        full_name: resident.full_name,
        email: resident.email,
        phone: resident.phone || '',
        unit_number: null, // Mock data since society_units table doesn't exist yet
        building_name: null, // Mock data
        status: resident.status,
        move_in_date: null, // Mock data since field doesn't exist yet
        occupation: null, // Mock data since field doesn't exist yet  
        emergency_contact: null, // Mock data since field doesn't exist yet
        created_at: resident.created_at
      }))

      setResidents(formattedData || [])
    } catch (error) {
      console.error('Error loading residents:', error)
      toast({
        title: 'Error',
        description: 'Failed to load residents',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResidents()
  }, [])

  const handleSaveResident = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    try {
      const status = formData.get('status') as string
      const residentData = {
        full_name: formData.get('full_name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        status: status as 'active' | 'inactive' | 'suspended',
        organization_id: '00000000-0000-0000-0000-000000000000', // Mock organization ID
      }

      if (editingResident) {
        const { error } = await supabase
          .from('profiles')
          .update(residentData)
          .eq('id', editingResident.id)
        if (error) throw error
        toast({ title: 'Success', description: 'Resident updated successfully' })
      } else {
        // For creating new residents, we need to use auth.signUp or handle this differently
        // For now, just show a message that this would create a new user account
        toast({ 
          title: 'Info', 
          description: 'New resident creation requires setting up user authentication first',
          variant: 'default'
        })
      }

      setIsDialogOpen(false)
      setEditingResident(null)
      loadResidents()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save resident',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteResident = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Success', description: 'Resident removed successfully' })
      loadResidents()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove resident',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'default'
    }
  }

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.building_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || resident.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const residentStats = {
    total: residents.length,
    active: residents.filter(r => r.status === 'active').length,
    inactive: residents.filter(r => r.status === 'inactive').length,
    new_this_month: residents.filter(r => {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      return new Date(r.created_at) > oneMonthAgo
    }).length,
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
          <h1 className="text-3xl font-bold">Resident Management</h1>
          <p className="text-muted-foreground">Manage community residents and their information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingResident(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingResident ? 'Edit Resident' : 'Add New Resident'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveResident} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={editingResident?.full_name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingResident?.email}
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
                    defaultValue={editingResident?.phone || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingResident?.status || 'active'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingResident ? 'Update' : 'Add'}
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
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residentStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{residentStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Home className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{residentStats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Plus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{residentStats.new_this_month}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search residents..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Residents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Residents Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Move-in Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{resident.full_name}</div>
                      <div className="text-sm text-muted-foreground">{resident.occupation}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{resident.email}</div>
                      <div className="text-sm text-muted-foreground">{resident.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{resident.unit_number || 'Not assigned'}</div>
                      <div className="text-sm text-muted-foreground">{resident.building_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(resident.status)}>
                      {resident.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {resident.move_in_date ? 
                      new Date(resident.move_in_date).toLocaleDateString() : 
                      'Not set'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingResident(resident)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResident(resident.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredResidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No residents found
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