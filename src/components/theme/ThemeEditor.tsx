import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ColorPicker } from '@/components/ui/color-picker'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { 
  Settings, 
  Palette, 
  Eye, 
  Download, 
  Upload, 
  Copy, 
  FileText, 
  Sliders,
  Monitor,
  Sun,
  Moon,
  RefreshCw,
  Save,
  Edit3,
  Trash2,
  Archive,
  Star
} from 'lucide-react'
import { useTheme, Theme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { createCompleteThemeColors } from '@/lib/theme-utils'

const themeEditSchema = z.object({
  name: z.string().min(1, 'Theme name is required'),
  description: z.string().optional(),
  // Color fields with HSL validation
  primary: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  primaryForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  secondary: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  secondaryForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  accent: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  accentForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  background: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  foreground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  muted: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  mutedForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  card: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  cardForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  border: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  input: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  ring: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  destructive: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  destructiveForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
})

type ThemeEditFormData = z.infer<typeof themeEditSchema>

export const ThemeEditor: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewDarkMode, setPreviewDarkMode] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [deletingTheme, setDeletingTheme] = useState<Theme | null>(null)
  
  const { currentTheme, availableThemes, setTheme, createCustomTheme, deleteCustomTheme } = useTheme()
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const isAdmin = userProfile?.role === 'platform_admin'

  const form = useForm<ThemeEditFormData>({
    resolver: zodResolver(themeEditSchema),
  })

  const handleEditTheme = (theme: Theme) => {
    setSelectedTheme(theme)
    form.reset({
      name: theme.name,
      description: '',
      ...theme.colors,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveTheme = async (data: ThemeEditFormData) => {
    try {
      if (!selectedTheme) return

      const baseColors = {
        primary: data.primary,
        primaryForeground: data.primaryForeground,
        secondary: data.secondary,
        secondaryForeground: data.secondaryForeground,
        accent: data.accent,
        accentForeground: data.accentForeground,
        background: data.background,
        foreground: data.foreground,
        muted: data.muted,
        mutedForeground: data.mutedForeground,
        card: data.card,
        cardForeground: data.cardForeground,
        border: data.border,
        input: data.input,
        ring: data.ring,
        destructive: data.destructive,
        destructiveForeground: data.destructiveForeground,
      }

      const completeColors = createCompleteThemeColors(baseColors)

      const updatedTheme: Omit<Theme, 'id' | 'isDefault'> = {
        name: data.name,
        description: data.description,
        colors: completeColors,
        darkColors: {
          ...completeColors,
          background: completeColors.background === '0 0% 100%' ? '217 33% 7%' : completeColors.background,
          backgroundSecondary: '217 33% 10%',
          backgroundAccent: '217 33% 12%',
          foreground: '0 0% 100%',
          card: '217 33% 10%',
          cardForeground: '0 0% 100%',
          border: '217 33% 20%',
          input: '217 33% 20%',
          muted: '217 33% 15%',
          mutedForeground: '0 0% 70%',
          secondary: '217 33% 15%',
          secondaryForeground: '0 0% 100%',
        }
      }

      if (selectedTheme.isDefault) {
        // Create a new custom theme based on default
        await createCustomTheme(updatedTheme)
        toast({
          title: 'Success',
          description: `Custom theme "${data.name}" created successfully`,
        })
      } else {
        // Update existing custom theme
        await createCustomTheme({ ...updatedTheme, darkColors: updatedTheme.colors })
        toast({
          title: 'Success',
          description: `Theme "${data.name}" updated successfully`,
        })
      }

      setIsEditDialogOpen(false)
      setSelectedTheme(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save theme',
        variant: 'destructive',
      })
    }
  }

  const handlePreviewTheme = () => {
    if (!selectedTheme) return

    const formData = form.getValues()
    const baseColors = {
      primary: formData.primary,
      primaryForeground: formData.primaryForeground,
      secondary: formData.secondary,
      secondaryForeground: formData.secondaryForeground,
      accent: formData.accent,
      accentForeground: formData.accentForeground,
      background: formData.background,
      foreground: formData.foreground,
      muted: formData.muted,
      mutedForeground: formData.mutedForeground,
      card: formData.card,
      cardForeground: formData.cardForeground,
      border: formData.border,
      input: formData.input,
      ring: formData.ring,
      destructive: formData.destructive,
      destructiveForeground: formData.destructiveForeground,
    }

    const completeColors = createCompleteThemeColors(baseColors)

    const previewTheme: Theme = {
      ...selectedTheme,
      colors: completeColors,
    }

    // Apply preview theme
    const root = document.documentElement
    Object.entries(previewTheme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value as string)
    })

    setIsPreviewMode(true)

    // Reset after 5 seconds
    setTimeout(() => {
      setTheme(currentTheme.id)
      setIsPreviewMode(false)
    }, 5000)
  }

  const handleExportTheme = (theme: Theme) => {
    const exportData = {
      name: theme.name,
      colors: theme.colors,
      darkColors: theme.darkColors,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Theme Exported',
      description: `Theme "${theme.name}" has been exported successfully`,
    })
  }

  const handleDuplicateTheme = async (theme: Theme) => {
    try {
      const duplicatedTheme = {
        name: `${theme.name} (Copy)`,
        colors: { ...theme.colors },
        darkColors: theme.darkColors ? { ...theme.darkColors } : undefined,
      }

      await createCustomTheme(duplicatedTheme)
      
      toast({
        title: 'Theme Duplicated',
        description: `"${duplicatedTheme.name}" has been created`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate theme',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTheme = async () => {
    if (deletingTheme && !deletingTheme.isDefault) {
      await deleteCustomTheme(deletingTheme.id)
      setDeletingTheme(null)
      toast({
        title: 'Theme Deleted',
        description: `"${deletingTheme.name}" has been deleted`,
      })
    }
  }

  const colorSections = [
    {
      title: 'Primary Colors',
      fields: [
        { name: 'primary', label: 'Primary', description: 'Main brand color' },
        { name: 'primaryForeground', label: 'Primary Text', description: 'Text on primary' },
        { name: 'secondary', label: 'Secondary', description: 'Secondary brand color' },
        { name: 'secondaryForeground', label: 'Secondary Text', description: 'Text on secondary' },
      ]
    },
    {
      title: 'Accent & Background',
      fields: [
        { name: 'accent', label: 'Accent', description: 'Accent elements' },
        { name: 'accentForeground', label: 'Accent Text', description: 'Text on accent' },
        { name: 'background', label: 'Background', description: 'Main background' },
        { name: 'foreground', label: 'Text', description: 'Main text color' },
      ]
    },
    {
      title: 'Surface Colors',
      fields: [
        { name: 'card', label: 'Card Background', description: 'Card surfaces' },
        { name: 'cardForeground', label: 'Card Text', description: 'Text on cards' },
        { name: 'muted', label: 'Muted Background', description: 'Subtle backgrounds' },
        { name: 'mutedForeground', label: 'Muted Text', description: 'Subtle text' },
      ]
    },
    {
      title: 'Interface Elements',
      fields: [
        { name: 'border', label: 'Border', description: 'Element borders' },
        { name: 'input', label: 'Input Background', description: 'Form inputs' },
        { name: 'ring', label: 'Focus Ring', description: 'Focus indicators' },
        { name: 'destructive', label: 'Destructive', description: 'Error/danger color' },
        { name: 'destructiveForeground', label: 'Destructive Text', description: 'Text on destructive' },
      ]
    }
  ]

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Theme Editor
          </CardTitle>
          <CardDescription>
            Admin access required for advanced theme editing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Only administrators can access advanced theme editing features
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Theme Editor
          </CardTitle>
          <CardDescription>
            Advanced tools for creating and editing custom themes with live preview capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableThemes.map((theme) => (
              <div
                key={theme.id}
                className="group relative p-4 border rounded-lg transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{theme.name}</h3>
                      {theme.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                      {currentTheme.id === theme.id && (
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      )}
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="flex space-x-1">
                    {['primary', 'secondary', 'accent', 'destructive'].map((colorKey) => (
                      <div 
                        key={colorKey}
                        className="w-4 h-4 rounded-full border border-border" 
                        style={{ backgroundColor: `hsl(${theme.colors[colorKey as keyof typeof theme.colors]})` }}
                      />
                    ))}
                  </div>

                  {/* Theme Preview */}
                  <div 
                    className="w-full h-12 rounded border overflow-hidden"
                    style={{ backgroundColor: `hsl(${theme.colors.background})` }}
                  >
                    <div 
                      className="h-3 w-full"
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    <div className="p-2 space-y-1">
                      <div 
                        className="h-1 w-3/4 rounded"
                        style={{ backgroundColor: `hsl(${theme.colors.foreground})`, opacity: 0.8 }}
                      />
                      <div 
                        className="h-1 w-1/2 rounded"
                        style={{ backgroundColor: `hsl(${theme.colors.muted})` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTheme(theme)}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTheme(theme)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportTheme(theme)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                    {!theme.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeletingTheme(theme)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Edit Theme: {selectedTheme?.name}
              {isPreviewMode && (
                <Badge variant="outline" className="animate-pulse">
                  Live Preview (5s)
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveTheme)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Optional theme description..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviewTheme}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPreviewDarkMode(!previewDarkMode)}
                    >
                      {previewDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <Tabs defaultValue={colorSections[0].title} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      {colorSections.map((section) => (
                        <TabsTrigger key={section.title} value={section.title} className="text-xs">
                          {section.title.split(' ')[0]}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {colorSections.map((section) => (
                      <TabsContent key={section.title} value={section.title} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.fields.map((field) => (
                            <FormField
                              key={field.name}
                              control={form.control}
                              name={field.name as any}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded border"
                                      style={{ backgroundColor: `hsl(${formField.value})` }}
                                    />
                                    {field.label}
                                  </FormLabel>
                                  <FormControl>
                                    <ColorPicker
                                      value={formField.value}
                                      onChange={formField.onChange}
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">{field.description}</p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedTheme(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Save Theme
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Theme"
        description={`Are you sure you want to delete "${deletingTheme?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteTheme}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}