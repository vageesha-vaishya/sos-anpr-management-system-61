import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ResidentForm } from "@/components/forms/ResidentForm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Users as UsersIcon, Plus, MapPin, Edit, Trash2, Clock, Phone, ChevronUp, ChevronDown, Grid, List } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Residents = () => {
  const [residents, setResidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResident, setEditingResident] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [residentToDelete, setResidentToDelete] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [filters, setFilters] = useState({
    name: '',
    contact: '',
    unit: '',
    status: '',
    moveInDate: ''
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
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

  // Filter and sort residents
  const filteredAndSortedResidents = useMemo(() => {
    let filtered = residents.filter(resident => {
      return (
        resident.full_name?.toLowerCase().includes(filters.name.toLowerCase()) &&
        (resident.email?.toLowerCase().includes(filters.contact.toLowerCase()) || 
         resident.phone?.toLowerCase().includes(filters.contact.toLowerCase())) &&
        (resident.unit_number || '').toLowerCase().includes(filters.unit.toLowerCase()) &&
        resident.status?.toLowerCase().includes(filters.status.toLowerCase()) &&
        (resident.move_in_date ? new Date(resident.move_in_date).toLocaleDateString() : '').includes(filters.moveInDate)
      )
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue

        switch (sortConfig.key) {
          case 'name':
            aValue = a.full_name || ''
            bValue = b.full_name || ''
            break
          case 'contact':
            aValue = a.email || a.phone || ''
            bValue = b.email || b.phone || ''
            break
          case 'unit':
            aValue = a.unit_number || ''
            bValue = b.unit_number || ''
            break
          case 'status':
            aValue = a.status || ''
            bValue = b.status || ''
            break
          case 'moveInDate':
            aValue = a.move_in_date ? new Date(a.move_in_date) : new Date(0)
            bValue = b.move_in_date ? new Date(b.move_in_date) : new Date(0)
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [residents, filters, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }))
  }

  const residentStats = {
    total: residents.length,
    active: residents.filter(r => r.status === 'active').length,
    inactive: residents.filter(r => r.status === 'inactive').length,
    newThisMonth: residents.filter(r => {
      const moveInDate = new Date(r.move_in_date || r.created_at)
      const now = new Date()
      return moveInDate.getMonth() === now.getMonth() && moveInDate.getFullYear() === now.getFullYear()
    }).length
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
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residentStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{residentStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <MapPin className="h-4 w-4 text-yellow-600" />
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
            <div className="text-2xl font-bold text-blue-600">{residentStats.newThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Switcher */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'card')} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Table Format
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Card Format
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Residents Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center justify-between">
                        <span>Name</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('name')}
                          className="h-8 w-8 p-0"
                        >
                          {sortConfig.key === 'name' && sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Input
                        placeholder="Filter names..."
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        className="mt-2"
                      />
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center justify-between">
                        <span>Contact</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('contact')}
                          className="h-8 w-8 p-0"
                        >
                          {sortConfig.key === 'contact' && sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Input
                        placeholder="Filter contact..."
                        value={filters.contact}
                        onChange={(e) => handleFilterChange('contact', e.target.value)}
                        className="mt-2"
                      />
                    </TableHead>
                    <TableHead className="w-[150px]">
                      <div className="flex items-center justify-between">
                        <span>Unit</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('unit')}
                          className="h-8 w-8 p-0"
                        >
                          {sortConfig.key === 'unit' && sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Input
                        placeholder="Filter unit..."
                        value={filters.unit}
                        onChange={(e) => handleFilterChange('unit', e.target.value)}
                        className="mt-2"
                      />
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('status')}
                          className="h-8 w-8 p-0"
                        >
                          {sortConfig.key === 'status' && sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Input
                        placeholder="Filter status..."
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="mt-2"
                      />
                    </TableHead>
                    <TableHead className="w-[150px]">
                      <div className="flex items-center justify-between">
                        <span>Move-in Date</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('moveInDate')}
                          className="h-8 w-8 p-0"
                        >
                          {sortConfig.key === 'moveInDate' && sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Input
                        placeholder="Filter date..."
                        value={filters.moveInDate}
                        onChange={(e) => handleFilterChange('moveInDate', e.target.value)}
                        className="mt-2"
                      />
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedResidents.map((resident) => (
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
                  {filteredAndSortedResidents.length === 0 && (
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
        </TabsContent>

        {/* Card View */}
        <TabsContent value="card" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedResidents.map((resident) => (
              <Card key={resident.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {resident.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{resident.full_name}</CardTitle>
                        <CardDescription>{resident.occupation}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(resident.status)}>
                      {resident.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{resident.email}</span>
                  </div>
                  {resident.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{resident.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{resident.unit_number || 'Not assigned'}</span>
                    {resident.building_name && <span>• {resident.building_name}</span>}
                  </div>
                  {resident.move_in_date && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Moved in: {new Date(resident.move_in_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingResident(resident)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteResident(resident.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredAndSortedResidents.length === 0 && (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No residents found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Residents