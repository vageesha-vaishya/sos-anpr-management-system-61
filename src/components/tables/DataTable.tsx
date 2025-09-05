import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Edit, Trash2, Plus, Search, RefreshCw } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Column {
  key: string
  header: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  title: string
  tableName: string
  columns: Column[]
  FormComponent: React.ComponentType<{ onSuccess: () => void; editData?: any }>
  searchFields?: string[]
  selectQuery?: string
  orderBy?: { column: string; ascending: boolean }
  pageSize?: number
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  tableName,
  columns,
  FormComponent,
  searchFields = [],
  selectQuery = '*',
  orderBy = { column: 'created_at', ascending: false },
  pageSize = 10
}) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const { toast } = useToast()

  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (currentPage - 1) * pageSize

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log(`Fetching data from table: ${tableName}`)
      console.log(`Select query: ${selectQuery}`)
      
      let query = supabase
        .from(tableName as any)
        .select(selectQuery, { count: 'exact' })
        .order(orderBy.column, { ascending: orderBy.ascending })
        .range(startIndex, startIndex + pageSize - 1)

      // Add search filter if search term exists
      if (searchTerm && searchFields.length > 0) {
        const searchConditions = searchFields.map(field => 
          `${field}.ilike.%${searchTerm}%`
        ).join(',')
        query = query.or(searchConditions)
        console.log(`Search conditions: ${searchConditions}`)
      }

      const { data: result, error, count } = await query

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      console.log(`Fetched ${result?.length || 0} records out of ${count || 0} total`)
      setData(result || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error(`Failed to fetch ${tableName}:`, error)
      toast({
        title: 'Data Fetch Error',
        description: error.message || `Failed to load ${title.toLowerCase()}`,
        variant: 'destructive',
      })
      setData([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, searchTerm])

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    fetchData()
    toast({
      title: 'Success',
      description: `${title} ${editingItem ? 'updated' : 'created'} successfully`,
    })
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', deletingItem.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: `${title} deleted successfully`,
      })
      
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to delete ${title.toLowerCase()}`,
        variant: 'destructive',
      })
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const visiblePages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i)
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) setCurrentPage(currentPage - 1)
              }}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {visiblePages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage(page)
                }}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) setCurrentPage(currentPage + 1)
              }}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-64"
                disabled={searchFields.length === 0}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) setEditingItem(null)
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add {title.slice(0, -1)}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit' : 'Add'} {title.slice(0, -1)}
                  </DialogTitle>
                </DialogHeader>
                <FormComponent onSuccess={handleSuccess} editData={editingItem} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key}>{column.header}</TableHead>
                    ))}
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={columns.length + 1} 
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm ? `No ${title.toLowerCase()} found matching "${searchTerm}"` : `No ${title.toLowerCase()} found`}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row) => (
                      <TableRow key={row.id}>
                        {columns.map((column) => (
                          <TableCell key={column.key}>
                            {column.render 
                              ? column.render(row[column.key], row)
                              : row[column.key]
                            }
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(row)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeletingItem(row)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalCount > 0 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalCount)} of {totalCount} entries
                </div>
                {renderPagination()}
              </div>
            )}
          </>
        )}

        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`Delete ${title.slice(0, -1)}`}
          description={`Are you sure you want to delete this ${title.slice(0, -1).toLowerCase()}? This action cannot be undone.`}
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </CardContent>
    </Card>
  )
}