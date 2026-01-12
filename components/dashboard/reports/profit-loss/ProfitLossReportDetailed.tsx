import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "lucide-react"
import { ProfitLossData } from "@/types/dashboard"
import { formatCurrency } from "@/lib/units"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ProfitLossReportDetailedProps {
    data: ProfitLossData
}

export function ProfitLossReportDetailed({ data }: ProfitLossReportDetailedProps) {
    const expenseData = data.expenseBreakdown.map(item => ({
        name: item.category,
        value: item.amount
    }))

    const categoryData = data.categoryBreakdown.map(item => ({
        name: item.categoryName,
        revenue: item.revenue,
        profit: item.profit
    }))

    const returnsData = data.returnsBreakdown?.breakdown || []

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']
    return (
        <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-bold">Detailed Financial Analysis</h2>

            {/* Financial Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(data.summary.totalRevenue)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(data.summary.grossProfit)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                            {formatCurrency(data.summary.netProfit)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data.summary.netProfitMargin >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                            {data.summary.netProfitMargin.toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cost & Expenses */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-red-600">
                            {formatCurrency(data.summary.totalCostOfGoodsSold)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-orange-600">
                            {formatCurrency(data.summary.totalExpenses)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-emerald-600">
                            {data.summary.grossProfitMargin.toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Operating Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl font-bold ${data.summary.operatingProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(data.summary.operatingProfit)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Losses */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Removals Loss</CardTitle>
                        <CardDescription className="text-xs">Loss from damaged/expired products</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-red-600">
                            {formatCurrency(data.summary.totalRemovalsLoss)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Returns Loss</CardTitle>
                        <CardDescription className="text-xs">Loss from customer returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-red-600">
                            {formatCurrency(data.summary.totalReturnsLoss)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend Table */}
            {data.monthlyTrend && data.monthlyTrend.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Financial Trend</CardTitle>
                        <CardDescription>Detailed monthly breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Profit</TableHead>
                                    <TableHead>Margin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.monthlyTrend.map((month) => (
                                    <TableRow key={month.month}>
                                        <TableCell className="font-medium">{month.month}</TableCell>
                                        <TableCell>{formatCurrency(month.revenue)}</TableCell>
                                        <TableCell className="text-red-600">{formatCurrency(month.cost)}</TableCell>
                                        <TableCell className={`font-medium ${month.profit >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {formatCurrency(month.profit)}
                                        </TableCell>
                                        <TableCell className={`${month.margin >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {month.margin.toFixed(2)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}



            {/* Expense Breakdown */}
            {data.expenseBreakdown && data.expenseBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Breakdown</CardTitle>
                        <CardDescription>Detailed view of expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Percentage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.expenseBreakdown.map((expense) => (
                                    <TableRow key={expense.category}>
                                        <TableCell className="font-medium">{expense.category}</TableCell>
                                        <TableCell className="text-red-600">
                                            {formatCurrency(expense.amount)}
                                        </TableCell>
                                        <TableCell>{expense.percentage?.toFixed(2) || '0.00'}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Monthly Trend (Simplified View) */}
            {/* {data.monthlyTrend && data.monthlyTrend.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Monthly Performance Summary
                        </CardTitle>
                        <CardDescription>Profit trend over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.monthlyTrend.slice(-3).reverse().map((month) => (
                                <div key={month.month} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium">{month.month}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Revenue: {formatCurrency(month.revenue)}
                                        </div>
                                    </div>
                                    <div className={`text-lg font-bold ${month.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {month.profit >= 0 ? "+" : ""}{formatCurrency(month.profit)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            Last 3 months shown • {data.monthlyTrend.length} months total
                        </div>
                    </CardContent>
                </Card>
            )} */}


            {/* Returns Analysis */}
            {data.returnsBreakdown && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-amber-600">🔄</span>
                            Returns Analysis
                        </CardTitle>
                        <CardDescription>
                            {data.summary.totalReturnsCount} returns totaling {formatCurrency(data.summary.totalReturnsAmount)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Returns Summary */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 bg-amber-50 rounded-lg">
                                    <div className="text-2xl font-bold text-amber-700">
                                        {data.returnsBreakdown.summary.totalCount}
                                    </div>
                                    <p className="text-sm mt-1">Total Returns</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Number of return transactions
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg">
                                    <div className="text-2xl font-bold text-amber-700">
                                        {formatCurrency(data.returnsBreakdown.summary.totalAmount)}
                                    </div>
                                    <p className="text-sm mt-1">Total Refunded</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Money returned to customers
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg">
                                    <div className="text-2xl font-bold text-amber-700">
                                        {formatCurrency(data.returnsBreakdown.summary.averageReturnAmount)}
                                    </div>
                                    <p className="text-sm mt-1">Average Return</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Per return transaction
                                    </p>
                                </div>
                            </div>

                            {/* Returns by Reason */}
                            <div>
                                <h4 className="font-medium mb-4">Returns by Reason</h4>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={returnsData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="amount"
                                                nameKey="reason"
                                            >
                                                {returnsData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Returns Details Table */}
                            {returnsData.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-4">Return Details</h4>
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Reason</TableHead>
                                                    <TableHead className="text-right">Count</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                    <TableHead className="text-right">Percentage</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {returnsData.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{item.reason}</TableCell>
                                                        <TableCell className="text-right">{item.count}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                                        <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Category Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Category Performance</CardTitle>
                    <CardDescription>Revenue and profit by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                                <Bar dataKey="profit" name="Profit" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Top Profitable Products</CardTitle>
                    <CardDescription>Products with highest profit margins</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                    <TableHead className="text-right">Profit</TableHead>
                                    <TableHead className="text-right">Margin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.topProfitableProducts.map((product) => (
                                    <TableRow key={product.productID}>
                                        <TableCell className="font-medium">{product.productName}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(product.profit)}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.margin >= 30 ? 'bg-green-100 text-green-800' : product.margin >= 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.margin.toFixed(1)}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}