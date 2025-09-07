import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  RefreshCw, 
  FileText,
  Wallet,
  ArrowUpDown
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DataTable } from "@/components/tables/DataTable"
import { supabase } from "@/integrations/supabase/client"

const BankCash = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("bank-accounts")

  const bankAccountsColumns = [
    { accessorKey: "account_name", header: "Account Name" },
    { accessorKey: "bank_name", header: "Bank" },
    { accessorKey: "account_number", header: "Account Number" },
    { accessorKey: "account_type", header: "Type" },
    { accessorKey: "current_balance", header: "Balance" },
    { accessorKey: "is_active", header: "Status" }
  ]

  const bankTransactionsColumns = [
    { accessorKey: "transaction_date", header: "Date" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "reference_number", header: "Reference" },
    { accessorKey: "debit_amount", header: "Debit" },
    { accessorKey: "credit_amount", header: "Credit" },
    { accessorKey: "balance", header: "Balance" },
    { accessorKey: "is_reconciled", header: "Reconciled" }
  ]

  const paymentVouchersColumns = [
    { accessorKey: "voucher_number", header: "Voucher #" },
    { accessorKey: "payment_date", header: "Date" },
    { accessorKey: "payee_name", header: "Payee" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "payment_method", header: "Method" },
    { accessorKey: "approval_status", header: "Status" }
  ]

  const accountSummary = [
    {
      name: "Primary Operating Account",
      bank: "HDFC Bank",
      balance: "₹7,50,000",
      type: "Current",
      status: "Active"
    },
    {
      name: "Reserve Fund Account",
      bank: "ICICI Bank",
      balance: "₹12,00,000",
      type: "Savings",
      status: "Active"
    }
  ]

  const statsCards = [
    {
      title: "Total Bank Balance",
      value: "₹19,50,000",
      change: "+5.2%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Petty Cash",
      value: "₹25,000",
      change: "-2.1%",
      icon: Wallet,
      color: "text-blue-600"
    },
    {
      title: "Pending Reconciliation",
      value: "8 transactions",
      change: "-15.3%",
      icon: RefreshCw,
      color: "text-orange-600"
    },
    {
      title: "Monthly Cash Flow",
      value: "₹2,15,000",
      change: "+8.7%",
      icon: ArrowUpDown,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bank & Cash Management</h1>
            <p className="text-muted-foreground">
              Bank reconciliation, cash management, and payment voucher system
            </p>
          </div>
          <Button onClick={() => navigate("/society-books-management")}>
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
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bank-accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="vouchers">Payment Vouchers</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="bank-accounts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bank Accounts</CardTitle>
                    <CardDescription>Manage organization bank accounts</CardDescription>
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
                  columns={bankAccountsColumns}
                  searchKey="account_name"
                  onRefresh={() => {}}
                  fetchData={async () => {
                    const { data } = await supabase
                      .from('bank_accounts')
                      .select('*')
                      .order('account_name')
                    return data || []
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
                <CardDescription>Quick overview of all bank accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accountSummary.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">{account.bank}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{account.balance}</div>
                        <Badge variant="outline">{account.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bank Transactions</CardTitle>
                  <CardDescription>All bank account transactions and statements</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Import Statement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={[]}
                columns={bankTransactionsColumns}
                searchKey="description"
                onRefresh={() => {}}
                fetchData={async () => {
                  const { data } = await supabase
                    .from('bank_transactions')
                    .select(`
                      *,
                      bank_accounts!inner(account_name, bank_name)
                    `)
                    .order('transaction_date', { ascending: false })
                  return data || []
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Bank Reconciliation
              </CardTitle>
              <CardDescription>Match bank statements with accounting records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <RefreshCw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Bank Reconciliation Tool</h3>
                <p className="text-muted-foreground mb-4">
                  Reconcile bank statements with your accounting records to ensure accuracy
                </p>
                <div className="space-y-2">
                  <Button>Start New Reconciliation</Button>
                  <Button variant="outline">View Reconciliation History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Vouchers</CardTitle>
                  <CardDescription>Authorization and tracking of all payments</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Voucher
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={[]}
                columns={paymentVouchersColumns}
                searchKey="payee_name"
                onRefresh={() => {}}
                fetchData={async () => {
                  const { data } = await supabase
                    .from('payment_vouchers')
                    .select('*')
                    .order('payment_date', { ascending: false })
                  return data || []
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Cash Flow Projections
                </CardTitle>
                <CardDescription>Forecast incoming and outgoing cash</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button>Generate Cash Flow Forecast</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cash Flow Statement
                </CardTitle>
                <CardDescription>Historical cash flow analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button variant="outline">View Cash Flow Statement</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Petty Cash Management</CardTitle>
              <CardDescription>Track petty cash transactions and balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Petty Cash Register</h3>
                <p className="text-muted-foreground mb-4">
                  Manage small cash transactions and maintain petty cash balance
                </p>
                <Button>Setup Petty Cash</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BankCash