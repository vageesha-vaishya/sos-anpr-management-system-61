import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ColorPicker } from '@/components/ui/color-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Palette, Save, RotateCcw } from 'lucide-react'
import { useTheme, Theme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

const editThemeSchema = z.object({
  primary: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  secondary: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  accent: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  background: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  foreground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  muted: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  card: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  border: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
})

type EditThemeFormData = z.infer<typeof editThemeSchema>

export const ThemeEditor: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const { availableThemes, setTheme, currentTheme } = useTheme()
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const isAdmin = userProfile?.role === 'platform_admin'
  const editableThemes = availableThemes.filter(theme => !theme.isDefault || isAdmin)

  const form = useForm<EditThemeFormData>({
    resolver: zodResolver(editThemeSchema),
    defaultValues: {
      primary: '222.2 84% 4.9%',
      secondary: '210 40% 96%',
      accent: '210 40% 96%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      card: '0 0% 100%',
      border: '214.3 31.8% 91.4%',
    },
  })

  const handleEditTheme = (theme: Theme) => {
    setSelectedTheme(theme)
    form.reset({
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      background: theme.colors.background,
      foreground: theme.colors.foreground,
      muted: theme.colors.muted,
      card: theme.colors.card,
      border: theme.colors.border,
    })
    setIsDialogOpen(true)
  }

  const handlePreview = () => {
    const formData = form.getValues()
    const root = document.documentElement

    // Apply preview styles
    Object.entries(formData).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })

    setIsPreviewMode(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setTheme(currentTheme.id)
      setIsPreviewMode(false)
    }, 3000)
  }

  const handleSaveChanges = async (data: EditThemeFormData) => {
    if (!selectedTheme) return

    try {
      // Prevent editing default themes for non-admins
      if (selectedTheme.isDefault && !isAdmin) {
        toast({
          title: 'Error',
          description: 'Only administrators can edit default themes',
          variant: 'destructive'
        })
        return
      }

      const updatedColors = {
        ...selectedTheme.colors,
        primary: data.primary,
        secondary: data.secondary,
        accent: data.accent,
        background: data.background,
        foreground: data.foreground,
        muted: data.muted,
        card: data.card,
        border: data.border,
      }

      // Check if this is a database theme (try to update in DB first)
      if (!selectedTheme.isDefault) {
        const { data: existingTheme } = await supabase
          .from('themes')
          .select('id')
          .eq('id', selectedTheme.id)
          .maybeSingle()

        if (existingTheme) {
          // Theme exists in database, update it
          const { error } = await supabase
            .from('themes')
            .update({ colors: updatedColors })
            .eq('id', selectedTheme.id)

          if (error) throw error
        } else {
          // Theme is local only, update in localStorage
          const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]')
          const themeIndex = customThemes.findIndex((t: Theme) => t.id === selectedTheme.id)
          
          if (themeIndex !== -1) {
            customThemes[themeIndex] = { ...selectedTheme, colors: updatedColors }
            localStorage.setItem('customThemes', JSON.stringify(customThemes))
          }
        }
      }

      // Apply the changes immediately
      const root = document.documentElement
      Object.entries(data).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
        root.style.setProperty(cssVar, value)
      })

      toast({
        title: 'Success',
        description: `Theme "${selectedTheme.name}" updated successfully`
      })

      setIsDialogOpen(false)
      setSelectedTheme(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update theme',
        variant: 'destructive'
      })
    }
  }

  const handleResetTheme = () => {
    if (selectedTheme) {
      form.reset({
        primary: selectedTheme.colors.primary,
        secondary: selectedTheme.colors.secondary,
        accent: selectedTheme.colors.accent,
        background: selectedTheme.colors.background,
        foreground: selectedTheme.colors.foreground,
        muted: selectedTheme.colors.muted,
        card: selectedTheme.colors.card,
        border: selectedTheme.colors.border,
      })
    }
  }

  const colorFields = [
    { name: 'primary', label: 'Primary Color', description: 'Main brand color' },
    { name: 'secondary', label: 'Secondary Color', description: 'Secondary elements' },
    { name: 'accent', label: 'Accent Color', description: 'Accent elements' },
    { name: 'background', label: 'Background', description: 'Main background' },
    { name: 'foreground', label: 'Foreground', description: 'Main text color' },
    { name: 'muted', label: 'Muted Background', description: 'Subtle background' },
    { name: 'card', label: 'Card Background', description: 'Card backgrounds' },
    { name: 'border', label: 'Border Color', description: 'Element borders' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme Editor
        </CardTitle>
        <CardDescription>
          Customize the appearance of existing themes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Theme to Edit</label>
            <Select value={selectedTheme?.id || ''} onValueChange={(value) => {
              const theme = editableThemes.find(t => t.id === value)
              if (theme) handleEditTheme(theme)
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a theme to customize" />
              </SelectTrigger>
              <SelectContent>
                {editableThemes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                      />
                      {theme.name}
                      {theme.isDefault && <Badge variant="outline">Default</Badge>}
                      {!theme.isDefault && <Badge variant="secondary">Custom</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTheme && (
            <div className="flex gap-2">
              <Button onClick={() => setTheme(selectedTheme.id)} variant="outline">
                Apply Theme
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Colors
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit {selectedTheme.name} Theme</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Color Configuration</h3>
                        {isPreviewMode && (
                          <Badge variant="outline" className="animate-pulse">
                            Previewing... (3s)
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {colorFields.map((field) => (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name as keyof EditThemeFormData}
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

                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={handlePreview}>
                          <Palette className="w-4 h-4 mr-2" />
                          Preview (3s)
                        </Button>
                        <Button type="button" variant="outline" onClick={handleResetTheme}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button type="submit">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}