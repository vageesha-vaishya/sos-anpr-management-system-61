import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ColorPicker } from '@/components/ui/color-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Sidebar, Menu, Palette, Save, Eye, RotateCcw, Sparkles } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

const sidebarThemeSchema = z.object({
  'sidebar-background': z.string().regex(/^(\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%|\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%\s*\/\s*[\d.]+)$/, "Invalid HSL format"),
  'sidebar-foreground': z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, "Invalid HSL format"),
  'sidebar-primary': z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, "Invalid HSL format"),
  'sidebar-primary-foreground': z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, "Invalid HSL format"),
  'sidebar-accent': z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, "Invalid HSL format"),
  'sidebar-accent-foreground': z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, "Invalid HSL format"),
  'sidebar-border': z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, "Invalid HSL format"),
  'sidebar-ring': z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, "Invalid HSL format"),
  'sidebar-glossy': z.string().regex(/^(\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%|\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%\s*\/\s*[\d.]+)$/, "Invalid HSL format"),
  'sidebar-shadow': z.string().regex(/^(\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%|\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%\s*\/\s*[\d.]+)$/, "Invalid HSL format"),
  'glossy-enabled': z.boolean(),
  'glossy-intensity': z.number().min(0).max(100),
  'shadow-enabled': z.boolean(),
  'shadow-intensity': z.number().min(0).max(100),
})

type SidebarThemeFormData = z.infer<typeof sidebarThemeSchema>

