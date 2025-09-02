import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface AdvertisementCampaignFormProps {
  onSuccess?: () => void
}

export const AdvertisementCampaignForm: React.FC<AdvertisementCampaignFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Advertisement Campaign Management"
      description="Create and manage advertising campaigns for your community"
      features={[
        "Digital signage campaigns",
        "Banner and promotional materials",
        "Sponsored events management", 
        "Campaign analytics and reporting"
      ]}
    />
  )
}