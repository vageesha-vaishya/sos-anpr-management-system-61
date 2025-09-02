import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FranchiseForm } from '@/components/forms/FranchiseForm'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Building2, Plus, Edit, Trash2, Users, MapPin, Calendar, MoreVertical } from 'lucide-react'
import { formatRoleName } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Franchise {
  id: string
  name: string
  type: string
  status: string
  subscription_plan: string
  created_at: string
  updated_at: string
  parent_id: string | null
  customer_count?: number
  location_count?: number
}

export default function Franchises() {
  const [franchises, setFranchises] = useState<Franchise[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null)
  const [deletingFranchise, setDeletingFranchise] = useState<Franchise | null>(null)
  const { toast } = useToast()

  const fetchFranchises = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          customer_organizations:organizations!parent_id(count),
          locations(count)
        `)
        .eq('type', 'franchise')
        .order('created_at', { ascending: false })

      if (error) throw error

      const franchisesWithCounts = data?.map(franchise => ({
        ...franchise,
        customer_count: franchise.customer_organizations?.[0]?.count || 0,
        location_count: franchise.locations?.[0]?.count || 0
      })) || []

      setFranchises(franchisesWithCounts as any)
    } catch (error: any) {
      console.error('Error fetching franchises:', error)
      toast({
        title: 'Error',
        description: 'Failed to load franchises',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFranchises()
  }, [])

  const handleSuccess = () => {
    setDialogOpen(false)
    setEditingFranchise(null)
    fetchFranchises()
  }

  const handleEdit = (franchise: Franchise) => {
    setEditingFranchise(franchise)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingFranchise) return

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', deletingFranchise.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Franchise deleted successfully',
      })

      fetchFranchises()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setDeletingFranchise(null)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'outline'
    }
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default'
      case 'premium': return 'secondary'
      case 'basic': return 'outline'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Franchise Management</h1>
            <p className="text-muted-foreground">
              Manage franchise partners and their operations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Franchise Management</h1>
            <p className="text-muted-foreground">
              Manage franchise partners and their operations
            </p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingFranchise(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Franchise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFranchise ? 'Edit Franchise' : 'Add New Franchise'}
              </DialogTitle>
            </DialogHeader>
            <FranchiseForm onSuccess={handleSuccess} editData={editingFranchise} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {franchises.map((franchise) => (
          <Card key={franchise.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">{franchise.name}</CardTitle>
                <CardDescription>
                  Created {new Date(franchise.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(franchise)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeletingFranchise(franchise)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={getStatusBadgeVariant(franchise.status)}>
                    {formatRoleName(franchise.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan</span>
                  <Badge variant={getPlanBadgeVariant(franchise.subscription_plan)}>
                    {formatRoleName(franchise.subscription_plan)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Customers</span>
                  </div>
                  <span className="font-medium">{franchise.customer_count || 0}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Locations</span>
                  </div>
                  <span className="font-medium">{franchise.location_count || 0}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Last Updated</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(franchise.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {franchises.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No franchises found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first franchise partner.
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFranchise(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Franchise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Franchise</DialogTitle>
              </DialogHeader>
              <FranchiseForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      )}

      <ConfirmDialog
        open={!!deletingFranchise}
        onOpenChange={(open) => !open && setDeletingFranchise(null)}
        onConfirm={handleDelete}
        title="Delete Franchise"
        description={`Are you sure you want to delete "${deletingFranchise?.name}"? This action cannot be undone and will affect all associated customer organizations.`}
        confirmText="Delete Franchise"
        variant="destructive"
      />
    </div>
  )
}