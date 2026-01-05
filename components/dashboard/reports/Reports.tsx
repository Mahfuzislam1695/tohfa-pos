"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, TrendingUp, TrendingDown, Package, DollarSign, Calendar, Users, ShoppingCart, AlertCircle } from "lucide-react"
import { ReportPeriod, ReportFilters } from "@/types/dashboard"
import { useSalesReport } from "@/hooks/use-sales-report"
import { useInventoryReport } from "@/hooks/use-inventory-report"
import { useProfitLossReport } from "@/hooks/use-profit-loss-report"
import { formatCurrency, formatDate } from "@/lib/units"


export default function Reports() {
    const [activeTab, setActiveTab] = useState("sales")
    const [dateFilter, setDateFilter] = useState<ReportPeriod>(ReportPeriod.THIS_MONTH)
    const [filters, setFilters] = useState<ReportFilters>({
        period: ReportPeriod.THIS_MONTH,
    })
    const [customDateRange, setCustomDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: undefined,
        to: undefined,
    })

    // Handle date filter change
    useEffect(() => {
        if (dateFilter === ReportPeriod.CUSTOM) {
            setFilters({
                ...filters,
                period: ReportPeriod.CUSTOM,
                startDate: customDateRange.from?.toISOString().split('T')[0],
                endDate: customDateRange.to?.toISOString().split('T')[0],
            })
        } else {
            setFilters({
                ...filters,
                period: dateFilter,
                startDate: undefined,
                endDate: undefined,
            })
        }
    }, [dateFilter, customDateRange])

    // Sales Report
    const {
        salesReportData,
        isLoading: salesLoading,
        error: salesError,
    } = useSalesReport(filters)

    // Inventory Report
    const {
        inventoryReportData,
        isLoading: inventoryLoading,
        error: inventoryError,
    } = useInventoryReport()

    // Profit & Loss Report
    const {
        profitLossData,
        isLoading: profitLossLoading,
        error: profitLossError,
    } = useProfitLossReport(filters)

    // Export functions
    const handleExportSalesCSV = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.period) params.append('period', filters.period)
            if (filters.startDate) params.append('startDate', filters.startDate)
            if (filters.endDate) params.append('endDate', filters.endDate)

            const response = await fetch(`/api/dashboard/sales-report/export/csv?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to export')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export CSV')
        }
    }

    const handleExportInventoryCSV = async () => {
        try {
            const response = await fetch('/api/dashboard/inventory-report/export/csv')
            if (!response.ok) throw new Error('Failed to export')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export CSV')
        }
    }

    // Format period label
    const getPeriodLabel = (period: ReportPeriod) => {
        const labels = {
            [ReportPeriod.TODAY]: 'Today',
            [ReportPeriod.YESTERDAY]: 'Yesterday',
            [ReportPeriod.LAST_7_DAYS]: 'Last 7 Days',
            [ReportPeriod.LAST_30_DAYS]: 'Last 30 Days',
            [ReportPeriod.THIS_MONTH]: 'This Month',
            [ReportPeriod.LAST_MONTH]: 'Last Month',
            [ReportPeriod.THIS_QUARTER]: 'This Quarter',
            [ReportPeriod.THIS_YEAR]: 'This Year',
            [ReportPeriod.CUSTOM]: 'Custom Range',
        }
        return labels[period]
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive business insights and statistics
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label>Period:</Label>
                        <Select value={dateFilter} onValueChange={(value: ReportPeriod) => setDateFilter(value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(ReportPeriod).map((period) => (
                                    <SelectItem key={period} value={period}>
                                        {getPeriodLabel(period)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* {dateFilter === ReportPeriod.CUSTOM && (
            <DateRangePicker
              value={customDateRange}
              onChange={setCustomDateRange}
            />
          )} */}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales Report</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
                    <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Add overview content here if needed */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dashboard Overview</CardTitle>
                            <CardDescription>
                                Select a specific report tab to view detailed analytics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Sales Report
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Detailed</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            View sales analytics
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Inventory Report
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Detailed</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            View inventory status
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Profit & Loss
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Detailed</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            View financial performance
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sales Report Tab */}
                <TabsContent value="sales" className="space-y-4">
                    {salesLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : salesError ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-destructive">
                                    <TrendingDown className="h-12 w-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">Error loading sales report</h3>
                                    <p className="text-sm mt-2">{salesError.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : salesReportData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid gap-4 md:grid-cols-5">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{salesReportData.summary.totalSales}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(salesReportData.summary.totalRevenue)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {salesReportData.summary.itemsSold.toFixed(2)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${salesReportData.summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {formatCurrency(salesReportData.summary.totalProfit)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {salesReportData.summary.profitMargin.toFixed(2)}%
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
                                            {formatCurrency(salesReportData.summary.averageOrderValue)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-orange-600">
                                            {formatCurrency(salesReportData.summary.totalDiscount)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold">
                                            {formatCurrency(salesReportData.summary.totalTax)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

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
                                        <Button variant="outline" onClick={handleExportSalesCSV}>
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
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Payment</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {salesReportData.sales.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                            No sales found for this period
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    salesReportData.sales.map((sale) => (
                                                        <TableRow key={sale.sellID}>
                                                            <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                                                            <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                                                            <TableCell>{sale.customerPhone || "-"}</TableCell>
                                                            <TableCell>{sale.itemsCount} items</TableCell>
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

                            {/* Top Products */}
                            {salesReportData.topProducts && salesReportData.topProducts.length > 0 && (
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
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {salesReportData.topProducts.map((product) => (
                                                    <TableRow key={product.productID}>
                                                        <TableCell className="font-medium">{product.productName}</TableCell>
                                                        <TableCell>{product.quantity}</TableCell>
                                                        <TableCell>{formatCurrency(product.revenue)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Category Breakdown */}
                            {salesReportData.categoryBreakdown && salesReportData.categoryBreakdown.length > 0 && (
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
                                                    <TableHead>Percentage</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {salesReportData.categoryBreakdown.map((category) => (
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
                        </>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">No sales data available</h3>
                                    <p className="text-sm mt-2">Select a different period or check your data</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Inventory Report Tab */}
                <TabsContent value="inventory" className="space-y-4">
                    {inventoryLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : inventoryError ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-destructive">
                                    <Package className="h-12 w-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">Error loading inventory report</h3>
                                    <p className="text-sm mt-2">{inventoryError.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : inventoryReportData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{inventoryReportData.summary.totalProducts}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(inventoryReportData.summary.inventoryValue)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {inventoryReportData.summary.lowStockProducts}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">
                                            {inventoryReportData.summary.outOfStockProducts}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Inventory Details Table */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Inventory Details</CardTitle>
                                            <CardDescription>All products with current stock levels</CardDescription>
                                        </div>
                                        <Button variant="outline" onClick={handleExportInventoryCSV}>
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
                                                    <TableHead>SKU</TableHead>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Stock</TableHead>
                                                    <TableHead>Threshold</TableHead>
                                                    <TableHead>Purchase Price</TableHead>
                                                    <TableHead>Selling Price</TableHead>
                                                    <TableHead>Inventory Value</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {inventoryReportData.products.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                            No products found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    inventoryReportData.products.map((product) => (
                                                        <TableRow key={product.productID}>
                                                            <TableCell className="font-medium">{product.sku}</TableCell>
                                                            <TableCell>{product.name}</TableCell>
                                                            <TableCell>{product.categoryName}</TableCell>
                                                            <TableCell className={
                                                                product.isOutOfStock ? "text-red-600" :
                                                                    product.isLowStock ? "text-orange-600" : ""
                                                            }>
                                                                {product.stockQuantity}
                                                            </TableCell>
                                                            <TableCell>{product.lowStockThreshold}</TableCell>
                                                            <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
                                                            <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                                                            <TableCell>{formatCurrency(product.inventoryValue)}</TableCell>
                                                            <TableCell>
                                                                <span className={`px-2 py-1 rounded-full text-xs ${product.isOutOfStock
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : product.isLowStock
                                                                        ? 'bg-orange-100 text-orange-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                    }`}>
                                                                    {product.isOutOfStock ? 'Out of Stock' :
                                                                        product.isLowStock ? 'Low Stock' : 'In Stock'}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Low Stock Products */}
                            {inventoryReportData.lowStockProducts && inventoryReportData.lowStockProducts.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Low Stock Alert</CardTitle>
                                        <CardDescription>Products that need immediate restocking</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>SKU</TableHead>
                                                    <TableHead>Current Stock</TableHead>
                                                    <TableHead>Threshold</TableHead>
                                                    <TableHead>Difference</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {inventoryReportData.lowStockProducts.map((product) => (
                                                    <TableRow key={product.productID}>
                                                        <TableCell className="font-medium">{product.name}</TableCell>
                                                        <TableCell>{product.sku}</TableCell>
                                                        <TableCell className="text-orange-600">{product.stockQuantity}</TableCell>
                                                        <TableCell>{product.lowStockThreshold}</TableCell>
                                                        <TableCell className="text-red-600">
                                                            {product.lowStockThreshold - product.stockQuantity}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">No inventory data available</h3>
                                    <p className="text-sm mt-2">Check your product data</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Profit & Loss Tab */}
                <TabsContent value="profit-loss" className="space-y-4">
                    {profitLossLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : profitLossError ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-destructive">
                                    <TrendingDown className="h-12 w-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">Error loading profit & loss report</h3>
                                    <p className="text-sm mt-2">{profitLossError.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : profitLossData ? (
                        <>
                            {/* Financial Summary */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(profitLossData.summary.totalRevenue)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {formatCurrency(profitLossData.summary.grossProfit)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${profitLossData.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {formatCurrency(profitLossData.summary.netProfit)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${profitLossData.summary.netProfitMargin >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {profitLossData.summary.netProfitMargin.toFixed(2)}%
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Cost & Expenses */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-red-600">
                                            {formatCurrency(profitLossData.summary.totalCostOfGoodsSold)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-orange-600">
                                            {formatCurrency(profitLossData.summary.totalExpenses)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-emerald-600">
                                            {profitLossData.summary.grossProfitMargin.toFixed(2)}%
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Monthly Trend */}
                            {profitLossData.monthlyTrend && profitLossData.monthlyTrend.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Monthly Trend</CardTitle>
                                        <CardDescription>Profit and loss over time</CardDescription>
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
                                                {profitLossData.monthlyTrend.map((month) => (
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
                        </>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold">No profit & loss data available</h3>
                                    <p className="text-sm mt-2">Select a different period to view financial data</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}