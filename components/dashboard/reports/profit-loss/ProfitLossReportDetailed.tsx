import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "lucide-react"
import { ProfitLossData } from "@/types/dashboard"
import { formatCurrency } from "@/lib/units"

interface ProfitLossReportDetailedProps {
    data: ProfitLossData
}

export function ProfitLossReportDetailed({ data }: ProfitLossReportDetailedProps) {
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

            {/* Top Profitable Products */}
            {data.topProfitableProducts && data.topProfitableProducts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Profitable Products</CardTitle>
                        <CardDescription>Products with highest profit margin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Profit</TableHead>
                                    <TableHead>Margin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.topProfitableProducts.map((product) => (
                                    <TableRow key={product.productID}>
                                        <TableCell className="font-medium">{product.productName}</TableCell>
                                        <TableCell>{formatCurrency(product.revenue)}</TableCell>
                                        <TableCell className={`font-medium ${product.profit >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {formatCurrency(product.profit)}
                                        </TableCell>
                                        <TableCell className={`${product.margin >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {product.margin?.toFixed(2) || '0.00'}%
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
            {data.monthlyTrend && data.monthlyTrend.length > 0 && (
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
            )}
        </div>
    )
}