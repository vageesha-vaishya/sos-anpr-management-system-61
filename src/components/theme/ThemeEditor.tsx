import React from 'react'
import { ComingSoonForm } from '@/components/forms/ComingSoonForm'

export const ThemeEditor: React.FC = () => {
  return (
    <ComingSoonForm 
      title="Theme Management"
      description="Advanced theme customization tools will be available soon. This feature will allow platform administrators to create and manage custom themes for their organizations."
      features={[
        "Custom color schemes",
        "Brand customization",
        "Logo management", 
        "Font selection",
        "Layout preferences",
        "Multi-theme support"
      ]}
    />
  )
}