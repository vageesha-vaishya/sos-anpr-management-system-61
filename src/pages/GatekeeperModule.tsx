import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Camera, 
  CreditCard, 
  Car, 
  AlertTriangle 
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const GatekeeperModule = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: "Gate Control System",
      description: "ANPR integration with automated barrier control",
      icon: Shield,
      path: "/gate-control",
      status: "New",
      features: ["ANPR Integration", "Barrier Control", "Manual Override", "Real-time Monitoring"]
    },
    {
      title: "Security Management",
      description: "Guard duty roster and incident reporting",
      icon: Camera,
      path: "/security-management",
      status: "New",
      features: ["Guard Roster", "Incident Reporting", "Visitor Logging", "Patrol Management"]
    },
    {
      title: "Access Control",
      description: "Key cards, biometrics, and temporary access",
      icon: CreditCard,
      path: "/access-control",
      status: "New",
      features: ["Key Card Management", "Biometric Integration", "Temporary Access", "Access Logs"]
    },
    {
      title: "Vehicle Management",
      description: "Enhanced vehicle registration and tracking",
      icon: Car,
      path: "/vehicles",
      status: "Enhanced",
      features: ["Resident Vehicles", "Visitor Tracking", "Blacklist/Whitelist", "Violation Records"]
    },
    {
      title: "Emergency Protocols",
      description: "Evacuation procedures and emergency contacts",
      icon: AlertTriangle,
      path: "/emergency-protocols",
      status: "New",
      features: ["Evacuation Procedures", "Emergency Contacts", "Alert Systems", "Response Management"]
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
        <h1 className="text-3xl font-bold mb-2">Gatekeeper Module</h1>
        <p className="text-muted-foreground">
          Comprehensive gate and security management system for safe community living
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
                  variant={module.status === "Available" || module.status === "Enhanced" ? "default" : "outline"}
                >
                  {module.status === "Available" || module.status === "Enhanced" ? "Open Module" : "View Details"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default GatekeeperModule