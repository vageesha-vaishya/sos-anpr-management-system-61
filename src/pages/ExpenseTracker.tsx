import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/tables/DataTable"
import { 
  TrendingDown, 
  Plus, 
  CreditCard, 
  Calendar, 
  AlertTriangle,
  PieChart
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const ExpenseTracker = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("expenses")

  const statsCards = [
    {
      title: "Total Expenses This Month",
      value: "₹65,200",
      change: "+8.2%",
      icon: CreditCard,
      color: "text-red-600"
    },
    {
      title: "Utility Expenses",
      value: "₹28,500",
      change: "+5.1%",
      icon: TrendingDown,
      color: "text-orange-600"
    },
    {
      title: "Pending Payments",
      value: "₹15,000",
      change: "-2.3%",
      icon: Calendar,
      color: "text-yellow-600"
    },
    {
      title: "Budget Variance",
      value: "₹8,200",
      change: "+12.5%",
      icon: AlertTriangle,
      color: "text-purple-600"
    }
  ]

  const expenseCategories = [
    { name: "Utilities", amount: "₹28,500", percentage: "44%" },
    { name: "Security", amount: "₹18,000", percentage: "28%" },
    { name: "Maintenance", amount: "₹12,000", percentage: "18%" },
    { name: "Cleaning", amount: "₹6,700", percentage: "10%" }
  ]

  const expenseColumns = [
    { key: "date", header: "Date" },
    { key: "amount", header: "Amount" },
    { key: "category", header: "Category" },
    { key: "description", header: "Description" },
    { key: "status", header: "Status" }
  ]

  const categoryColumns = [
    { key: "name", header: "Category Name" },
    { key: "budget", header: "Monthly Budget" },
    { key: "spent", header: "Amount Spent" },
    { key: "remaining", header: "Remaining" },
    { key: "status", header: "Status" }
  ]

  // Mock form component for now
  const MockForm = ({ onSuccess }: { onSuccess: () => void }) => (
    <div className="p-4">
      <p>Form component will be implemented here.</p>
      <Button onClick={onSuccess} className="mt-4">Mock Save</Button>
    </div>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Expense Tracker</h1>
            <p className="text-muted-foreground">
              Comprehensive expense management and categorization with vendor tracking
            </p>
          </div>
          <Button onClick={() => navigate("/financial-hub?tab=books")}>
            Back to Books Management
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-6">
          <DataTable
            title="Expense Records"
            tableName="organizations"
            columns={expenseColumns}
            FormComponent={MockForm}
            searchFields={["name"]}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataTable
              title="Expense Categories"
              tableName="organizations"
              columns={categoryColumns}
              FormComponent={MockForm}
              searchFields={["name"]}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
                <CardDescription>Current month expense distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{category.amount}</div>
                        <div className="text-sm text-muted-foreground">{category.percentage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vendor Management</CardTitle>
                  <CardDescription>Track vendor payments and relationships</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Vendor Management</h3>
                <p className="text-muted-foreground mb-4">
                  Manage vendor information, payment terms, and transaction history
                </p>
                <Button>Setup Vendor Management</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expense Report</CardTitle>
                <CardDescription>Detailed breakdown of monthly expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button>Generate Monthly Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>Compare budgeted vs actual expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button variant="outline">View Budget Analysis</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Payment Summary</CardTitle>
                <CardDescription>Payment status and vendor balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button variant="outline">View Vendor Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Trends</CardTitle>
                <CardDescription>Historical expense analysis and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button variant="outline">View Trend Analysis</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ExpenseTracker