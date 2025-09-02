import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Construction } from 'lucide-react'

interface ComingSoonFormProps {
  title: string
  description: string
  features?: string[]
}

export const ComingSoonForm: React.FC<ComingSoonFormProps> = ({ 
  title, 
  description, 
  features = [] 
}) => {
  return (
    <Card className="opacity-75">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Construction className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-muted-foreground">{title}</CardTitle>
          <Badge variant="outline">Coming Soon</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {features.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-muted-foreground">Planned Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        )}
        <Button disabled variant="outline" className="w-full">
          Feature Under Development
        </Button>
      </CardContent>
    </Card>
  )
}