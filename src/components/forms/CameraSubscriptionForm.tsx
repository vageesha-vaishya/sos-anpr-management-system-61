import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface CameraSubscriptionFormProps {
  onSuccess?: () => void
}

export const CameraSubscriptionForm: React.FC<CameraSubscriptionFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Camera Subscription Management"
      description="Manage ANPR camera subscriptions and billing plans"
      features={[
        "Subscription plan management",
        "Billing automation",
        "Usage analytics", 
        "Feature access control"
      ]}
    />
  )
}