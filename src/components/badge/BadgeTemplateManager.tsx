import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BadgeTemplateList } from './BadgeTemplateList'
import { BadgeTemplateForm } from './BadgeTemplateForm'
import { Plus, CreditCard } from 'lucide-react'

export const BadgeTemplateManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template)
    setIsCreateDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingTemplate(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <div>
                <CardTitle>Badge Templates</CardTitle>
                <CardDescription>Design and manage visitor badge templates</CardDescription>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Edit Badge Template' : 'Create Badge Template'}
                  </DialogTitle>
                </DialogHeader>
                <BadgeTemplateForm 
                  template={editingTemplate}
                  onSave={handleCloseDialog}
                  onCancel={handleCloseDialog}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <BadgeTemplateList onEditTemplate={handleEditTemplate} />
        </CardContent>
      </Card>
    </div>
  )
}