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
  FileText, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Plus,
  Download,
  Eye,
  Upload,
  Folder,
  Lock,
  Unlock
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'

interface CommunityDocument {
  id: string
  document_name: string
  document_type: string
  file_path: string | null
  file_size: number | null
  mime_type: string | null
  description: string | null
  category: string
  access_level: string
  version_number: number
  is_active: boolean
  created_at: string
  uploaded_by_profile?: {
    full_name: string
    email: string
  }
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<CommunityDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [accessFilter, setAccessFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<CommunityDocument | null>(null)
  const { toast } = useToast()
  const { userProfile } = useAuth()

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('community_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!community_documents_uploaded_by_fkey(full_name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
      toast({
        title: 'Error',
        description: 'Failed to load community documents',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleSuccess = () => {
    setDialogOpen(false)
    setEditingDocument(null)
    loadDocuments()
  }

  const handleEdit = (document: CommunityDocument) => {
    setEditingDocument(document)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('community_documents')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Document archived successfully',
      })
      loadDocuments()
    } catch (error: any) {
      console.error('Error archiving document:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to archive document',
        variant: 'destructive',
      })
    }
  }

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'public': return 'default'
      case 'private': return 'secondary'
      case 'restricted': return 'destructive'
      default: return 'outline'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'policy': return 'default'
      case 'legal': return 'destructive'
      case 'financial': return 'secondary'
      case 'maintenance': return 'outline'
      default: return 'outline'
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    const matchesAccess = accessFilter === 'all' || doc.access_level === accessFilter
    
    return matchesSearch && matchesCategory && matchesAccess
  })

  const documentStats = {
    total: documents.length,
    public: documents.filter(d => d.access_level === 'public').length,
    private: documents.filter(d => d.access_level === 'private').length,
    totalSize: documents.reduce((sum, d) => sum + (d.file_size || 0), 0),
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
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">
            Manage community documents and files
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDocument(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? 'Edit Document' : 'Add New Document'}
              </DialogTitle>
            </DialogHeader>
            <DocumentForm 
              document={editingDocument} 
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
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public</CardTitle>
            <Unlock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{documentStats.public}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Private</CardTitle>
            <Lock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{documentStats.private}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Folder className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatFileSize(documentStats.totalSize)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={accessFilter} onValueChange={setAccessFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Access Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Community Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium">{document.document_name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {document.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.document_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryColor(document.category)}>
                      {document.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getAccessColor(document.access_level)}>
                      {document.access_level}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(document.file_size)}</TableCell>
                  <TableCell>v{document.version_number}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{document.uploaded_by_profile?.full_name}</div>
                      <div className="text-muted-foreground">
                        {document.uploaded_by_profile?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(document.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(document)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(document.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDocuments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No documents found
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

// Document Form Component
const DocumentForm = ({ document, onSuccess, organizationId }: {
  document: CommunityDocument | null
  onSuccess: () => void
  organizationId?: string
}) => {
  const [formData, setFormData] = useState({
    document_name: document?.document_name || '',
    document_type: document?.document_type || 'pdf',
    description: document?.description || '',
    category: document?.category || 'policy',
    access_level: document?.access_level || 'public',
    version_number: document?.version_number || 1
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-fill document name if empty
      if (!formData.document_name) {
        setFormData(prev => ({
          ...prev,
          document_name: selectedFile.name.replace(/\.[^/.]+$/, "")
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationId) return

    setUploading(true)
    try {
      let filePath = document?.file_path
      let fileSize = document?.file_size
      let mimeType = document?.mime_type

      // Upload file if a new one is selected
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        filePath = `documents/${fileName}`

        // Note: This is a placeholder for file upload
        // In a real implementation, you would upload to Supabase Storage
        fileSize = file.size
        mimeType = file.type
      }

      const documentData = {
        ...formData,
        organization_id: organizationId,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        uploaded_by: document ? document.uploaded_by_profile?.email : undefined,
      }

      if (document) {
        const { error } = await supabase
          .from('community_documents')
          .update(documentData)
          .eq('id', document.id)
        
        if (error) throw error
        toast({ title: 'Success', description: 'Document updated successfully' })
      } else {
        const { error } = await supabase
          .from('community_documents')
          .insert([documentData])
        
        if (error) throw error
        toast({ title: 'Success', description: 'Document uploaded successfully' })
      }
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save document',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium">Document Name</label>
          <Input
            value={formData.document_name}
            onChange={(e) => setFormData({...formData, document_name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Document Type</label>
          <Select value={formData.document_type} onValueChange={(value) => setFormData({...formData, document_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="doc">Word Document</SelectItem>
              <SelectItem value="xls">Excel Spreadsheet</SelectItem>
              <SelectItem value="ppt">Presentation</SelectItem>
              <SelectItem value="img">Image</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="policy">Policy</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Access Level</label>
          <Select value={formData.access_level} onValueChange={(value) => setFormData({...formData, access_level: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Version Number</label>
          <Input
            type="number"
            min="1"
            value={formData.version_number}
            onChange={(e) => setFormData({...formData, version_number: parseInt(e.target.value)})}
          />
        </div>
        
        <div className="col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            placeholder="Brief description of the document"
          />
        </div>
        
        <div className="col-span-2">
          <label className="text-sm font-medium">
            {document ? 'Replace File (optional)' : 'Upload File'}
          </label>
          <Input
            type="file"
            onChange={handleFileChange}
            className="cursor-pointer"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
          />
          {file && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {file.name} ({formatFileSize(file.size)})
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={uploading}>
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            document ? 'Update Document' : 'Upload Document'
          )}
        </Button>
      </div>
    </form>
  )
}

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}