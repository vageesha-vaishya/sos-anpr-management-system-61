
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { ChargeCategoryForm } from "@/components/forms/ChargeCategoryForm"
import { ServiceTypeForm } from "@/components/forms/ServiceTypeForm"
import { AmenityForm } from "@/components/forms/AmenityForm"
import { GeographyManager } from "@/components/forms/GeographyManager"
import { Plus, Settings, Trash2, Edit, Database, Globe } from "lucide-react"

interface ChargeCategory {
  id: string
  name: string
  charge_type: string
  description: string
  base_amount: number
  billing_cycle: string
  is_active: boolean
  organization_id: string
  created_at: string
  updated_at: string
}

interface ServiceType {
  id: string
  service_name: string
  service_category: string
  description: string
  unit_type: string
  default_rate: number
  billing_model: string
  is_active: boolean
  organization_id: string
  created_at: string
  updated_at: string
}

interface Amenity {
  id: string
  name: string
  amenity_type: string
  description: string
  capacity: number
  booking_required: boolean
  operating_hours: any
  pricing: any
  is_active: boolean
  building_id: string
  created_at: string
  updated_at: string
}

export default function MasterDataManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [chargeCategories, setChargeCategories] = useState<ChargeCategory[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  
  // Form states
  const [showChargeCategoryForm, setShowChargeCategoryForm] = useState(false)
  const [showServiceTypeForm, setShowServiceTypeForm] = useState(false)
  const [showAmenityForm, setShowAmenityForm] = useState(false)
  
  // Selected items for editing
  const [selectedChargeCategory, setSelectedChargeCategory] = useState<ChargeCategory | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null)
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch charge categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("charge_categories")
        .select("*")
        .order("name")

      if (categoriesError) throw categoriesError

      // Fetch service types
      const { data: serviceTypesData, error: serviceTypesError } = await supabase
        .from("service_types")
        .select("*")
        .order("service_name")

      if (serviceTypesError) throw serviceTypesError

      // Fetch amenities
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from("amenities")
        .select("*")
        .order("name")

      if (amenitiesError) throw amenitiesError

      setChargeCategories(categoriesData || [])
      setServiceTypes(serviceTypesData || [])
      setAmenities(amenitiesData || [])

    } catch (error: any) {
      console.error("Error fetching master data:", error)
      toast({
        title: "Error",
        description: "Failed to load master data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChargeCategorySuccess = () => {
    setShowChargeCategoryForm(false)
    setSelectedChargeCategory(null)
    fetchData()
  }

  const handleServiceTypeSuccess = () => {
    setShowServiceTypeForm(false)
    setSelectedServiceType(null)
    fetchData()
  }

  const handleAmenitySuccess = () => {
    setShowAmenityForm(false)
    setSelectedAmenity(null)
    fetchData()
  }

  const deleteChargeCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this charge category?")) return

    try {
      const { error } = await supabase
        .from("charge_categories")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({ title: "Success", description: "Charge category deleted successfully" })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete charge category",
        variant: "destructive",
      })
    }
  }

  const deleteServiceType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service type?")) return

    try {
      const { error } = await supabase
        .from("service_types")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({ title: "Success", description: "Service type deleted successfully" })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service type",
        variant: "destructive",
      })
    }
  }

  const deleteAmenity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this amenity?")) return

    try {
      const { error } = await supabase
        .from("amenities")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({ title: "Success", description: "Amenity deleted successfully" })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete amenity",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data Management</h1>
          <p className="text-muted-foreground">Manage charge categories, service types, amenities, and geographical data</p>
        </div>
        <Database className="h-8 w-8 text-muted-foreground" />
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Charge Categories</TabsTrigger>
          <TabsTrigger value="services">Service Types</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Charge Categories</h2>
            <Dialog open={showChargeCategoryForm} onOpenChange={setShowChargeCategoryForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedChargeCategory ? "Edit Charge Category" : "Add New Charge Category"}
                  </DialogTitle>
                </DialogHeader>
                <ChargeCategoryForm
                  editData={selectedChargeCategory}
                  organizationId={user?.user_metadata?.organization_id || ""}
                  onSuccess={handleChargeCategorySuccess}
                  onCancel={() => {
                    setShowChargeCategoryForm(false)
                    setSelectedChargeCategory(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Base Amount</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chargeCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="capitalize">{category.charge_type}</TableCell>
                      <TableCell>${category.base_amount}</TableCell>
                      <TableCell className="capitalize">{category.billing_cycle?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedChargeCategory(category)
                              setShowChargeCategoryForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteChargeCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Service Types</h2>
            <Dialog open={showServiceTypeForm} onOpenChange={setShowServiceTypeForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service Type
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedServiceType ? "Edit Service Type" : "Add New Service Type"}
                  </DialogTitle>
                </DialogHeader>
                <ServiceTypeForm
                  editData={selectedServiceType}
                  organizationId={user?.user_metadata?.organization_id || ""}
                  onSuccess={handleServiceTypeSuccess}
                  onCancel={() => {
                    setShowServiceTypeForm(false)
                    setSelectedServiceType(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit Type</TableHead>
                    <TableHead>Default Rate</TableHead>
                    <TableHead>Billing Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceTypes.map((serviceType) => (
                    <TableRow key={serviceType.id}>
                      <TableCell className="font-medium">{serviceType.service_name}</TableCell>
                      <TableCell className="capitalize">{serviceType.service_category}</TableCell>
                      <TableCell className="capitalize">{serviceType.unit_type.replace('_', ' ')}</TableCell>
                      <TableCell>${serviceType.default_rate}</TableCell>
                      <TableCell className="capitalize">{serviceType.billing_model.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={serviceType.is_active ? "default" : "secondary"}>
                          {serviceType.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedServiceType(serviceType)
                              setShowServiceTypeForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteServiceType(serviceType.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Amenities</h2>
            <Dialog open={showAmenityForm} onOpenChange={setShowAmenityForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Amenity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedAmenity ? "Edit Amenity" : "Add New Amenity"}
                  </DialogTitle>
                </DialogHeader>
                <AmenityForm
                  editData={selectedAmenity}
                  organizationId={user?.user_metadata?.organization_id || ""}
                  onSuccess={handleAmenitySuccess}
                  onCancel={() => {
                    setShowAmenityForm(false)
                    setSelectedAmenity(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amenity Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Booking Required</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amenities.map((amenity) => (
                    <TableRow key={amenity.id}>
                      <TableCell className="font-medium">{amenity.name}</TableCell>
                      <TableCell className="capitalize">{amenity.amenity_type.replace('_', ' ')}</TableCell>
                      <TableCell>{amenity.capacity} persons</TableCell>
                      <TableCell>
                        <Badge variant={amenity.booking_required ? "default" : "outline"}>
                          {amenity.booking_required ? "Required" : "Not Required"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={amenity.is_active ? "default" : "secondary"}>
                          {amenity.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAmenity(amenity)
                              setShowAmenityForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAmenity(amenity.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Geographic Data Management</h2>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
          <GeographyManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
