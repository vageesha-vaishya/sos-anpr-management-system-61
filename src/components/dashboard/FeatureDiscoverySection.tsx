import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  DollarSign, 
  MessageSquare, 
  BarChart3, 
  ArrowRight,
  Users,
  Sparkles
} from 'lucide-react'

export const FeatureDiscoverySection = () => {
  const newFeatures = [
    {
      title: 'Enhanced Society Management',
      description: 'Complete society operations with advanced member management, maintenance tracking, and automated workflows.',
      icon: Building2,
      href: '/society-management-enhanced',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      features: ['Member Management', 'Unit Tracking', 'Maintenance Requests', 'Document Storage']
    },
    {
      title: 'Financial Management Hub',
      description: 'Complete financial management with overview, books management, and comprehensive reporting in one unified interface.',
      icon: DollarSign,
      href: '/financial-hub',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      features: ['Financial Overview', 'Books Management', 'Reports & Analytics', 'Multi-Tab Interface']
    },
    {
      title: 'Communication Hub',
      description: 'Multi-channel communication system for notices, announcements, and community engagement.',
      icon: MessageSquare,
      href: '/community-forum',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      features: ['Notice Board', 'SMS/Email', 'Community Forum', 'Emergency Alerts']
    },
    {
      title: 'Analytics Dashboard',
      description: 'Real-time insights and metrics with customizable dashboards and detailed analytics.',
      icon: BarChart3,
      href: '/dashboard',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      features: ['Live Metrics', 'Custom Reports', 'Trend Analysis', 'Data Export']
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">New Phase 1 Features</h2>
        <Badge variant="secondary">4 Enhanced Modules</Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {newFeatures.map((feature) => (
          <Card key={feature.title} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${feature.bgColor}`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <Badge variant="outline" className="text-xs">Enhanced</Badge>
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {feature.features.map((item) => (
                  <Badge key={item} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground" asChild>
                <Link to={feature.href}>
                  Explore Feature
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}