import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Car, 
  ArrowLeftRight, 
  BarChart3, 
  FolderOpen, 
  Building, 
  FileText 
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const SocietyManagementNew = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: "Events Calendar & Albums",
      description: "Full calendar with photo albums and RSVP tracking",
      icon: Calendar,
      path: "/events",
      status: "Enhanced",
      features: ["Photo Albums", "RSVP Tracking", "Event History"]
    },
    {
      title: "Amenity Booking",
      description: "Advanced booking with conflict resolution",
      icon: MapPin,
      path: "/amenity-management",
      status: "Enhanced",
      features: ["Conflict Resolution", "Payment Integration", "Usage Tracking"]
    },
    {
      title: "Staff Manager",
      description: "Staff scheduling and performance tracking",
      icon: Users,
      path: "/staff-management",
      status: "Enhanced",
      features: ["Scheduling", "Performance Tracking", "Payroll Integration"]
    },
    {
      title: "Parking Manager",
      description: "Automated gates and violation tracking",
      icon: Car,
      path: "/parking",
      status: "Enhanced",
      features: ["Slot Assignment", "Violation Tracking", "Automated Gates"]
    },
    {
      title: "Move IN - Move OUT",
      description: "Process management with checklists",
      icon: ArrowLeftRight,
      path: "/move-management",
      status: "New",
      features: ["Checklist Management", "Deposit Handling", "Key Management"]
    },
    {
      title: "Admin Reports",
      description: "Comprehensive reporting dashboard",
      icon: BarChart3,
      path: "/admin-reports",
      status: "New",
      features: ["Analytics Dashboard", "Export Options", "Scheduled Reports"]
    },
    {
      title: "Projects & Meetings",
      description: "Project tracking and meeting minutes",
      icon: FolderOpen,
      path: "/projects-meetings",
      status: "New",
      features: ["Project Tracking", "Meeting Minutes", "Decision Logs"]
    },
    {
      title: "Vendor Master",
      description: "Contract management and performance ratings",
      icon: Building,
      path: "/vendor-management",
      status: "New",
      features: ["Contract Management", "Performance Ratings", "Vendor Database"]
    },
    {
      title: "AMC",
      description: "Annual maintenance contract tracking",
      icon: FileText,
      path: "/amc-management",
      status: "New",
      features: ["Contract Tracking", "Renewal Alerts", "Service History"]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800"
      case "Enhanced": return "bg-blue-100 text-blue-800"
      case "New": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Society Management</h1>
        <p className="text-muted-foreground">
          Advanced society operations and community management tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <module.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <Badge className={getStatusColor(module.status)} variant="secondary">
                      {module.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Features:</h4>
                  <ul className="text-sm space-y-1">
                    {module.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(module.path)}
                  variant={module.status === "Available" ? "default" : "outline"}
                >
                  {module.status === "Available" ? "Open Module" : "View Details"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SocietyManagementNew