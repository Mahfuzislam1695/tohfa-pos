import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import { SalesReportData, ReportFilters, ReportPeriod } from "@/types/dashboard"
import { formatCurrency, formatDate } from "@/lib/units"

interface SalesReportDetailedProps {
    data: SalesReportData
    filters: ReportFilters
    getPeriodLabel: (period: ReportPeriod) => string
    onExport: () => void
}

export function SalesReportDetailed({ data, filters, getPeriodLabel, onExport }: SalesReportDetailedProps) {
    return (
        <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-bold">Detailed Sales Analysis</h2>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalSales}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Transactions
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(data.summary.totalRevenue)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Before costs
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.summary.itemsSold.toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Units sold
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data.summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(data.summary.totalProfit)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            After all costs
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.summary.profitMargin.toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Net profit percentage
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {formatCurrency(data.summary.averageOrderValue)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Per transaction
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-orange-600">
                            {formatCurrency(data.summary.totalDiscount)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Discounts given
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {formatCurrency(data.summary.totalTax)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Tax collected
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cost Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-red-600">
                            {formatCurrency(data.summary.totalCost)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Product purchase cost
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-emerald-600">
                            {formatCurrency(data.summary.totalRevenue - data.summary.totalCost)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Before discounts & tax
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Method Breakdown */}
            {data.paymentMethodBreakdown && data.paymentMethodBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Breakdown by payment type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Transactions</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Percentage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.paymentMethodBreakdown.map((payment) => (
                                    <TableRow key={payment.method}>
                                        <TableCell className="font-medium">{payment.method}</TableCell>
                                        <TableCell>{payment.count}</TableCell>
                                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell>{payment.percentage.toFixed(2)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Category Breakdown */}
            {data.categoryBreakdown && data.categoryBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Category Performance</CardTitle>
                        <CardDescription>Sales breakdown by product category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>% of Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.categoryBreakdown.map((category) => (
                                    <TableRow key={category.categoryID}>
                                        <TableCell className="font-medium">{category.categoryName}</TableCell>
                                        <TableCell>{formatCurrency(category.revenue)}</TableCell>
                                        <TableCell>{category.percentage.toFixed(2)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Top Products */}
            {data.topProducts && data.topProducts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Best performing products by revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity Sold</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Avg. Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.topProducts.map((product) => (
                                    <TableRow key={product.productID}>
                                        <TableCell className="font-medium">{product.productName}</TableCell>
                                        <TableCell>{product.quantity}</TableCell>
                                        <TableCell>{formatCurrency(product.revenue)}</TableCell>
                                        <TableCell>{product.quantity > 0 ? formatCurrency(product.revenue / product.quantity) : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Sales Details Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Sales Details</CardTitle>
                            <CardDescription>
                                All sales for {getPeriodLabel(filters.period)} {filters.period === ReportPeriod.CUSTOM && filters.startDate ? `(${filters.startDate} to ${filters.endDate})` : ''}
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={onExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Tax</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.sales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                                            No sales found for this period
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.sales.map((sale) => (
                                        <TableRow key={sale.sellID}>
                                            <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                                            <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                                            <TableCell>{sale.customerPhone || "-"}</TableCell>
                                            <TableCell>{sale.itemsCount} items</TableCell>
                                            <TableCell>{formatCurrency(sale.subtotal)}</TableCell>
                                            <TableCell className="text-orange-600">{formatCurrency(sale.discount)}</TableCell>
                                            <TableCell>{formatCurrency(sale.tax)}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(sale.total)}</TableCell>
                                            <TableCell>{sale.paymentMethod}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${sale.paymentStatus === 'COMPLETED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {sale.paymentStatus}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatDate(sale.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}