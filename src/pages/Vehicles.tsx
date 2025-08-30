import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { VehicleWhitelistForm } from "@/components/forms/VehicleWhitelistForm"
import { VehicleBlacklistForm } from "@/components/forms/VehicleBlacklistForm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Shield, Car, Plus, Search, AlertTriangle, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Vehicles = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("whitelist")
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<any>(null)
  const [whitelistVehicles, setWhitelistVehicles] = useState<any[]>([])
  const [blacklistVehicles, setBlacklistVehicles] = useState<any[]>([])
  const { toast } = useToast()

  const fetchWhitelistVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicle_whitelist')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch whitelist vehicles',
        variant: 'destructive',
      })
    } else {
      setWhitelistVehicles(data || [])
    }
  }

  const fetchBlacklistVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicle_blacklist')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch blacklist vehicles',
        variant: 'destructive',
      })
    } else {
      setBlacklistVehicles(data || [])
    }
  }

  useEffect(() => {
    fetchWhitelistVehicles()
    fetchBlacklistVehicles()
  }, [])

  const handleSuccess = () => {
    setIsAddDialogOpen(false)
    setEditingVehicle(null)
    fetchWhitelistVehicles()
    fetchBlacklistVehicles()
  }

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setIsAddDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingVehicle) return

    try {
      const table = activeTab === 'whitelist' ? 'vehicle_whitelist' : 'vehicle_blacklist'
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', deletingVehicle.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Vehicle removed successfully',
      })
      
      if (activeTab === 'whitelist') {
        fetchWhitelistVehicles()
      } else {
        fetchBlacklistVehicles()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove vehicle',
        variant: 'destructive',
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage whitelisted and blacklisted vehicles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setEditingVehicle(null)
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle 
                    ? `Edit ${activeTab === "whitelist" ? "Whitelisted" : "Blacklisted"} Vehicle`
                    : `Add Vehicle to ${activeTab === "whitelist" ? "Whitelist" : "Blacklist"}`
                  }
                </DialogTitle>
              </DialogHeader>
              {activeTab === "whitelist" ? (
                <VehicleWhitelistForm onSuccess={handleSuccess} editData={editingVehicle} />
              ) : (
                <VehicleBlacklistForm onSuccess={handleSuccess} />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="whitelist" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
        </TabsList>

        <TabsContent value="whitelist">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whitelistVehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-green-500" />
                    {vehicle.license_plate}
                  </CardTitle>
                  <CardDescription>{vehicle.owner_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{vehicle.vehicle_type}</Badge>
                    <p className="text-sm text-muted-foreground">
                      Added: {new Date(vehicle.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDeletingVehicle(vehicle)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blacklist">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blacklistVehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    {vehicle.license_plate}
                  </CardTitle>
                  <CardDescription>{vehicle.reason}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant={getSeverityColor(vehicle.severity)}>
                      {vehicle.severity?.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Added: {new Date(vehicle.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDeletingVehicle(vehicle)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
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
        title="Remove Vehicle"
        description={`Are you sure you want to remove "${deletingVehicle?.license_plate}" from the ${activeTab}? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  )
}

export default Vehicles