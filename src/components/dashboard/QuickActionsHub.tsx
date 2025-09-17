import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  Users, 
  DollarSign, 
  MessageSquare, 
  Calendar,
  Shield,
  TrendingUp
} from 'lucide-react'

export const QuickActionsHub = () => {
  const quickActions = [
    {
      title: 'Create Notice',
      description: 'Send announcements to residents',
      icon: MessageSquare,
      href: '/society-management-enhanced',
      color: 'text-blue-600',
      isNew: true
    },
    {
      title: 'Add Transaction',
      description: 'Record financial transaction',
      icon: DollarSign,
      href: '/financial-hub?tab=books',
      color: 'text-green-600',
      isNew: true
    },
    {
      title: 'Manage Members',
      description: 'Add or update society members',
      icon: Users,
      href: '/society-management-enhanced',
      color: 'text-purple-600',
      isNew: true
    },
    {
      title: 'View Analytics',
      description: 'Check society performance',
      icon: TrendingUp,
      href: '/dashboard',
      color: 'text-orange-600',
      isNew: true
    },
    {
      title: 'Security Alert',
      description: 'Create security notification',
      icon: Shield,
      href: '/alerts',
      color: 'text-red-600',
      isNew: false
    },
    {
      title: 'Schedule Event',
      description: 'Plan community events',
      icon: Calendar,
      href: '/events',
      color: 'text-indigo-600',
      isNew: false
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Quick Actions</span>
          <Badge variant="secondary" className="text-xs">Enhanced</Badge>
        </CardTitle>
        <CardDescription>
          Common tasks for society management and operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              size="sm"
              className="h-auto p-3 flex flex-col items-center space-y-2 hover:bg-primary/5"
              asChild
            >
              <Link to={action.href}>
                <div className={`p-2 rounded-lg bg-gray-100 ${action.color}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium">{action.title}</span>
                    {action.isNew && <Badge variant="secondary" className="text-[10px] px-1">NEW</Badge>}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{action.description}</span>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}