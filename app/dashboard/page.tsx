import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">{"Welcome back! Here's what's happening today."}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">{"This Month"}</Button>
                <Button>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  {"View Reports"}
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Sales"
                value="$45,231"
                change="+20.1% from last month"
                changeType="positive"
                icon={DollarSign}
                iconColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                title="Total Orders"
                value="1,234"
                change="+15.3% from last month"
                changeType="positive"
                icon={ShoppingCart}
                iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              />
              <StatCard
                title="Total Products"
                value="567"
                change="12 low stock items"
                changeType="neutral"
                icon={Package}
                iconColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
              />
              <StatCard
                title="Total Customers"
                value="892"
                change="+8.2% from last month"
                changeType="positive"
                icon={Users}
                iconColor="bg-orange-500/10 text-orange-600 dark:text-orange-400"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
              {/* Sales Chart */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>{"Your sales performance this month"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center space-y-2">
                      <TrendingUp className="h-12 w-12 mx-auto text-primary" />
                      <p>{"Sales chart will be displayed here"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>{"Best performers this week"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Wireless Mouse", sold: 145, revenue: "$2,900" },
                      { name: "USB Cable", sold: 132, revenue: "$1,584" },
                      { name: "Keyboard", sold: 98, revenue: "$4,900" },
                      { name: "Monitor Stand", sold: 87, revenue: "$3,480" },
                      { name: "Desk Lamp", sold: 76, revenue: "$2,280" },
                    ].map((product, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sold} sold</p>
                        </div>
                        <div className="text-sm font-medium">{product.revenue}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Sales */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>{"Latest transactions from your store"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { invoice: "INV-001", customer: "John Doe", amount: "$250", status: "paid" },
                        { invoice: "INV-002", customer: "Jane Smith", amount: "$150", status: "paid" },
                        { invoice: "INV-003", customer: "Bob Johnson", amount: "$350", status: "pending" },
                        { invoice: "INV-004", customer: "Alice Brown", amount: "$200", status: "paid" },
                        { invoice: "INV-005", customer: "Charlie Wilson", amount: "$180", status: "paid" },
                      ].map((sale) => (
                        <TableRow key={sale.invoice}>
                          <TableCell className="font-medium">{sale.invoice}</TableCell>
                          <TableCell>{sale.customer}</TableCell>
                          <TableCell>{sale.amount}</TableCell>
                          <TableCell>
                            <Badge variant={sale.status === "paid" ? "default" : "secondary"}>{sale.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>{"Products running low on inventory"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Office Chair", stock: 3, sku: "PRD-001" },
                      { name: "Notebook Set", stock: 5, sku: "PRD-002" },
                      { name: "Pen Pack", stock: 8, sku: "PRD-003" },
                      { name: "Stapler", stock: 4, sku: "PRD-004" },
                      { name: "File Folder", stock: 6, sku: "PRD-005" },
                    ].map((product) => (
                      <div key={product.sku} className="flex items-center gap-4">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{product.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-600/50">
                          {product.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
