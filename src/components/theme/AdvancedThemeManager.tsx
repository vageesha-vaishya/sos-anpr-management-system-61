import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Download, Eye, Settings, Sparkles } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { ThemeSelector } from './ThemeSelector'
import { ThemeEditor } from './ThemeEditor'

export const AdvancedThemeManager: React.FC = () => {
  const { currentTheme, availableThemes, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('gallery')

  const getColorPreview = (colors: any) => {
    return (
      <div className="flex gap-1">
        <div 
          className="w-4 h-4 rounded-full border border-border" 
          style={{ backgroundColor: `hsl(${colors.primary})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-border" 
          style={{ backgroundColor: `hsl(${colors.secondary})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-border" 
          style={{ backgroundColor: `hsl(${colors.accent})` }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Theme Manager</h1>
          <p className="text-muted-foreground">
            Customize your application with beautiful themes, color shades, and gradients
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {availableThemes.length} Themes Available
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Theme Gallery
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Theme Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Live Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Theme</CardTitle>
              <CardDescription>
                Select from our curated collection of beautiful themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Themes</CardTitle>
              <CardDescription>
                Preview all available themes with advanced color palettes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentTheme.id === theme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setTheme(theme.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{theme.name}</h3>
                        {theme.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {theme.description}
                          </p>
                        )}
                      </div>
                      {theme.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Colors</span>
                        {getColorPreview(theme.colors)}
                      </div>
                      
                      {theme.colors.gradientPrimary && (
                        <div className="h-6 rounded-md" style={{ 
                          background: theme.colors.gradientPrimary 
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor">
          <ThemeEditor />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Theme Preview</CardTitle>
              <CardDescription>
                See how your current theme looks across different components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                    <h3 className="font-semibold">Primary Color</h3>
                    <p className="text-sm opacity-90">Main brand color</p>
                  </div>
                  <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                    <h3 className="font-semibold">Secondary Color</h3>
                    <p className="text-sm opacity-90">Supporting color</p>
                  </div>
                  <div className="p-4 bg-accent text-accent-foreground rounded-lg">
                    <h3 className="font-semibold">Accent Color</h3>
                    <p className="text-sm opacity-90">Highlight color</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="gradient-primary p-4 text-white rounded-lg">
                    <h3 className="font-semibold">Primary Gradient</h3>
                    <p className="text-sm opacity-90">Beautiful gradient effects</p>
                  </div>
                  <div className="p-4 border rounded-lg shadow-primary">
                    <h3 className="font-semibold">Primary Shadow</h3>
                    <p className="text-sm text-muted-foreground">Elegant shadow effects</p>
                  </div>
                  <Button className="w-full glow-primary">
                    Glowing Button Effect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}