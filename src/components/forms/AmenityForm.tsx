import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface AmenityFormProps {
  onSuccess?: () => void
}

export const AmenityForm: React.FC<AmenityFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Amenity Management"
      description="Manage community amenities like pools, gyms, and common areas"
      features={[
        "Amenity booking system",
        "Usage tracking and analytics", 
        "Maintenance scheduling",
        "Pricing and availability management"
      ]}
    />
  )
}