export const SidebarThemeEditor: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const { availableThemes, currentTheme } = useTheme()
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const isAdmin = userProfile?.role === 'platform_admin'

  const form = useForm<SidebarThemeFormData>({
    resolver: zodResolver(sidebarThemeSchema),
    defaultValues: {
      'sidebar-background': '0 0% 98%',
      'sidebar-foreground': '240 5.3% 26.1%',
      'sidebar-primary': '240 5.9% 10%',
      'sidebar-primary-foreground': '0 0% 98%',
      'sidebar-accent': '240 4.8% 95.9%',
      'sidebar-accent-foreground': '240 5.9% 10%',
      'sidebar-border': '220 13% 91%',
      'sidebar-ring': '196 100% 47%',
      'sidebar-glossy': '0 0% 100% / 0.1',
      'sidebar-shadow': '0 0% 0% / 0.1',
      'glossy-enabled': true,
      'glossy-intensity': 10,
      'shadow-enabled': true,
      'shadow-intensity': 10,
    },
  })

  const getCurrentSidebarValues = () => {
    return {
      'sidebar-background': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-background').trim() || '0 0% 98%',
      'sidebar-foreground': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-foreground').trim() || '240 5.3% 26.1%',
      'sidebar-primary': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-primary').trim() || '240 5.9% 10%',
      'sidebar-primary-foreground': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-primary-foreground').trim() || '0 0% 98%',
      'sidebar-accent': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-accent').trim() || '240 4.8% 95.9%',
      'sidebar-accent-foreground': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-accent-foreground').trim() || '240 5.9% 10%',
      'sidebar-border': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-border').trim() || '220 13% 91%',
      'sidebar-ring': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-ring').trim() || '196 100% 47%',
      'sidebar-glossy': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-glossy').trim() || '0 0% 100% / 0.1',
      'sidebar-shadow': getComputedStyle(document.documentElement).getPropertyValue('--sidebar-shadow').trim() || '0 0% 0% / 0.1',
    }
  }

  const handleLoadCurrentTheme = () => {
    const currentValues = getCurrentSidebarValues()
    const glossyAlpha = parseFloat((currentValues['sidebar-glossy'] as string).split('/ ')[1] || '0.1') * 100
    const shadowAlpha = parseFloat((currentValues['sidebar-shadow'] as string).split('/ ')[1] || '0.1') * 100
    
    form.reset({
      ...currentValues,
      'glossy-enabled': glossyAlpha > 0,
      'glossy-intensity': Math.round(glossyAlpha),
      'shadow-enabled': shadowAlpha > 0,
      'shadow-intensity': Math.round(shadowAlpha),
    })
    setIsDialogOpen(true)
  }

  const handlePreview = () => {
    const formData = form.getValues()
    const root = document.documentElement

    // Apply sidebar colors
    Object.entries(formData).forEach(([key, value]) => {
      if (key.startsWith('sidebar-')) {
        if (key === 'sidebar-glossy' && formData['glossy-enabled']) {
          const baseColor = (value as string).split('/ ')[0] || value
          const intensity = formData['glossy-intensity'] / 100
          root.style.setProperty(`--${key}`, `${baseColor} / ${intensity.toFixed(2)}`)
        } else if (key === 'sidebar-shadow' && formData['shadow-enabled']) {
          const baseColor = (value as string).split('/ ')[0] || value
          const intensity = formData['shadow-intensity'] / 100
          root.style.setProperty(`--${key}`, `${baseColor} / ${intensity.toFixed(2)}`)
        } else if (!key.includes('glossy') && !key.includes('shadow')) {
          root.style.setProperty(`--${key}`, value as string)
        }
      }
    })

    setIsPreviewMode(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setIsPreviewMode(false)
    }, 3000)
  }

  const handleSaveChanges = async (data: SidebarThemeFormData) => {
    try {
      const root = document.documentElement

      // Apply sidebar colors with effects
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('sidebar-')) {
          if (key === 'sidebar-glossy' && data['glossy-enabled']) {
            const baseColor = (value as string).split('/ ')[0] || value
            const intensity = data['glossy-intensity'] / 100
            root.style.setProperty(`--${key}`, `${baseColor} / ${intensity.toFixed(2)}`)
          } else if (key === 'sidebar-shadow' && data['shadow-enabled']) {
            const baseColor = (value as string).split('/ ')[0] || value
            const intensity = data['shadow-intensity'] / 100
            root.style.setProperty(`--${key}`, `${baseColor} / ${intensity.toFixed(2)}`)
          } else if (!key.includes('glossy') && !key.includes('shadow')) {
            root.style.setProperty(`--${key}`, value as string)
          }
        }
      })

      // Save to localStorage for persistence
      const sidebarThemeData = {
        ...data,
        timestamp: Date.now()
      }
      localStorage.setItem('sidebarTheme', JSON.stringify(sidebarThemeData))

      toast({
        title: 'Success',
        description: 'Sidebar theme updated successfully'
      })

      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update sidebar theme',
        variant: 'destructive'
      })
    }
  }

  const handleResetTheme = () => {
    const currentValues = getCurrentSidebarValues()
    const glossyAlpha = parseFloat((currentValues['sidebar-glossy'] as string).split('/ ')[1] || '0.1') * 100
    const shadowAlpha = parseFloat((currentValues['sidebar-shadow'] as string).split('/ ')[1] || '0.1') * 100
    
    form.reset({
      ...currentValues,
      'glossy-enabled': glossyAlpha > 0,
      'glossy-intensity': Math.round(glossyAlpha),
      'shadow-enabled': shadowAlpha > 0,
      'shadow-intensity': Math.round(shadowAlpha),
    })
  }

  const colorFields = [
    { key: 'sidebar-background' as keyof SidebarThemeFormData, label: 'Background', description: 'Sidebar background color', category: 'Base Colors' },
    { key: 'sidebar-foreground' as keyof SidebarThemeFormData, label: 'Text Color', description: 'Primary text color', category: 'Base Colors' },
    { key: 'sidebar-primary' as keyof SidebarThemeFormData, label: 'Primary Color', description: 'Brand/logo color', category: 'Base Colors' },
    { key: 'sidebar-primary-foreground' as keyof SidebarThemeFormData, label: 'Primary Text', description: 'Text on primary color', category: 'Base Colors' },
    { key: 'sidebar-accent' as keyof SidebarThemeFormData, label: 'Hover/Active', description: 'Hover and active states', category: 'Interactive' },
    { key: 'sidebar-accent-foreground' as keyof SidebarThemeFormData, label: 'Hover Text', description: 'Text on hover/active', category: 'Interactive' },
    { key: 'sidebar-border' as keyof SidebarThemeFormData, label: 'Border', description: 'Border and divider color', category: 'Interactive' },
    { key: 'sidebar-ring' as keyof SidebarThemeFormData, label: 'Focus Ring', description: 'Focus indicator color', category: 'Interactive' },
    { key: 'sidebar-glossy' as keyof SidebarThemeFormData, label: 'Glossy Overlay', description: 'Glossy effect base color', category: 'Effects' },
    { key: 'sidebar-shadow' as keyof SidebarThemeFormData, label: 'Shadow Color', description: 'Inner shadow base color', category: 'Effects' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Menu className="w-5 h-5" />
          Sidebar Theme Customization
        </CardTitle>
        <CardDescription>
          Customize sidebar colors and glossy effects with real-time preview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleLoadCurrentTheme}>
              <Palette className="w-4 h-4 mr-2" />
              Customize Sidebar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Sidebar Theme Editor
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Sidebar Customization</h3>
                      {isPreviewMode && (
                        <Badge variant="outline" className="animate-pulse">
                          Previewing... (3s)
                        </Badge>
                      )}
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto space-y-6">
                      {/* Color configuration grouped by category */}
                      {['Base Colors', 'Interactive', 'Effects'].map((category) => (
                        <div key={category} className="space-y-4">
                          <div className="flex items-center space-x-2 pb-2 border-b">
                            <h4 className="text-sm font-semibold text-foreground">{category}</h4>
                            {category === 'Effects' && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Sparkles className="w-3 h-3" />
                                <span>Glossy & Shadow</span>
                              </div>
                            )}
                          </div>
                          
                          {category === 'Effects' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                              {/* Glossy Controls */}
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name="glossy-enabled"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                      <div>
                                        <FormLabel>Glossy Effect</FormLabel>
                                        <FormDescription className="text-xs">Enable glossy overlay</FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="glossy-intensity"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Glossy Intensity ({field.value}%)</FormLabel>
                                      <FormControl>
                                        <Slider
                                          min={0}
                                          max={30}
                                          step={1}
                                          value={[field.value]}
                                          onValueChange={(value) => field.onChange(value[0])}
                                          disabled={!form.watch('glossy-enabled')}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              {/* Shadow Controls */}
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name="shadow-enabled"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                      <div>
                                        <FormLabel>Inner Shadow</FormLabel>
                                        <FormDescription className="text-xs">Enable inner shadow</FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="shadow-intensity"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Shadow Intensity ({field.value}%)</FormLabel>
                                      <FormControl>
                                        <Slider
                                          min={0}
                                          max={50}
                                          step={1}
                                          value={[field.value]}
                                          onValueChange={(value) => field.onChange(value[0])}
                                          disabled={!form.watch('shadow-enabled')}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {colorFields
                              .filter(field => field.category === category)
                              .map((field) => (
                                <FormField
                                  key={field.key}
                                  control={form.control}
                                  name={field.key}
                                  render={({ field: formField }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center space-x-2">
                                        <div 
                                          className="w-4 h-4 rounded border border-border"
                                          style={{ 
                                            backgroundColor: `hsl(${(formField.value as string).split('/ ')[0] || formField.value})` 
                                          }}
                                        />
                                        <span>{field.label}</span>
                                        {field.key.includes('glossy') || field.key.includes('shadow') ? (
                                          <Sparkles className="w-3 h-3 text-primary/60" />
                                        ) : null}
                                      </FormLabel>
                                      <FormControl>
                                        <ColorPicker
                                          value={formField.value as string}
                                          onChange={formField.onChange}
                                        />
                                      </FormControl>
                                      <FormDescription className="text-xs">{field.description}</FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={handlePreview}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview (3s)
                      </Button>
                      <Button type="button" variant="outline" onClick={handleResetTheme}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Save Sidebar Theme
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Sidebar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Sidebar Customization Features</h4>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Real-time color preview with live sidebar updates</li>
                  <li>• Glossy gradient overlay effects with intensity control</li>
                  <li>• Inner shadow depth effects for modern appearance</li>
                  <li>• Separate theming for all interactive states</li>
                  <li>• Persistent settings across browser sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}