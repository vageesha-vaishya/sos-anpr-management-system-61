import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LocationForm } from "@/components/forms/LocationForm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MapPin, Plus, Building, Users, Camera, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Locations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [deletingLocation, setDeletingLocation] = useState<any>(null)
  const [locations, setLocations] = useState<any[]>([])
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
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