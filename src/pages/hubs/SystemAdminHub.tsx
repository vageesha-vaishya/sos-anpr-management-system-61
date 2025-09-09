import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Globe, 
  Users, 
  Building2, 
  Camera,
  MapPin,
  TrendingUp,
  DollarSign,
  Database,
  Settings,
  ChevronRight
} from "lucide-react"

const SystemAdminHub = () => {
  const navigate = useNavigate()
  const { userProfile } = useAuth()

  const modules = [
    {
      title: "Data Management",
      description: "Manage system data, imports, and database operations",
      icon: Database,
      href: "/data-management",
      status: "Available",
      color: "from-blue-500 to-blue-600",
      features: ["Data Import/Export", "Database Management", "Backup & Restore", "Data Validation"],
      roles: ['platform_admin', 'franchise_admin', 'customer_admin']
    },
    {
      title: "Master Data Management",
      description: "Configure system-wide master data and settings",
      icon: Globe,
      href: "/master-data-management",
      status: "Available",
      color: "from-green-500 to-green-600",
      features: ["Geographic Data", "Reference Tables", "System Configuration", "Global Settings"],
      roles: ['platform_admin', 'franchise_admin']
    },
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: Users,
      href: "/users",
      status: "Available",
      color: "from-purple-500 to-purple-600",
      features: ["User Accounts", "Role Management", "Permission Control", "Access Auditing"],
      roles: ['platform_admin', 'franchise_admin', 'customer_admin']
    },
    {
      title: "Franchise Management",
      description: "Manage franchise operations and configurations",
      icon: Building2,
      href: "/franchises",
      status: "Available",
      color: "from-orange-500 to-orange-600",
      features: ["Franchise Setup", "Territory Management", "Performance Tracking", "Resource Allocation"],
      roles: ['platform_admin']
    },
    {
      title: "Camera Management",
      description: "Configure and manage CCTV and ANPR cameras",
      icon: Camera,
      href: "/cameras",
      status: "Available",
      color: "from-teal-500 to-teal-600",
      features: ["Camera Configuration", "ANPR Setup", "Video Analytics", "Storage Management"],
      roles: ['platform_admin', 'franchise_admin', 'customer_admin']
    },
    {
      title: "Location Management",
      description: "Manage geographic locations and property mappings",
      icon: MapPin,
      href: "/locations",
      status: "Available",
      color: "from-red-500 to-red-600",
      features: ["Location Hierarchy", "Property Mapping", "GPS Configuration", "Area Management"],
      roles: ['platform_admin', 'franchise_admin']
    },
    {
      title: "ANPR Billing",
      description: "Automated Number Plate Recognition billing system",
      icon: Camera,
      href: "/anpr-service-billing",
      status: "Available",
      color: "from-indigo-500 to-indigo-600",
      features: ["ANPR Analytics", "Usage Billing", "Service Monitoring", "Performance Reports"],
      roles: ['platform_admin', 'franchise_admin']
    },
    {
      title: "Advertiser Management",
      description: "Manage advertising partners and campaigns",
      icon: TrendingUp,
      href: "/advertiser-management",
      status: "Available",
      color: "from-pink-500 to-pink-600",
      features: ["Partner Management", "Campaign Tracking", "Revenue Analytics", "Content Approval"],
      roles: ['platform_admin', 'franchise_admin']
    },
    {
      title: "System Billing",
      description: "Platform-level billing and financial management",
      icon: DollarSign,
      href: "/billing",
      status: "Available",
      color: "from-yellow-500 to-yellow-600",
      features: ["Subscription Management", "Invoice Generation", "Payment Processing", "Revenue Tracking"],
      roles: ['platform_admin', 'franchise_admin']
    }
  ]

  // Filter modules based on user role
  const filteredModules = modules.filter(module => 
    userProfile?.role && module.roles.includes(userProfile.role)
  )

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
          System Administration
        </h1>
        <p className="text-muted-foreground text-lg">
          Advanced system configuration and management tools
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">{filteredModules.length} Admin Modules</Badge>
          <Badge variant="outline">{userProfile?.role?.replace('_', ' ').toUpperCase()}</Badge>
        </div>
      </div>

      {/* System Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm text-muted-foreground">System Uptime</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">1,250</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">45</div>
            <div className="text-sm text-muted-foreground">Active Societies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Settings className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">128</div>
            <div className="text-sm text-muted-foreground">System Tasks</div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module, index) => (
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

export default SystemAdminHub