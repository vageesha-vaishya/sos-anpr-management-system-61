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
import { SocietyUnitForm } from "@/components/forms/SocietyUnitForm"
import { MaintenanceChargeForm } from "@/components/forms/MaintenanceChargeForm"
import { Plus, Home, DollarSign, Zap, Calendar, FileText } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface SocietyUnit {
  id: string
  unit_number: string
  unit_type: string
  owner_name: string
  tenant_name: string
  area_sqft: number
  monthly_rate_per_sqft: number
  monthly_flat_rate: number
  parking_slots: number
  status: string
  created_at: string
}

interface MaintenanceCharge {
  id: string
  unit_id: string
  charge_type: string
  amount: number
  billing_month: string
  due_date: string
  paid_date: string
  status: string
  description: string
  unit: {
    unit_number: string
    unit_type: string
  } | null
}

export default function SocietyManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [units, setUnits] = useState<SocietyUnit[]>([])
  const [charges, setCharges] = useState<MaintenanceCharge[]>([])
  const [loading, setLoading] = useState(true)
  const [showUnitForm, setShowUnitForm] = useState(false)
  const [showChargeForm, setShowChargeForm] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<SocietyUnit | null>(null)
  const [selectedCharge, setSelectedCharge] = useState<MaintenanceCharge | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    totalRevenue: 0,
    pendingCharges: 0,
    collectionRate: 0,
  })

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch society units
      const { data: unitsData, error: unitsError } = await supabase
        .from("society_units")
        .select("*")
        .order("unit_number")

      if (unitsError) throw unitsError

      // Fetch maintenance charges with unit details
      const { data: chargesData, error: chargesError } = await supabase
        .from("maintenance_charges")
        .select(`
          *,
          unit:society_units(unit_number, unit_type)
        `)
        .order("due_date", { ascending: false })

      if (chargesError) throw chargesError

      setUnits(unitsData || [])
      setCharges((chargesData as any) || [])

      // Calculate stats
      const totalUnits = unitsData?.length || 0
      const occupiedUnits = unitsData?.filter(unit => unit.status === "occupied").length || 0
      const vacantUnits = unitsData?.filter(unit => unit.status === "vacant").length || 0
      
      const totalRevenue = chargesData?.filter(charge => charge.status === "paid")
        .reduce((sum, charge) => sum + charge.amount, 0) || 0
      
      const pendingCharges = chargesData?.filter(charge => charge.status === "pending").length || 0
      const totalCharges = chargesData?.length || 0
      const paidCharges = chargesData?.filter(charge => charge.status === "paid").length || 0
      const collectionRate = totalCharges > 0 ? Math.round((paidCharges / totalCharges) * 100) : 0

      setStats({
        totalUnits,
        occupiedUnits,
        vacantUnits,
        totalRevenue,
        pendingCharges,
        collectionRate,
      })

    } catch (error: any) {
      console.error("Error fetching society data:", error)
      toast({
        title: "Error",
        description: "Failed to load society management data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnitSuccess = () => {
    setShowUnitForm(false)
    setSelectedUnit(null)
    fetchData()
  }

  const handleChargeSuccess = () => {
    setShowChargeForm(false)
    setSelectedCharge(null)
    fetchData()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "occupied":
      case "paid":
        return "default"
      case "vacant":
      case "pending":
        return "secondary"
      case "maintenance":
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Society Management</h1>
          <p className="text-muted-foreground">Manage residential and commercial units with maintenance billing</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={stats.totalUnits} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Home className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <AnimatedCounter value={stats.occupiedUnits} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant</CardTitle>
            <Home className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              <AnimatedCounter value={stats.vacantUnits} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $<AnimatedCounter value={stats.totalRevenue} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Charges</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <AnimatedCounter value={stats.pendingCharges} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <AnimatedCounter value={stats.collectionRate} />%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Society Units</TabsTrigger>
          <TabsTrigger value="charges">Maintenance Charges</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Society Units</h2>
            <Dialog open={showUnitForm} onOpenChange={setShowUnitForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{selectedUnit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
                </DialogHeader>
                <SocietyUnitForm
                  unit={selectedUnit}
                  organizationId={user?.user_metadata?.organization_id || ""}
                  onSuccess={handleUnitSuccess}
                  onCancel={() => {
                    setShowUnitForm(false)
                    setSelectedUnit(null)
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
                    <TableHead>Unit Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Owner/Tenant</TableHead>
                    <TableHead>Area (sq ft)</TableHead>
                    <TableHead>Monthly Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.unit_number}</TableCell>
                      <TableCell className="capitalize">{unit.unit_type}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {unit.owner_name && <div>Owner: {unit.owner_name}</div>}
                          {unit.tenant_name && <div>Tenant: {unit.tenant_name}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{unit.area_sqft}</TableCell>
                      <TableCell>
                        {unit.monthly_flat_rate > 0 
                          ? `$${unit.monthly_flat_rate}` 
                          : `$${unit.monthly_rate_per_sqft}/sq ft`
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(unit.status)}>
                          {unit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUnit(unit)
                            setShowUnitForm(true)
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Maintenance Charges</h2>
            <Dialog open={showChargeForm} onOpenChange={setShowChargeForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Charge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{selectedCharge ? "Edit Charge" : "Add New Charge"}</DialogTitle>
                </DialogHeader>
                <MaintenanceChargeForm
                  charge={selectedCharge}
                  units={units.map(unit => ({ 
                    id: unit.id, 
                    unit_number: unit.unit_number, 
                    unit_type: unit.unit_type 
                  }))}
                  onSuccess={handleChargeSuccess}
                  onCancel={() => {
                    setShowChargeForm(false)
                    setSelectedCharge(null)
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
                    <TableHead>Unit</TableHead>
                    <TableHead>Charge Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing Month</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell>
                        {charge.unit?.unit_number} ({charge.unit?.unit_type})
                      </TableCell>
                      <TableCell className="capitalize">
                        {charge.charge_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell>${charge.amount}</TableCell>
                      <TableCell>
                        {new Date(charge.billing_month).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(charge.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(charge.status)}>
                          {charge.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCharge(charge)
                            setShowChargeForm(true)
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Unit Occupancy Report</CardTitle>
                <CardDescription>Current occupancy statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Units:</span>
                    <span className="font-medium">{stats.totalUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupied:</span>
                    <span className="font-medium text-green-600">{stats.occupiedUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vacant:</span>
                    <span className="font-medium text-orange-600">{stats.vacantUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupancy Rate:</span>
                    <span className="font-medium">
                      {stats.totalUnits > 0 ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Report</CardTitle>
                <CardDescription>Payment collection statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-medium">${stats.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Charges:</span>
                    <span className="font-medium text-red-600">{stats.pendingCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection Rate:</span>
                    <span className="font-medium text-blue-600">{stats.collectionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}