import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorPicker } from '@/components/ui/color-picker'
import { Badge } from '@/components/ui/badge'
import { Palette, Plus, Eye, Save, Sparkles } from 'lucide-react'
import { useTheme, Theme } from '@/contexts/ThemeContext'
import { useToast } from '@/hooks/use-toast'
import { createCompleteThemeColors } from '@/lib/theme-utils'

const customThemeSchema = z.object({
  name: z.string().min(1, 'Theme name is required'),
  description: z.string().optional(),
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

type CustomThemeFormData = z.infer<typeof customThemeSchema>

export const CustomThemeCreator: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const { createCustomTheme, currentTheme, setTheme } = useTheme()
  const { toast } = useToast()

  const form = useForm<CustomThemeFormData>({
    resolver: zodResolver(customThemeSchema),
    defaultValues: {
      name: '',
      description: '',
      primary: '196 100% 47%',
      primaryForeground: '0 0% 100%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 47.4% 11.2%',
      accent: '196 100% 47%',
      accentForeground: '0 0% 100%',
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '196 100% 47%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 100%',
    },
  })

  const onSubmit = async (data: CustomThemeFormData) => {
    try {
      toast({
        title: 'Creating Theme...',
        description: `Creating "${data.name}" theme`,
      })

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
      const themeDarkColors = {
        ...completeColors,
        background: '217 33% 7%',
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

      await createCustomTheme({
        name: data.name,
        description: data.description,
        colors: completeColors,
        darkColors: themeDarkColors
      })

      toast({
        title: 'Success',
        description: `Theme "${data.name}" created successfully`,
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

  const handlePreview = () => {
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
      id: 'preview',
      name: 'Preview',
      isDefault: false,
      colors: completeColors,
    }

    // Temporarily apply preview theme
    const root = document.documentElement
    Object.entries(previewTheme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value as string)
    })

    setIsPreviewMode(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setTheme(currentTheme.id)
      setIsPreviewMode(false)
    }, 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Custom Theme Creator
        </CardTitle>
        <CardDescription>
          Create your own unique theme with custom colors and gradients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Create Custom Theme
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Theme" {...field} />
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="A beautiful custom theme" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Tabs defaultValue="colors" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="colors">Core Colors</TabsTrigger>
                    <TabsTrigger value="ui">UI Elements</TabsTrigger>
                    <TabsTrigger value="status">Status Colors</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="colors" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primaryForeground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Foreground</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondaryForeground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Foreground</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Color</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accentForeground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Foreground</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="ui" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="background"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="foreground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Foreground</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="card"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Background</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cardForeground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Foreground</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="border"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Border</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="input"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Input</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="status" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="destructive"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destructive (Error)</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="destructiveForeground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destructive Foreground</FormLabel>
                            <FormControl>
                              <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handlePreview} className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    {isPreviewMode ? 'Previewing...' : 'Preview'}
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Create Theme
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}