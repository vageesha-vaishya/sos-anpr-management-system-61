import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ComingSoonForm } from './ComingSoonForm'

interface PollFormProps {
  onSuccess?: () => void
  editData?: any
}

export const PollForm: React.FC<PollFormProps> = ({ onSuccess, editData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit Poll' : 'Create New Poll'}</CardTitle>
        <CardDescription>
          Poll functionality is coming soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ComingSoonForm 
          title="Polls and Community Voting"
          description="Enable community decision making through polls and voting"
          features={["Single Choice Polls", "Multiple Choice Polls", "Anonymous Voting", "Real-time Results", "Deadline Management"]} 
        />
      </CardContent>
    </Card>
  )
}