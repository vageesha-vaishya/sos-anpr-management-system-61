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
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ColorPicker } from '@/components/ui/color-picker'
import { Plus, Palette, Edit, Trash2, Eye } from 'lucide-react'
import { useTheme, Theme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

const themeSchema = z.object({
  name: z.string().min(1, 'Theme name is required'),
  // Primary colors
  primary: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format (e.g., "222.2 84% 4.9%")'),
  primaryForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  secondary: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  secondaryForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  accent: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  accentForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  // Background colors
  background: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  foreground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  muted: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  mutedForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  // Card colors
  card: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  cardForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  // Border and input
  border: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  input: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  ring: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  // Destructive colors
  destructive: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
  destructiveForeground: z.string().regex(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/, 'Invalid HSL format'),
})

type ThemeFormData = z.infer<typeof themeSchema>

export const CustomThemeCreator: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [deletingTheme, setDeletingTheme] = useState<Theme | null>(null)
  const { availableThemes, createCustomTheme, deleteCustomTheme, setTheme, currentTheme } = useTheme()
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const isAdmin = userProfile?.role === 'platform_admin'
  const customThemes = availableThemes.filter(theme => !theme.isDefault)

  const form = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      name: '',
      primary: '222.2 84% 4.9%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
    },
  })

  const onSubmit = async (data: ThemeFormData) => {
    try {
      const themeColors = {
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

      // Create dark colors (same as light for now - can be customized later)
      const darkColors = { ...themeColors }

      // TODO: Implement custom theme creation
      console.log('Creating custom theme:', data.name, themeColors)

      toast({
        title: 'Success',
        description: `Theme "${data.name}" created successfully`,
      })

      // Update theme context to reload available themes
      await createCustomTheme({
        name: data.name,
        colors: themeColors,
        darkColors: darkColors
      })

      form.reset()
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error('Error creating theme:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create theme',
        variant: 'destructive',
      })
    }
  }

  const handlePreview = async () => {
    const formData = form.getValues()
    const previewTheme: Theme = {
      id: 'preview',
      name: 'Preview',
      isDefault: false,
      colors: {
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
    }

    // Temporarily apply preview theme
    const root = document.documentElement
    Object.entries(previewTheme.colors).forEach(([key, value]) => {
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

  const handleDelete = async () => {
    if (deletingTheme) {
      await deleteCustomTheme(deletingTheme.id)
      setDeletingTheme(null)
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Custom Themes
          </CardTitle>
          <CardDescription>
            Admin access required to create and manage custom themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Only administrators can create custom themes
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const colorFields = [
    { name: 'primary', label: 'Primary Color', description: 'Main brand color' },
    { name: 'primaryForeground', label: 'Primary Foreground', description: 'Text on primary color' },
    { name: 'secondary', label: 'Secondary Color', description: 'Secondary elements' },
    { name: 'secondaryForeground', label: 'Secondary Foreground', description: 'Text on secondary' },
    { name: 'accent', label: 'Accent Color', description: 'Accent elements' },
    { name: 'accentForeground', label: 'Accent Foreground', description: 'Text on accent' },
    { name: 'background', label: 'Background', description: 'Main background' },
    { name: 'foreground', label: 'Foreground', description: 'Main text color' },
    { name: 'muted', label: 'Muted Background', description: 'Subtle background' },
    { name: 'mutedForeground', label: 'Muted Foreground', description: 'Subtle text' },
    { name: 'card', label: 'Card Background', description: 'Card backgrounds' },
    { name: 'cardForeground', label: 'Card Foreground', description: 'Text on cards' },
    { name: 'border', label: 'Border Color', description: 'Element borders' },
    { name: 'input', label: 'Input Background', description: 'Form inputs' },
    { name: 'ring', label: 'Focus Ring', description: 'Focus indicators' },
    { name: 'destructive', label: 'Destructive Color', description: 'Error/danger color' },
    { name: 'destructiveForeground', label: 'Destructive Foreground', description: 'Text on destructive' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Custom Theme Management
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Theme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Theme</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Custom Theme" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
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
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={handlePreview}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview (3s)
                    </Button>
                    <Button type="submit">
                      Create Theme
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Create and manage custom themes for your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {customThemes.length === 0 ? (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No custom themes created yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Create Theme" to add your first custom theme
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {customThemes.map((theme) => (
              <div
                key={theme.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{theme.name}</h3>
                    <Badge variant="outline">Custom</Badge>
                  </div>
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200" 
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200" 
                      style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200" 
                      style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(theme.id)}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeletingTheme(theme)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Custom Theme"
        description={`Are you sure you want to delete "${deletingTheme?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </Card>
  )
}