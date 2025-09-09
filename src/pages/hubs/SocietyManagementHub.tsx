import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { 
  Users, 
  UserCog, 
  MessageSquare, 
  Calendar,
  Bell,
  Settings,
  TrendingUp,
  ChevronRight
} from "lucide-react"

const SocietyManagementHub = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: "Member Management",
      description: "Manage society members, households, and resident profiles",
      icon: Users,
      href: "/society-member-management",
      status: "Enhanced",
      color: "from-blue-500 to-blue-600",
      features: ["Member Directory", "Household Management", "Profile Updates", "Access Control"]
    },
    {
      title: "Staff Management", 
      description: "Manage society staff, roles, and schedules",
      icon: UserCog,
      href: "/staff-management",
      status: "Available",
      color: "from-green-500 to-green-600",
      features: ["Staff Directory", "Role Assignment", "Shift Management", "Performance Tracking"]
    },
    {
      title: "Communication Hub",
      description: "Community forum, announcements, and messaging",
      icon: MessageSquare,
      href: "/community-forum",
      status: "Enhanced",
      color: "from-purple-500 to-purple-600",
      features: ["Discussion Forums", "Announcements", "Direct Messaging", "Polls & Surveys"]
    },
    {
      title: "Event Management",
      description: "Organize and manage society events and activities",
      icon: Calendar,
      href: "/events",
      status: "Available",
      color: "from-orange-500 to-orange-600",
      features: ["Event Planning", "Booking Management", "Guest Registration", "Event Analytics"]
    },
    {
      title: "Alerts & Notifications",
      description: "Emergency alerts and important notifications",
      icon: Bell,
      href: "/alerts",
      status: "Available",
      color: "from-red-500 to-red-600",
      features: ["Emergency Alerts", "Maintenance Notices", "Security Updates", "Custom Notifications"]
    },
    {
      title: "Society Settings",
      description: "Configure society policies and system preferences",
      icon: Settings,
      href: "/settings",
      status: "Available",
      color: "from-gray-500 to-gray-600",
      features: ["Policy Management", "System Configuration", "Integration Settings", "User Preferences"]
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
          Society Management Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive tools for managing your residential society
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">{modules.length} Modules Available</Badge>
          <Badge variant="outline">{modules.filter(m => m.status === "Enhanced").length} Enhanced Features</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm text-muted-foreground">Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <UserCog className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">25</div>
            <div className="text-sm text-muted-foreground">Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Events This Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
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
                variant={module.status === "Enhanced" ? "default" : "outline"}
              >
                {module.status === "Enhanced" ? "Explore Enhanced Features" : "Access Module"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SocietyManagementHub