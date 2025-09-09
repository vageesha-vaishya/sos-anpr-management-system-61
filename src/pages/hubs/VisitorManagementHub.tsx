import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { 
  Monitor, 
  UserCheck, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  ChevronRight
} from "lucide-react"

const VisitorManagementHub = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: "Visitor Dashboard",
      description: "Real-time visitor analytics and management overview",
      icon: Monitor,
      href: "/visitor-dashboard",
      status: "Available",
      color: "from-blue-500 to-blue-600",
      features: ["Live Analytics", "Visitor Insights", "Performance Metrics", "Custom Reports"]
    },
    {
      title: "Check-in Kiosk",
      description: "Self-service visitor check-in and registration system",
      icon: UserCheck,
      href: "/visitor-checkin",
      status: "Available",
      color: "from-green-500 to-green-600",
      features: ["Self Check-in", "QR Code Scanning", "ID Verification", "Photo Capture"]
    },
    {
      title: "Hosts Management",
      description: "Manage host profiles and visitor approvals",
      icon: Users,
      href: "/hosts",
      status: "Available",
      color: "from-purple-500 to-purple-600",
      features: ["Host Directory", "Approval Workflow", "Notification System", "Visit History"]
    },
    {
      title: "Pre-Registrations",
      description: "Advanced visitor pre-registration system",
      icon: Calendar,
      href: "/pre-registrations",
      status: "Available",
      color: "from-orange-500 to-orange-600",
      features: ["Advance Booking", "Recurring Visits", "Bulk Registration", "Approval Management"]
    },
    {
      title: "Visitor Records",
      description: "Complete visitor database and history tracking",
      icon: Users,
      href: "/visitors",
      status: "Available",
      color: "from-teal-500 to-teal-600",
      features: ["Visitor Database", "Visit History", "Search & Filter", "Export Reports"]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enhanced": return "bg-blue-100 text-blue-800 border-blue-200"
      case "New": return "bg-green-100 text-green-800 border-green-200"
      case "Available": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Visitor Management System
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete visitor management solution for enhanced security
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">{modules.length} VMS Modules</Badge>
          <Badge variant="outline">Security & Access Control</Badge>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <UserCheck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">45</div>
            <div className="text-sm text-muted-foreground">Today's Visitors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Currently Inside</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">28</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">15%</div>
            <div className="text-sm text-muted-foreground">Weekly Growth</div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${module.color}`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <Badge className={getStatusColor(module.status)}>
                  {module.status}
                </Badge>
              </div>
              <CardTitle className="text-xl">{module.title}</CardTitle>
              <CardDescription className="text-base">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">Key Features:</h4>
                <ul className="space-y-1">
                  {module.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => navigate(module.href)}
                variant="outline"
              >
                Access Module
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default VisitorManagementHub