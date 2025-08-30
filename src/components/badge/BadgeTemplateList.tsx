import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BadgePreview } from './BadgePreview'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { MoreHorizontal, Edit, Copy, Trash2, Eye, Star, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface BadgeTemplate {
  id: string
  name: string
  template_type: string
  design_config: any
  security_features: any
  active: boolean
  created_at: string
}

interface BadgeTemplateListProps {
  onEditTemplate: (template: BadgeTemplate) => void
}

export const BadgeTemplateList = ({ onEditTemplate }: BadgeTemplateListProps) => {
  const [templates, setTemplates] = useState<BadgeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [previewTemplate, setPreviewTemplate] = useState<BadgeTemplate | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('badge_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch badge templates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async (template: BadgeTemplate) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single()

      const { data, error } = await supabase
        .from('badge_templates')
        .insert({
          name: `${template.name} Copy`,
          template_type: template.template_type,
          design_config: template.design_config,
          security_features: template.security_features,
          active: false,
          organization_id: profile?.organization_id
        })

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Template duplicated successfully'
      })
      
      fetchTemplates()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (template: BadgeTemplate) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const { error } = await supabase
        .from('badge_templates')
        .delete()
        .eq('id', template.id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      })
      
      fetchTemplates()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (template: BadgeTemplate) => {
    try {
      const { error } = await supabase
        .from('badge_templates')
        .update({ active: !template.active })
        .eq('id', template.id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: `Template ${template.active ? 'deactivated' : 'activated'} successfully`
      })
      
      fetchTemplates()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template status',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded mb-4"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditTemplate(template)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                      <Star className="mr-2 h-4 w-4" />
                      {template.active ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(template)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={template.active ? 'default' : 'secondary'}>
                  {template.active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.template_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setPreviewTemplate(template)}
              >
                Preview Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No badge templates yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first badge template to get started with visitor badges.
          </p>
        </div>
      )}

      {previewTemplate && (
        <BadgePreview 
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </>
  )
}