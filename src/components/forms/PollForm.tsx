import React from 'react'
import { ComingSoonForm } from '@/components/forms/ComingSoonForm'

interface PollFormProps {
  onSuccess?: () => void
  editData?: any
}

export const PollForm: React.FC<PollFormProps> = ({ onSuccess, editData }) => {
  return (
    <ComingSoonForm 
      title="Poll Management"
      description="Community polling and voting system will be available soon. This feature will allow residents to participate in community decisions and provide feedback on important matters."
    />
  )
}