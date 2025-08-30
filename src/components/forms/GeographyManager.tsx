import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ContinentForm } from '@/components/forms/ContinentForm'
import { CountryForm } from '@/components/forms/CountryForm'
import { StateForm } from '@/components/forms/StateForm'
import { CityForm } from '@/components/forms/CityForm'
import { PremiseTypeForm } from '@/components/forms/PremiseTypeForm'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Edit, Trash2, Globe, Flag, MapPin, Building2, Settings, AlertCircle } from 'lucide-react'

interface GeographyItem {
  id: string
  name: string
  code?: string
  created_at?: string
  continent_id?: string
  continent?: { name: string }
  country_id?: string
  country?: { name: string }
  state_id?: string
  state?: { name: string }
  plate_format?: string
  description?: string
  config?: any
}

export const GeographyManager: React.FC = () => {
  const [continents, setContinents] = useState<GeographyItem[]>([])
  const [countries, setCountries] = useState<GeographyItem[]>([])
  const [states, setStates] = useState<GeographyItem[]>([])
  const [cities, setCities] = useState<GeographyItem[]>([])
  const [premiseTypes, setPremiseTypes] = useState<GeographyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState(false)
  const [editItem, setEditItem] = useState<GeographyItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<{ item: GeographyItem; table: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('continents')
  const { toast } = useToast()
  const { userProfile } = useAuth()

  const isPlatformAdmin = userProfile?.role === 'platform_admin'

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [continentsRes, countriesRes, statesRes, citiesRes, premiseTypesRes] = await Promise.all([
        supabase.from('continents').select('*').order('name'),
        supabase.from('countries').select('*, continent:continents(name)').order('name'),
        supabase.from('states').select('*, country:countries(name)').order('name'),
        supabase.from('cities').select('*, state:states(name)').order('name'),
        supabase.from('premise_types').select('*').order('name')
      ])

      // Handle errors for each query
      if (continentsRes.error) {
        console.error('Continents error:', continentsRes.error)
        toast({
          title: 'Error loading continents',
          description: continentsRes.error.message,
          variant: 'destructive'
        })
      } else if (continentsRes.data) {
        setContinents(continentsRes.data)
      }

      if (countriesRes.error) {
        console.error('Countries error:', countriesRes.error)
        toast({
          title: 'Error loading countries',
          description: countriesRes.error.message,
          variant: 'destructive'
        })
      } else if (countriesRes.data) {
        setCountries(countriesRes.data)
      }

      if (statesRes.error) {
        console.error('States error:', statesRes.error)
        toast({
          title: 'Error loading states',
          description: statesRes.error.message,
          variant: 'destructive'
        })
      } else if (statesRes.data) {
        setStates(statesRes.data)
      }

      if (citiesRes.error) {
        console.error('Cities error:', citiesRes.error)
        toast({
          title: 'Error loading cities',
          description: citiesRes.error.message,
          variant: 'destructive'
        })
      } else if (citiesRes.data) {
        setCities(citiesRes.data)
      }

      if (premiseTypesRes.error) {
        console.error('Premise types error:', premiseTypesRes.error)
        toast({
          title: 'Error loading premise types',
          description: premiseTypesRes.error.message,
          variant: 'destructive'
        })
      } else if (premiseTypesRes.data) {
        setPremiseTypes(premiseTypesRes.data)
      }
    } catch (error: any) {
      console.error('Fetch all data error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load geographic data. Please check your permissions and try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    if (!isPlatformAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'Only platform administrators can delete geographic data.',
        variant: 'destructive'
      })
      return
    }

    try {
      setOperationLoading(true)
      let error: any = null
      
      // Handle deletes with proper table names
      switch (deleteItem.table) {
        case 'continents':
          ({ error } = await supabase.from('continents').delete().eq('id', deleteItem.item.id))
          break
        case 'countries':
          ({ error } = await supabase.from('countries').delete().eq('id', deleteItem.item.id))
          break
        case 'states':
          ({ error } = await supabase.from('states').delete().eq('id', deleteItem.item.id))
          break
        case 'cities':
          ({ error } = await supabase.from('cities').delete().eq('id', deleteItem.item.id))
          break
        case 'premise_types':
          ({ error } = await supabase.from('premise_types').delete().eq('id', deleteItem.item.id))
          break
        default:
          throw new Error('Invalid table type')
      }

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Permission denied. Only platform administrators can delete geographic data.')
        }
        if (error.code === '23503') {
          throw new Error('Cannot delete this item as it is referenced by other records. Please delete dependent records first.')
        }
        throw error
      }

      toast({
        title: 'Success',
        description: `${deleteItem.item.name} deleted successfully`
      })

      fetchAllData()
      setDeleteItem(null)
    } catch (error: any) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive'
      })
    } finally {
      setOperationLoading(false)
    }
  }

  const handleSuccess = () => {
    fetchAllData()
    setIsDialogOpen(false)
    setEditItem(null)
  }

  const renderTable = (data: GeographyItem[], type: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {type !== 'premise_types' && <TableHead>Code</TableHead>}
          {type === 'countries' && <TableHead>Continent</TableHead>}
          {type === 'states' && <TableHead>Country</TableHead>}
          {type === 'cities' && <TableHead>State</TableHead>}
          {type === 'countries' && <TableHead>Plate Format</TableHead>}
          {type === 'premise_types' && <TableHead>Description</TableHead>}
          {isPlatformAdmin && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            {type !== 'premise_types' && <TableCell><Badge variant="outline">{item.code}</Badge></TableCell>}
            {type === 'countries' && <TableCell>{item.continent?.name}</TableCell>}
            {type === 'states' && <TableCell>{item.country?.name}</TableCell>}
            {type === 'cities' && <TableCell>{item.state?.name}</TableCell>}
            {type === 'countries' && <TableCell><Badge>{item.plate_format}</Badge></TableCell>}
            {type === 'premise_types' && <TableCell className="max-w-xs truncate">{item.description}</TableCell>}
            {isPlatformAdmin && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditItem(item)
                      setIsDialogOpen(true)
                    }}
                    disabled={operationLoading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteItem({ item, table: type })}
                    disabled={operationLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const getForm = (type: string) => {
    const props = { onSuccess: handleSuccess, editData: editItem }
    
    switch (type) {
      case 'continents':
        return <ContinentForm {...props} />
      case 'countries':
        return <CountryForm {...props} />
      case 'states':
        return <StateForm {...props} />
      case 'cities':
        return <CityForm {...props} />
      case 'premise_types':
        return <PremiseTypeForm {...props} />
      default:
        return null
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'continents': return Globe
      case 'countries': return Flag
      case 'states': return MapPin
      case 'cities': return Building2
      case 'premise_types': return Settings
      default: return Globe
    }
  }

  const getData = (type: string) => {
    switch (type) {
      case 'continents': return continents
      case 'countries': return countries
      case 'states': return states
      case 'cities': return cities
      case 'premise_types': return premiseTypes
      default: return []
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {['continents', 'countries', 'states', 'cities', 'premise_types'].map((type) => {
            const Icon = getIcon(type)
            return (
              <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {['continents', 'countries', 'states', 'cities', 'premise_types'].map((type) => (
          <TabsContent key={type} value={type} className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="capitalize">
                  {type.replace('_', ' ')} Management
                </CardTitle>
                {isPlatformAdmin && (
                  <Dialog 
                    open={isDialogOpen && activeTab === type} 
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) setEditItem(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button disabled={operationLoading}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add {type.slice(0, -1).replace('_', ' ')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editItem ? 'Edit' : 'Add'} {type.slice(0, -1).replace('_', ' ')}
                        </DialogTitle>
                      </DialogHeader>
                      {getForm(type)}
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {!isPlatformAdmin && (
                  <Card className="mb-4 border-warning bg-warning/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-warning" />
                        <div>
                          <p className="font-medium text-warning">View Only Access</p>
                          <p className="text-sm text-muted-foreground">
                            Only platform administrators can add, edit, or delete geographic data. You have read-only access.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {getData(type).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No {type.replace('_', ' ')} found. 
                      {isPlatformAdmin ? ' Click "Add" to create the first one.' : ' Contact your administrator to add entries.'}
                    </p>
                  </div>
                ) : (
                  renderTable(getData(type), type)
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete Item"
        description={`Are you sure you want to delete "${deleteItem?.item.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}