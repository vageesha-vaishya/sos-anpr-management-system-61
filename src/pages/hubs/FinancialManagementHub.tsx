import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  FileText,
  Calculator,
  PiggyBank,
  Receipt,
  BarChart3,
  ChevronRight
} from "lucide-react"

const FinancialManagementHub = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: "Maintenance Billing",
      description: "Manage monthly maintenance charges and billing cycles",
      icon: CreditCard,
      href: "/maintenance-billing",
      status: "Available",
      color: "from-blue-500 to-blue-600",
      features: ["Monthly Billing", "Automated Charges", "Payment Tracking", "Late Fee Management"]
    },
    {
      title: "General Ledger",
      description: "Complete accounting system with double-entry bookkeeping",
      icon: FileText,
      href: "/general-ledger",
      status: "Available",
      color: "from-green-500 to-green-600",
      features: ["Chart of Accounts", "Journal Entries", "Trial Balance", "Financial Reports"]
    },
    {
      title: "Income Tracker",
      description: "Track all sources of society income and revenue",
      icon: TrendingUp,
      href: "/income-tracker",
      status: "Available",
      color: "from-purple-500 to-purple-600",
      features: ["Revenue Tracking", "Income Categories", "Monthly Reports", "Growth Analysis"]
    },
    {
      title: "Expense Tracker",
      description: "Monitor and categorize all society expenses",
      icon: Receipt,
      href: "/expense-tracker",
      status: "Available",
      color: "from-orange-500 to-orange-600",
      features: ["Expense Categories", "Budget Monitoring", "Vendor Management", "Cost Analysis"]
    },
    {
      title: "Bank & Cash Management",
      description: "Manage bank accounts, cash flow, and reconciliation",
      icon: PiggyBank,
      href: "/bank-cash",
      status: "Available",
      color: "from-teal-500 to-teal-600",
      features: ["Account Management", "Cash Flow", "Bank Reconciliation", "Fund Allocation"]
    },
    {
      title: "Utility Tracker",
      description: "Track and manage utility expenses and consumption",
      icon: Calculator,
      href: "/utility-tracker",
      status: "Available",
      color: "from-red-500 to-red-600",
      features: ["Utility Bills", "Consumption Tracking", "Cost Allocation", "Efficiency Reports"]
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
          Financial Management Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete financial management solution for your society
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">{modules.length} Financial Modules</Badge>
          <Badge variant="outline">Accounting & Billing</Badge>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">₹2,45,000</div>
            <div className="text-sm text-muted-foreground">Monthly Income</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Receipt className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">₹1,85,000</div>
            <div className="text-sm text-muted-foreground">Monthly Expenses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <PiggyBank className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">₹8,50,000</div>
            <div className="text-sm text-muted-foreground">Total Balance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-muted-foreground">Collection Rate</div>
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

export default FinancialManagementHub