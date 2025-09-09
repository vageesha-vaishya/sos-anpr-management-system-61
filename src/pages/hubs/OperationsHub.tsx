import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { 
  Shield, 
  Bell, 
  Home, 
  Car,
  Calendar,
  Package,
  Settings,
  TrendingUp,
  ChevronRight
} from "lucide-react"

const OperationsHub = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: "Routine Management",
      description: "Daily operations and routine task management",
      icon: Settings,
      href: "/routine-management",
      status: "Available",
      color: "from-blue-500 to-blue-600",
      features: ["Task Scheduling", "Staff Assignments", "Progress Tracking", "Performance Reports"]
    },
    {
      title: "Gatekeeper Module",
      description: "Security management and gate operations",
      icon: Shield,
      href: "/gatekeeper",
      status: "Available",
      color: "from-green-500 to-green-600",
      features: ["Gate Operations", "Security Protocols", "Access Control", "Incident Reports"]
    },
    {
      title: "Security & Alerts",
      description: "Emergency alerts and security notifications",
      icon: Bell,
      href: "/alerts",
      status: "Available",
      color: "from-red-500 to-red-600",
      features: ["Emergency Alerts", "Security Incidents", "Automated Notifications", "Response Management"]
    },
    {
      title: "Amenity Management",
      description: "Manage society amenities and booking system",
      icon: Home,
      href: "/amenity-management",
      status: "Available",
      color: "from-purple-500 to-purple-600",
      features: ["Amenity Booking", "Usage Tracking", "Maintenance Schedule", "User Preferences"]
    },
    {
      title: "Event Management",
      description: "Organize and manage society events",
      icon: Calendar,
      href: "/events",
      status: "Available",
      color: "from-orange-500 to-orange-600",
      features: ["Event Planning", "Venue Booking", "Guest Management", "Event Analytics"]
    },
    {
      title: "Asset Management",
      description: "Track and manage society assets and inventory",
      icon: Package,
      href: "/assets",
      status: "Available",
      color: "from-teal-500 to-teal-600",
      features: ["Asset Tracking", "Maintenance Records", "Inventory Management", "Depreciation Tracking"]
    },
    {
      title: "Parking Management",
      description: "Manage parking spaces and vehicle registration",
      icon: Car,
      href: "/parking",
      status: "Available",
      color: "from-indigo-500 to-indigo-600",
      features: ["Parking Allocation", "Vehicle Registration", "Violation Tracking", "Space Optimization"]
    },
    {
      title: "Vehicle Management",
      description: "Vehicle whitelist, blacklist, and access control",
      icon: Car,
      href: "/vehicles",
      status: "Available",
      color: "from-gray-500 to-gray-600",
      features: ["Vehicle Database", "Access Control", "Violation Management", "Registration Tracking"]
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
          Operations Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          Streamline daily operations and security management
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">{modules.length} Operational Modules</Badge>
          <Badge variant="outline">Security & Management</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm text-muted-foreground">Security Coverage</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Car className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">150</div>
            <div className="text-sm text-muted-foreground">Parking Spaces</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Home className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Active Amenities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">98%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
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

export default OperationsHub