import React from 'react'
import { Check, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/contexts/ThemeContext'

export const ThemeSelector: React.FC = () => {
  const { currentTheme, availableThemes, setTheme } = useTheme()

  const handleThemeSelect = async (themeId: string) => {
    await setTheme(themeId)
  }

  const getColorPreview = (colors: any) => {
    return (
      <div className="flex space-x-1">
        <div 
          className="w-4 h-4 rounded-full border border-gray-200" 
          style={{ backgroundColor: `hsl(${colors.primary})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-gray-200" 
          style={{ backgroundColor: `hsl(${colors.secondary})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border border-gray-200" 
          style={{ backgroundColor: `hsl(${colors.accent})` }}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme Selection
        </CardTitle>
        <CardDescription>
          Choose a theme to customize the appearance of your interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableThemes.map((theme) => (
            <div
              key={theme.id}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                currentTheme.id === theme.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {currentTheme.id === theme.id && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{theme.name}</h3>
                  {theme.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Color Preview</div>
                  {getColorPreview(theme.colors)}
                </div>
                
                {/* Mini preview of the theme */}
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
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Current theme: <span className="font-medium">{currentTheme.name}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}