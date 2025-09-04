import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Megaphone, 
  Users, 
  Smartphone, 
  Shield, 
  Calendar, 
  QrCode, 
  CreditCard, 
  Network 
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const RoutineManagement = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: "HelpDesk",
      description: "Ticket management and support system",
      icon: MessageSquare,
      path: "/helpdesk",
      status: "Available",
      features: ["Ticket Tracking", "SLA Management", "Priority Handling"]
    },
    {
      title: "Announcements",
      description: "Community announcements with targeting",
      icon: Megaphone,
      path: "/announcements",
      status: "New",
      features: ["Priority Levels", "Expiry Dates", "Resident Targeting"]
    },
    {
      title: "Resident Database",
      description: "Comprehensive resident management with change logs",
      icon: Users,
      path: "/residents",
      status: "Enhanced",
      features: ["Change Logs", "Document Tracking", "Family Management"]
    },
    {
      title: "Resident App + Portal",
      description: "Mobile-responsive resident interface",
      icon: Smartphone,
      path: "/resident-portal",
      status: "Available",
      features: ["Maintenance Payments", "Complaint Tracking", "Mobile Access"]
    },
    {
      title: "Admin App + Portal",
      description: "Administrative management interface",
      icon: Shield,
      path: "/admin-portal",
      status: "New",
      features: ["Resident Management", "Billing", "Reports"]
    },
    {
      title: "Booking Home Services",
      description: "Service provider booking system",
      icon: Calendar,
      path: "/home-services",
      status: "New",
      features: ["Service Providers", "Booking Calendar", "Payment Integration"]
    },
    {
      title: "Visitor Invitation with Guest Code",
      description: "QR codes and time-limited access",
      icon: QrCode,
      path: "/visitor-invitations",
      status: "Enhanced",
      features: ["Guest Codes", "QR Generation", "Time Limits"]
    },
    {
      title: "Resident ID Card (with QR)",
      description: "Digital ID cards with QR codes",
      icon: CreditCard,
      path: "/digital-id-cards",
      status: "New",
      features: ["QR Codes", "Digital Wallet", "Access Control"]
    },
    {
      title: "Private Social Network",
      description: "Resident-only community network",
      icon: Network,
      path: "/social-network",
      status: "Enhanced",
      features: ["Forum Posts", "Event Sharing", "Neighborhood Watch"]
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
        <h1 className="text-3xl font-bold mb-2">Routine Management</h1>
        <p className="text-muted-foreground">
          Comprehensive daily operations and resident service management
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

export default RoutineManagement