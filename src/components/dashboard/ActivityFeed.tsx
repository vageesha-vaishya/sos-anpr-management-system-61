import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Camera, 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield,
  Users,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'detection' | 'alert' | 'user' | 'system'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  icon: React.ReactNode
  color: string
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'detection',
    title: 'Vehicle Detected',
    description: 'ABC-1234 • Main Gate Camera',
    timestamp: '2 min ago',
    status: 'success',
    icon: <Car className="w-4 h-4" />,
    color: 'bg-success/10 text-success'
  },
  {
    id: '2',
    type: 'alert',
    title: 'Security Alert',
    description: 'Blacklisted vehicle detected at Gate B',
    timestamp: '5 min ago',
    status: 'error',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-destructive/10 text-destructive'
  },
  {
    id: '3',
    type: 'system',
    title: 'Camera Online',
    description: 'Parking Camera 2 reconnected',
    timestamp: '12 min ago',
    status: 'info',
    icon: <Camera className="w-4 h-4" />,
    color: 'bg-primary/10 text-primary'
  },
  {
    id: '4',
    type: 'user',
    title: 'New User Added',
    description: 'John Doe joined Security Team',
    timestamp: '1 hour ago',
    status: 'info',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-primary/10 text-primary'
  }
]

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setActivities(mockActivities)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          Recent Activity
        </CardTitle>
        <CardDescription>Latest system events and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={activity.id}
                className={cn(
                  "flex items-start space-x-4 p-3 rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fade-in",
                  "hover:border-primary/20"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Avatar className={cn("w-10 h-10", activity.color)}>
                  <AvatarFallback className={activity.color}>
                    {activity.icon}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {activity.timestamp}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}