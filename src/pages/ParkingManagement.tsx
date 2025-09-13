import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Car, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Plus,
  DollarSign,
  MapPin,
  Home,
  CheckCircle
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'

interface ParkingSlot {
  id: string
  slot_number: string
  slot_type: string
  floor_level: number | null
  area: string | null
  is_reserved: boolean
  monthly_fee: number | null
  status: string
  notes: string | null
  created_at: string
  building?: {
    name: string
    location: {
      name: string
    }
  }
  assigned_unit?: {
    unit_number: string
  }
}

interface Building {
  id: string
  name: string
}

interface SocietyUnit {
  id: string
  unit_number: string
}

export default function ParkingManagement() {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [societyUnits, setSocietyUnits] = useState<SocietyUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null)
  const { toast } = useToast()
  const { userProfile } = useAuth()

  const loadParkingSlots = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('parking_slots')
        .select(`
          *,
          building:buildings(name, location:locations(name)),
          assigned_unit:society_units(unit_number)
        `)
        .order('slot_number')

      if (error) throw error
      setParkingSlots(data || [])
    } catch (error) {
      console.error('Error loading parking slots:', error)
      toast({
        title: 'Error',
        description: 'Failed to load parking slots',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name')
        .order('name')

      if (error) throw error
      setBuildings(data || [])
    } catch (error) {
      console.error('Error loading buildings:', error)
    }
  }

  const loadSocietyUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('society_units')
        .select('id, unit_number')
        .order('unit_number')

      if (error) throw error
      setSocietyUnits(data || [])
    } catch (error) {
      console.error('Error loading society units:', error)
    }
  }

  useEffect(() => {
    loadParkingSlots()
    loadBuildings()
    loadSocietyUnits()
  }, [])

  const handleSuccess = () => {
    setDialogOpen(false)
    setEditingSlot(null)
    loadParkingSlots()
  }

  const handleEdit = (slot: ParkingSlot) => {
    setEditingSlot(slot)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('parking_slots')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Parking slot deleted successfully',
      })
      loadParkingSlots()
    } catch (error: any) {
      console.error('Error deleting parking slot:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete parking slot',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default'
      case 'occupied': return 'secondary'
      case 'reserved': return 'outline'
      case 'maintenance': return 'destructive'
      default: return 'default'
    }
  }

  const filteredSlots = parkingSlots.filter(slot => {
    const matchesSearch = 
      slot.slot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.slot_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slot.area && slot.area.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || slot.status === statusFilter
    const matchesType = typeFilter === 'all' || slot.slot_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const slotStats = {
    total: parkingSlots.length,
    available: parkingSlots.filter(s => s.status === 'available').length,
    occupied: parkingSlots.filter(s => s.status === 'occupied').length,
    totalRevenue: parkingSlots.reduce((sum, s) => sum + (s.monthly_fee || 0), 0),
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
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
          <h1 className="text-3xl font-bold">Parking Management</h1>
          <p className="text-muted-foreground">
            Manage parking slots and assignments
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSlot(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Parking Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? 'Edit Parking Slot' : 'Add New Parking Slot'}
              </DialogTitle>
            </DialogHeader>
            <ParkingSlotForm 
              slot={editingSlot} 
              onSuccess={handleSuccess}
              organizationId={userProfile?.organization_id}
              buildings={buildings}
              societyUnits={societyUnits}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slotStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{slotStats.available}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{slotStats.occupied}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${slotStats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parking slots..."
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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="handicap">Handicap</SelectItem>
            <SelectItem value="visitor">Visitor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Parking Slots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parking Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Unit</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">{slot.slot_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{slot.slot_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{slot.building?.name}</div>
                      <div className="text-muted-foreground">
                        {slot.building?.location?.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{slot.floor_level || 'Ground'}</TableCell>
                  <TableCell>{slot.area || 'General'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(slot.status)}>
                      {slot.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {slot.assigned_unit ? (
                      <Badge variant="secondary">
                        {slot.assigned_unit.unit_number}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    ${slot.monthly_fee?.toLocaleString() || '0'}/month
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(slot)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(slot.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSlots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No parking slots found
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

// Parking Slot Form Component
const ParkingSlotForm = ({ slot, onSuccess, organizationId, buildings, societyUnits }: {
  slot: ParkingSlot | null
  onSuccess: () => void
  organizationId?: string
  buildings: Building[]
  societyUnits: SocietyUnit[]
}) => {
  const [formData, setFormData] = useState({
    slot_number: slot?.slot_number || '',
    slot_type: slot?.slot_type || 'standard',
    building_id: slot?.building?.name || '',
    floor_level: slot?.floor_level || '',
    area: slot?.area || '',
    is_reserved: slot?.is_reserved || false,
    assigned_unit_id: '',
    monthly_fee: slot?.monthly_fee || '',
    status: slot?.status || 'available',
    notes: slot?.notes || ''
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationId) return

    setLoading(true)
    try {
      const slotData = {
        ...formData,
        organization_id: organizationId,
        building_id: formData.building_id || null,
        assigned_unit_id: formData.assigned_unit_id === 'unassigned' || !formData.assigned_unit_id ? null : formData.assigned_unit_id,
        floor_level: formData.floor_level ? parseInt(formData.floor_level.toString()) : null,
        monthly_fee: formData.monthly_fee ? parseFloat(formData.monthly_fee.toString()) : null,
      }

      if (slot) {
        const { error } = await supabase
          .from('parking_slots')
          .update(slotData)
          .eq('id', slot.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Parking slot updated successfully' })
      } else {
        const { error } = await supabase
          .from('parking_slots')
          .insert([slotData])
        
        if (error) throw error
        toast({ title: 'Success', description: 'Parking slot created successfully' })
      }
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save parking slot',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Slot Number</label>
          <Input
            value={formData.slot_number}
            onChange={(e) => setFormData({...formData, slot_number: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Slot Type</label>
          <Select value={formData.slot_type} onValueChange={(value) => setFormData({...formData, slot_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="handicap">Handicap</SelectItem>
              <SelectItem value="visitor">Visitor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Building</label>
          <Select value={formData.building_id} onValueChange={(value) => setFormData({...formData, building_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select building" />
            </SelectTrigger>
            <SelectContent>
              {buildings.map(building => (
                <SelectItem key={building.id} value={building.id}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Floor Level</label>
          <Input
            type="number"
            value={formData.floor_level}
            onChange={(e) => setFormData({...formData, floor_level: e.target.value})}
            placeholder="0 for ground floor"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Area</label>
          <Input
            value={formData.area}
            onChange={(e) => setFormData({...formData, area: e.target.value})}
            placeholder="e.g., North Wing, South Wing"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Assigned Unit</label>
          <Select value={formData.assigned_unit_id} onValueChange={(value) => setFormData({...formData, assigned_unit_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {societyUnits.map(unit => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.unit_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Monthly Fee</label>
          <Input
            type="number"
            step="0.01"
            value={formData.monthly_fee}
            onChange={(e) => setFormData({...formData, monthly_fee: e.target.value})}
            placeholder="0.00"
          />
        </div>
        
        <div className="col-span-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            placeholder="Additional notes about this parking slot"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (slot ? 'Update Slot' : 'Create Slot')}
        </Button>
      </div>
    </form>
  )
}