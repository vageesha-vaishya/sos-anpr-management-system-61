import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface ChargeCategoryFormProps {
  onSuccess?: () => void
}

export const ChargeCategoryForm: React.FC<ChargeCategoryFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Charge Category Management"
      description="Manage billing charge categories and pricing structures"
      features={[
        "Custom charge categories",
        "Pricing tier management",
        "Billing rule configuration", 
        "Cost allocation tracking"
      ]}
    />
  )
}