import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CameraForm } from "@/components/forms/CameraForm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Camera, Plus, MapPin, Wifi, WifiOff, Settings, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Cameras = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState<any>(null)
  const [deletingCamera, setDeletingCamera] = useState<any>(null)
  const [cameras, setCameras] = useState<any[]>([])
  const { toast } = useToast()

  const fetchCameras = async () => {
    const { data, error } = await supabase
      .from('cameras')
      .select(`
        *,
        entry_gates(name, buildings(name, locations(name)))
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch cameras',
        variant: 'destructive',
      })
    } else {
      setCameras(data || [])
    }
  }

  useEffect(() => {
    fetchCameras()
  }, [])

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingCamera(null)
    fetchCameras()
  }

  const handleEdit = (camera: any) => {
    setEditingCamera(camera)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingCamera) return

    try {
      const { error } = await supabase
        .from('cameras')
        .delete()
        .eq('id', deletingCamera.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Camera deleted successfully',
      })
      
      fetchCameras()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete camera',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default'
      case 'offline': return 'destructive'
      case 'maintenance': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cameras</h1>
          <p className="text-muted-foreground">Monitor and manage SOS camera systems</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingCamera(null)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Camera
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</DialogTitle>
            </DialogHeader>
            <CameraForm onSuccess={handleSuccess} editData={editingCamera} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map((camera) => (
          <Card key={camera.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  {camera.name}
                </div>
                <Badge variant={getStatusColor(camera.status as any)}>
                  {camera.status}
                </Badge>
              </CardTitle>
              <CardDescription>Camera ID: CAM-{camera.id.toString().slice(-3)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{camera.entry_gates?.buildings?.locations?.name || 'Unknown Location'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {camera.status === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span>IP: {camera.ip_address}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(camera)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setDeletingCamera(camera)
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
        title="Delete Camera"
        description={`Are you sure you want to delete "${deletingCamera?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}

export default Cameras