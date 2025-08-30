import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SocietyUnitForm } from "@/components/forms/SocietyUnitForm"
import { Plus, Edit, Trash2, Home, Building2, Car } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

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

interface SocietyUnitsTableProps {
  units: SocietyUnit[]
  organizationId: string
  onRefresh: () => void
}

export function SocietyUnitsTable({ units, organizationId, onRefresh }: SocietyUnitsTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<SocietyUnit | null>(null)
  const { toast } = useToast()

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "occupied":
        return "default"
      case "vacant":
        return "secondary"
      case "maintenance":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getUnitTypeIcon = (type: string) => {
    switch (type) {
      case "residential":
        return <Home className="h-4 w-4" />
      case "commercial":
        return <Building2 className="h-4 w-4" />
      case "parking":
        return <Car className="h-4 w-4" />
      default:
        return <Home className="h-4 w-4" />
    }
  }

  const handleEdit = (unit: SocietyUnit) => {
    setSelectedUnit(unit)
    setShowForm(true)
  }

  const handleDelete = async (unit: SocietyUnit) => {
    if (confirm(`Are you sure you want to delete unit ${unit.unit_number}?`)) {
      try {
        const { error } = await supabase
          .from("society_units")
          .delete()
          .eq("id", unit.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Unit deleted successfully",
        })
        onRefresh()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete unit",
          variant: "destructive",
        })
      }
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedUnit(null)
    onRefresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Society Units</CardTitle>
            <CardDescription>Manage residential, commercial, and parking units</CardDescription>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
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
                organizationId={organizationId}
                onSuccess={handleSuccess}
                onCancel={() => {
                  setShowForm(false)
                  setSelectedUnit(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Owner/Tenant</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Monthly Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getUnitTypeIcon(unit.unit_type)}
                    <div className="font-medium">{unit.unit_number}</div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{unit.unit_type}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {unit.owner_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Owner:</span> {unit.owner_name}
                      </div>
                    )}
                    {unit.tenant_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Tenant:</span> {unit.tenant_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{unit.area_sqft} sq ft</div>
                    {unit.parking_slots > 0 && (
                      <div className="text-muted-foreground">
                        {unit.parking_slots} parking
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {unit.monthly_flat_rate > 0 ? (
                      <div>${unit.monthly_flat_rate}/month</div>
                    ) : (
                      <div>${unit.monthly_rate_per_sqft}/sq ft</div>
                    )}
                    <div className="text-muted-foreground">
                      {unit.monthly_flat_rate > 0 ? "Flat rate" : "Per sq ft"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(unit.status)}>
                    {unit.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(unit)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(unit)}
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
  )
}