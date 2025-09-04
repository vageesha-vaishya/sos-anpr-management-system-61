import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Zap, 
  Calendar 
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const SocietyBooksManagement = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: "General Ledger",
      description: "Complete accounting system with chart of accounts",
      icon: BookOpen,
      path: "/general-ledger",
      status: "New",
      features: ["Chart of Accounts", "Journal Entries", "Trial Balance", "Financial Statements"]
    },
    {
      title: "Income Tracker",
      description: "All revenue streams tracking and analysis",
      icon: TrendingUp,
      path: "/income-tracker",
      status: "New",
      features: ["Maintenance Fees", "Late Fees", "Amenity Charges", "Penalty Tracking"]
    },
    {
      title: "Expense Tracker",
      description: "Comprehensive expense management and categorization",
      icon: TrendingDown,
      path: "/expense-tracker",
      status: "New",
      features: ["Vendor Payments", "Utility Bills", "Staff Salaries", "Maintenance Costs"]
    },
    {
      title: "Bank & Cash",
      description: "Bank reconciliation and cash management",
      icon: CreditCard,
      path: "/bank-cash",
      status: "New",
      features: ["Bank Reconciliation", "Petty Cash", "Payment Vouchers", "Cash Flow"]
    },
    {
      title: "Utility Tracker",
      description: "Consumption tracking and billing management",
      icon: Zap,
      path: "/utility-tracker",
      status: "New",
      features: ["Electricity", "Water", "Gas Consumption", "Automated Billing"]
    },
    {
      title: "Advanced Amenity Booking",
      description: "Revenue tracking with pricing models",
      icon: Calendar,
      path: "/advanced-amenity-booking",
      status: "New",
      features: ["Revenue Tracking", "Pricing Models", "Promotional Offers", "Usage Analytics"]
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
        <h1 className="text-3xl font-bold mb-2">Society Books Management</h1>
        <p className="text-muted-foreground">
          Full-fledged integrated financial accounting system with module integration
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

export default SocietyBooksManagement