import React, { useState } from 'react'
import { HslColorPicker } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ColorPickerProps {
  value: string // HSL format: "222.2 84% 4.9%"
  onChange: (value: string) => void
  className?: string
}

// Convert HSL string to HSL object for react-colorful
const hslStringToObject = (hslString: string) => {
  const match = hslString.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/)
  if (!match) return { h: 0, s: 0, l: 50 }
  
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3])
  }
}

// Convert HSL object to HSL string
const hslObjectToString = (hsl: { h: number; s: number; l: number }) => {
  return `${hsl.h.toFixed(1)} ${hsl.s.toFixed(1)}% ${hsl.l.toFixed(1)}%`
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const hslObject = hslStringToObject(value)

  const handleColorChange = (newColor: { h: number; s: number; l: number }) => {
    const newHslString = hslObjectToString(newColor)
    onChange(newHslString)
  }

  const handleInputChange = (newValue: string) => {
    // Validate HSL format before updating
    const hslRegex = /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/
    if (hslRegex.test(newValue) || newValue === '') {
      onChange(newValue)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-12 h-10 p-0 rounded border"
            style={{ backgroundColor: `hsl(${value})` }}
          >
            <span className="sr-only">Pick color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HslColorPicker
            color={hslObject}
            onChange={handleColorChange}
          />
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium">Preview</div>
            <div 
              className="w-full h-8 rounded border"
              style={{ backgroundColor: `hsl(${value})` }}
            />
            <div className="text-xs text-muted-foreground font-mono">
              hsl({value})
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="222.2 84% 4.9%"
        className="font-mono text-sm flex-1"
      />
    </div>
  )
}