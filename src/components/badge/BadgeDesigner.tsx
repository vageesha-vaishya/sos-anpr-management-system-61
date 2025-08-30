import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'
import { Palette, Type, Layout } from 'lucide-react'

interface DesignConfig {
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  logoPosition?: 'top' | 'bottom' | 'left' | 'right'
  layout?: 'standard' | 'compact' | 'detailed'
}

interface BadgeDesignerProps {
  designConfig: DesignConfig
  onDesignChange: (config: DesignConfig) => void
}

export const BadgeDesigner = ({ designConfig, onDesignChange }: BadgeDesignerProps) => {
  const handleConfigChange = (key: keyof DesignConfig, value: any) => {
    onDesignChange({
      ...designConfig,
      [key]: value
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Colors & Styling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <ColorPicker
              value={designConfig.backgroundColor}
              onChange={(value) => handleConfigChange('backgroundColor', value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Text Color</Label>
            <ColorPicker
              value={designConfig.textColor}
              onChange={(value) => handleConfigChange('textColor', value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Font Size: {designConfig.fontSize}px</Label>
            <Slider
              value={[designConfig.fontSize]}
              onValueChange={([value]) => handleConfigChange('fontSize', value)}
              min={10}
              max={24}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Layout & Positioning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo Position</Label>
            <Select 
              value={designConfig.logoPosition} 
              onValueChange={(value) => handleConfigChange('logoPosition', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Badge Layout</Label>
            <Select 
              value={designConfig.layout} 
              onValueChange={(value) => handleConfigChange('layout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Preview Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="w-full h-48 rounded-lg border-2 border-dashed flex items-center justify-center relative"
            style={{ 
              backgroundColor: `hsl(${designConfig.backgroundColor})`,
              color: `hsl(${designConfig.textColor})`,
              fontSize: `${designConfig.fontSize}px`
            }}
          >
            <div className="text-center space-y-2">
              {designConfig.logoPosition === 'top' && (
                <div className="w-12 h-8 bg-primary/20 rounded mb-2 mx-auto"></div>
              )}
              
              <div className="font-bold">John Doe</div>
              <div className="text-sm opacity-70">Visitor</div>
              <div className="text-xs opacity-50">
                {designConfig.layout === 'detailed' && 'Company: ABC Corp'}
              </div>
              
              {designConfig.logoPosition === 'bottom' && (
                <div className="w-12 h-8 bg-primary/20 rounded mt-2 mx-auto"></div>
              )}
            </div>
            
            {(designConfig.logoPosition === 'left' || designConfig.logoPosition === 'right') && (
              <div 
                className={`absolute ${
                  designConfig.logoPosition === 'left' ? 'left-2' : 'right-2'
                } top-2 w-8 h-8 bg-primary/20 rounded`}
              ></div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}