import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Plus, 
  Calculator, 
  FileText, 
  BarChart3,
  TrendingUp
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DataTable } from "@/components/tables/DataTable"
import { supabase } from "@/integrations/supabase/client"

const GeneralLedger = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("chart-of-accounts")

  const chartOfAccountsColumns = [
    { key: "account_code", accessorKey: "account_code", header: "Account Code" },
    { key: "account_name", accessorKey: "account_name", header: "Account Name" },
    { key: "account_type", accessorKey: "account_type", header: "Type" },
    { key: "account_category", accessorKey: "account_category", header: "Category" },
    { key: "description", accessorKey: "description", header: "Description" }
  ]

  const journalEntriesColumns = [
    { key: "entry_number", accessorKey: "entry_number", header: "Entry #" },
    { key: "entry_date", accessorKey: "entry_date", header: "Date" },
    { key: "description", accessorKey: "description", header: "Description" },
    { key: "total_amount", accessorKey: "total_amount", header: "Amount" },
    { key: "status", accessorKey: "status", header: "Status" }
  ]

  const modules = [
    {
      title: "Chart of Accounts",
      description: "Manage your accounting structure",
      icon: BookOpen,
      count: "20 accounts",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Journal Entries",
      description: "Double-entry bookkeeping transactions",
      icon: Calculator,
      count: "15 entries",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Trial Balance",
      description: "Verify accounting accuracy",
      icon: BarChart3,
      count: "Updated today",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Financial Statements",
      description: "P&L and Balance Sheet",
      icon: FileText,
      count: "Ready",
      color: "bg-orange-100 text-orange-800"
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">General Ledger</h1>
            <p className="text-muted-foreground">
              Complete accounting system with chart of accounts and journal entries
            </p>
          </div>
          <Button onClick={() => navigate("/society-books-management")}>
            Back to Books Management
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {modules.map((module, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <module.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge className={module.color} variant="secondary">
                  {module.count}
                </Badge>
              </div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chart-of-accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journal-entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="statements">Financial Statements</TabsTrigger>
        </TabsList>

        <TabsContent value="chart-of-accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chart of Accounts</CardTitle>
                  <CardDescription>Manage your accounting structure and categories</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={[]}
                columns={chartOfAccountsColumns}
                searchKey="account_name"
                onRefresh={() => {}}
                fetchData={async () => {
                  try {
                    const { data } = await supabase
                      .from('chart_of_accounts')
                      .select('*')
                      .order('account_code')
                    return data || []
                  } catch (error) {
                    return []
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal-entries" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Journal Entries</CardTitle>
                  <CardDescription>Double-entry bookkeeping transactions</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={[]}
                columns={journalEntriesColumns}
                searchKey="description"
                onRefresh={() => {}}
                fetchData={async () => {
                  const { data } = await supabase
                    .from('journal_entries')
                    .select('*')
                    .order('entry_date', { ascending: false })
                  return data || []
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trial Balance</CardTitle>
              <CardDescription>Verify that debits equal credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Trial Balance Report</h3>
                <p className="text-muted-foreground mb-4">
                  Generate trial balance to verify accounting accuracy
                </p>
                <Button>Generate Trial Balance</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Profit & Loss Statement
                </CardTitle>
                <CardDescription>Revenue and expenses summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button>Generate P&L Statement</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Balance Sheet
                </CardTitle>
                <CardDescription>Assets, liabilities, and equity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button>Generate Balance Sheet</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GeneralLedger