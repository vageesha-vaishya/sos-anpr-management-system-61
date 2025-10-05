import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LocationForm } from "@/components/forms/LocationForm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Plus, Building, Users, Camera, Edit, Trash2, ChevronUp, ChevronDown, Grid, List } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Locations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [deletingLocation, setDeletingLocation] = useState<any>(null)
  const [locations, setLocations] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [filters, setFilters] = useState({
    locationName: '',
    organization: '',
    address: '',
    city: '',
    coordinates: ''
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const { toast } = useToast()

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        organizations(name),
        cities(name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Failed to fetch locations:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch locations',
        variant: 'destructive',
      })
    } else {
      setLocations(data || [])
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingLocation(null)
    fetchLocations()
  }

  const handleEdit = (location: any) => {
    setEditingLocation(location)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingLocation) return

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', deletingLocation.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      })
      
      fetchLocations()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete location',
        variant: 'destructive',
      })
    }
  }

  // Filtering and sorting logic
  const filteredAndSortedLocations = useMemo(() => {
    let filtered = locations.filter(location => {
      return (
        location.name?.toLowerCase().includes(filters.locationName.toLowerCase()) &&
        (location.organizations?.name || '').toLowerCase().includes(filters.organization.toLowerCase()) &&
        (location.address || '').toLowerCase().includes(filters.address.toLowerCase()) &&
        (location.cities?.name || '').toLowerCase().includes(filters.city.toLowerCase()) &&
        (location.latitude && location.longitude 
          ? `${location.latitude}, ${location.longitude}`.toLowerCase().includes(filters.coordinates.toLowerCase())
          : (location.Coordinates || '').toLowerCase().includes(filters.coordinates.toLowerCase())
        )
      )
    })

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = ''
        let bValue = ''

        switch (sortConfig.key) {
          case 'locationName':
            aValue = a.name || ''
            bValue = b.name || ''
            break
          case 'organization':
            aValue = a.organizations?.name || ''
            bValue = b.organizations?.name || ''
            break
          case 'address':
            aValue = a.address || ''
            bValue = b.address || ''
            break
          case 'city':
            aValue = a.cities?.name || ''
            bValue = b.cities?.name || ''
            break
          case 'coordinates':
            aValue = a.latitude && a.longitude 
              ? `${a.latitude}, ${a.longitude}` 
              : a.Coordinates || ''
            bValue = b.latitude && b.longitude 
              ? `${b.latitude}, ${b.longitude}` 
              : b.Coordinates || ''
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
  }, [locations, filters, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage your franchise locations and customer sites</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingLocation(null)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
            </DialogHeader>
            <LocationForm onSuccess={handleSuccess} editData={editingLocation} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'card')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Table Format
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Card Format
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('locationName')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Location Name
                      {sortConfig?.key === 'locationName' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('organization')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Organization
                      {sortConfig?.key === 'organization' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('address')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Address
                      {sortConfig?.key === 'address' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('city')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      City
                      {sortConfig?.key === 'city' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('coordinates')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Coordinates
                      {sortConfig?.key === 'coordinates' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="p-2">
                    <Input
                      placeholder="Filter by name..."
                      value={filters.locationName}
                      onChange={(e) => handleFilterChange('locationName', e.target.value)}
                      className="h-8"
                    />
                  </TableHead>
                  <TableHead className="p-2">
                    <Input
                      placeholder="Filter by organization..."
                      value={filters.organization}
                      onChange={(e) => handleFilterChange('organization', e.target.value)}
                      className="h-8"
                    />
                  </TableHead>
                  <TableHead className="p-2">
                    <Input
                      placeholder="Filter by address..."
                      value={filters.address}
                      onChange={(e) => handleFilterChange('address', e.target.value)}
                      className="h-8"
                    />
                  </TableHead>
                  <TableHead className="p-2">
                    <Input
                      placeholder="Filter by city..."
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="h-8"
                    />
                  </TableHead>
                  <TableHead className="p-2">
                    <Input
                      placeholder="Filter by coordinates..."
                      value={filters.coordinates}
                      onChange={(e) => handleFilterChange('coordinates', e.target.value)}
                      className="h-8"
                    />
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {location.name}
                      </div>
                    </TableCell>
                    <TableCell>{location.organizations?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {location.address}
                      </div>
                    </TableCell>
                    <TableCell>{location.cities?.name || '-'}</TableCell>
                    <TableCell>
                      {location.latitude && location.longitude 
                        ? `${location.latitude}, ${location.longitude}` 
                        : location.Coordinates || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(location)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingLocation(location)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLocations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                {location.name}
              </CardTitle>
              <CardDescription>{location.organizations?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{location.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">City: {location.cities?.name}</span>
                </div>
                {(location.latitude || location.longitude) && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Location: {location.latitude && location.longitude 
                        ? `${location.latitude}, ${location.longitude}` 
                        : location.Coordinates || 'Coordinates available'}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setDeletingLocation(location)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Location"
        description={`Are you sure you want to delete "${deletingLocation?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}

export default Locations