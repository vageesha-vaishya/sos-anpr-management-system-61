import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  FileText,
  Calculator,
  PiggyBank,
  Receipt,
  BarChart3,
  ChevronRight,
  BookOpen,
  TrendingDown,
  Zap,
  Calendar,
  ClipboardList,
  ArrowLeft,
  Home
} from "lucide-react"

const FinancialManagementHub = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab })
  }

  // Overview Tab Modules - Core Financial Modules
  const overviewModules = [
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
    },
    {
      title: "Books Management",
      description: "Advanced accounting modules and financial control",
      icon: BookOpen,
      href: "/financial-hub?tab=books",
      status: "Enhanced",
      color: "from-indigo-500 to-indigo-600",
      features: ["General Ledger", "Journal Entries", "Advanced Reports", "Compliance"]
    }
  ]

  // Books Management Tab Modules - Advanced Accounting
  const booksModules = [
    {
      title: "General Ledger",
      description: "Complete accounting system with chart of accounts",
      icon: BookOpen,
      href: "/general-ledger",
      status: "Available",
      color: "from-green-500 to-green-600",
      features: ["Chart of Accounts", "Journal Entries", "Trial Balance", "Financial Statements"]
    },
    {
      title: "Income Tracker",
      description: "All revenue streams tracking and analysis",
      icon: TrendingUp,
      href: "/income-tracker",
      status: "Available",
      color: "from-purple-500 to-purple-600",
      features: ["Maintenance Fees", "Late Fees", "Amenity Charges", "Penalty Tracking"]
    },
    {
      title: "Expense Tracker",
      description: "Comprehensive expense management and categorization",
      icon: TrendingDown,
      href: "/expense-tracker",
      status: "Available",
      color: "from-orange-500 to-orange-600",
      features: ["Vendor Payments", "Utility Bills", "Staff Salaries", "Maintenance Costs"]
    },
    {
      title: "Bank & Cash Management",
      description: "Bank reconciliation and cash management",
      icon: CreditCard,
      href: "/bank-cash",
      status: "Available",
      color: "from-teal-500 to-teal-600",
      features: ["Bank Reconciliation", "Petty Cash", "Payment Vouchers", "Cash Flow"]
    },
    {
      title: "Utility Tracker",
      description: "Consumption tracking and billing management",
      icon: Zap,
      href: "/utility-tracker",
      status: "Available",
      color: "from-red-500 to-red-600",
      features: ["Electricity", "Water", "Gas Consumption", "Automated Billing"]
    },
    {
      title: "Advanced Amenity Booking",
      description: "Revenue tracking with pricing models",
      icon: Calendar,
      href: "/advanced-amenity-booking",
      status: "Available",
      color: "from-blue-500 to-blue-600",
      features: ["Revenue Tracking", "Pricing Models", "Promotional Offers", "Usage Analytics"]
    }
  ]

  // Reports Tab Modules
  const reportsModules = [
    {
      title: "Financial Reports",
      description: "Comprehensive financial reporting and analysis",
      icon: BarChart3,
      href: "/financial-reports",
      status: "Available",
      color: "from-emerald-500 to-emerald-600",
      features: ["P&L Statement", "Balance Sheet", "Cash Flow", "Budget Analysis"]
    },
    {
      title: "Tax & Compliance",
      description: "Tax reporting and regulatory compliance",
      icon: ClipboardList,
      href: "/tax-compliance",
      status: "Available",
      color: "from-violet-500 to-violet-600",
      features: ["GST Reports", "TDS Management", "Audit Trails", "Compliance Check"]
    },
    {
      title: "Analytics Dashboard",
      description: "Advanced analytics and business intelligence",
      icon: BarChart3,
      href: "/analytics",
      status: "Available",
      color: "from-cyan-500 to-cyan-600",
      features: ["Trend Analysis", "Predictive Analytics", "Custom Reports", "KPI Tracking"]
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

  const renderModuleGrid = (modules: typeof overviewModules) => (
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
  )

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Financial Management Hub</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Financial Management Hub
          </h1>
          <p className="text-muted-foreground text-lg">
            Integrated financial management solution with comprehensive accounting and reporting
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="secondary">Complete Financial Suite</Badge>
            <Badge variant="outline">Accounting & Billing</Badge>
            <Badge variant="outline">Reports & Analytics</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => handleTabChange('books')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Open Books Management
          </Button>
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 rounded-lg p-1">
          <TabsTrigger 
            value="overview" 
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            💰 Financial Overview
          </TabsTrigger>
          <TabsTrigger 
            value="books" 
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            📚 Books Management
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            📊 Reports & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Overview KPIs */}
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

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Core Financial Modules</h2>
            <p className="text-muted-foreground mb-6">
              Essential financial management tools for day-to-day operations
            </p>
            {renderModuleGrid(overviewModules)}
          </div>
        </TabsContent>

        <TabsContent value="books" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Advanced Accounting System</h2>
            <p className="text-muted-foreground mb-6">
              Full-fledged integrated financial accounting system with advanced features
            </p>
            {renderModuleGrid(booksModules)}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Reports & Analytics</h2>
            <p className="text-muted-foreground mb-6">
              Comprehensive reporting, analytics, and business intelligence tools
            </p>
            {renderModuleGrid(reportsModules)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialManagementHub