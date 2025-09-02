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
  Package, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'

interface CommunityAsset {
  id: string
  asset_name: string
  asset_type: string
  description: string | null
  location: string | null
  purchase_date: string | null
  purchase_cost: number | null
  current_value: number | null
  condition: string
  warranty_expires: string | null
  status: string
  created_at: string
  assigned_staff?: {
    full_name: string
    position: string
  }
}

export default function AssetManagement() {
  const [assets, setAssets] = useState<CommunityAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<CommunityAsset | null>(null)
  const { toast } = useToast()
  const { userProfile } = useAuth()

  const loadAssets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('community_assets')
        .select(`
          *,
          assigned_staff:staff_members(full_name, position)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error loading assets:', error)
      toast({
        title: 'Error',
        description: 'Failed to load community assets',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  const handleSuccess = () => {
    setDialogOpen(false)
    setEditingAsset(null)
    loadAssets()
  }

  const handleEdit = (asset: CommunityAsset) => {
    setEditingAsset(asset)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('community_assets')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Asset deleted successfully',
      })
      loadAssets()
    } catch (error: any) {
      console.error('Error deleting asset:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete asset',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'maintenance': return 'secondary'
      case 'retired': return 'outline'
      case 'damaged': return 'destructive'
      default: return 'default'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'default'
      case 'good': return 'secondary'
      case 'fair': return 'outline'
      case 'poor': return 'destructive'
      default: return 'default'
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter
    const matchesType = typeFilter === 'all' || asset.asset_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const assetStats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    totalValue: assets.reduce((sum, a) => sum + (a.current_value || 0), 0),
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
          <h1 className="text-3xl font-bold">Asset Management</h1>
          <p className="text-muted-foreground">
            Manage community assets and equipment
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAsset(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </DialogTitle>
            </DialogHeader>
            <AssetForm 
              asset={editingAsset} 
              onSuccess={handleSuccess}
              organizationId={userProfile?.organization_id}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{assetStats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{assetStats.maintenance}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${assetStats.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
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
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="damaged">Damaged</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="tools">Tools</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Community Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium">{asset.asset_name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {asset.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.asset_type}</Badge>
                  </TableCell>
                  <TableCell>{asset.location || 'Unassigned'}</TableCell>
                  <TableCell>
                    <Badge variant={getConditionColor(asset.condition)}>
                      {asset.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${asset.current_value?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell>
                    {asset.assigned_staff ? (
                      <div className="text-sm">
                        <div>{asset.assigned_staff.full_name}</div>
                        <div className="text-muted-foreground">
                          {asset.assigned_staff.position}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(asset)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(asset.id)}
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
              {filteredAssets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No assets found
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

// Asset Form Component
const AssetForm = ({ asset, onSuccess, organizationId }: {
  asset: CommunityAsset | null
  onSuccess: () => void
  organizationId?: string
}) => {
  const [formData, setFormData] = useState({
    asset_name: asset?.asset_name || '',
    asset_type: asset?.asset_type || 'equipment',
    description: asset?.description || '',
    location: asset?.location || '',
    purchase_date: asset?.purchase_date || '',
    purchase_cost: asset?.purchase_cost || '',
    current_value: asset?.current_value || '',
    condition: asset?.condition || 'good',
    warranty_expires: asset?.warranty_expires || '',
    status: asset?.status || 'active'
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationId) return

    setLoading(true)
    try {
      const assetData = {
        ...formData,
        organization_id: organizationId,
        purchase_cost: formData.purchase_cost ? parseFloat(formData.purchase_cost.toString()) : null,
        current_value: formData.current_value ? parseFloat(formData.current_value.toString()) : null,
      }

      if (asset) {
        const { error } = await supabase
          .from('community_assets')
          .update(assetData)
          .eq('id', asset.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Asset updated successfully' })
      } else {
        const { error } = await supabase
          .from('community_assets')
          .insert([assetData])
        
        if (error) throw error
        toast({ title: 'Success', description: 'Asset created successfully' })
      }
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save asset',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium">Asset Name</label>
          <Input
            value={formData.asset_name}
            onChange={(e) => setFormData({...formData, asset_name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Asset Type</label>
          <Select value={formData.asset_type} onValueChange={(value) => setFormData({...formData, asset_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="vehicle">Vehicle</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Condition</label>
          <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Location</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Asset location"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Purchase Date</label>
          <Input
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Purchase Cost</label>
          <Input
            type="number"
            step="0.01"
            value={formData.purchase_cost}
            onChange={(e) => setFormData({...formData, purchase_cost: e.target.value})}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Current Value</label>
          <Input
            type="number"
            step="0.01"
            value={formData.current_value}
            onChange={(e) => setFormData({...formData, current_value: e.target.value})}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Warranty Expires</label>
          <Input
            type="date"
            value={formData.warranty_expires}
            onChange={(e) => setFormData({...formData, warranty_expires: e.target.value})}
          />
        </div>
        
        <div className="col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (asset ? 'Update Asset' : 'Create Asset')}
        </Button>
      </div>
    </form>
  )
}