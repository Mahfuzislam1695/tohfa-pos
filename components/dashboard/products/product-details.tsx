"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, Package, Percent, Hash, MapPin, FileText, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Layers, ShoppingCart, Activity, BarChart, Users, Clock, Box } from "lucide-react"
import { useGet } from "@/hooks/useGet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ProductDetailsProps {
    productID: any
}

export function ProductDetails({ productID }: ProductDetailsProps) {

    console.log("productID", productID);

    const { data: product, refetch, isLoading, error } = useGet<any>(
        `/products/${productID}/details`,
        ["productDetails"]
    )

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading product details</div>
    if (!product) return <div>Product not found</div>

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Format date for display (short)
    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return `৳${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    }

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'default'
            case 'inactive': return 'secondary'
            case 'lowStock': return 'destructive'
            default: return 'outline'
        }
    }

    // Get action badge variant
    const getActionVariant = (action: string) => {
        switch (action) {
            case 'CREATED': return 'default'
            case 'RESTOCKED': return 'success'
            case 'ADJUSTED': return 'warning'
            case 'PRICE_CHANGED': return 'secondary'
            case 'STATUS_CHANGED': return 'outline'
            default: return 'secondary'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{product.name}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={product.isLowStock ? "destructive" : "default"}>
                            {product.isLowStock ? "Low Stock" : "In Stock"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                        </span>
                        {product.barcode && (
                            <span className="text-sm text-muted-foreground">
                                Barcode: {product.barcode}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(product.sellingPrice)}</div>
                    <div className="text-sm text-muted-foreground">Selling Price</div>
                </div>
            </div>

            <Separator />

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Current Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{product.stockQuantity}</div>
                                <div className="text-xs text-muted-foreground">
                                    Low threshold: {product.lowStockThreshold}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(product.totalInventoryValue)}</div>
                                <div className="text-xs text-muted-foreground">
                                    {product.inventoryBatchesSummary.totalBatches} batches
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sold</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{product.salesSummary.totalSoldQuantity}</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(product.salesSummary.totalRevenue)} revenue
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-1">
                                    {product.profitMargin >= 0 ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className={product.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                        {product.profitMargin.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Gross margin: {product.statistics.grossMargin.toFixed(2)}%
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">SKU</p>
                                        <p className="font-medium">{product.sku}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit</p>
                                        <p className="font-medium">{product.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Category</p>
                                        <p className="font-medium">{product.categoryName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Brand</p>
                                        <p className="font-medium">{product.brandName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tax Rate</p>
                                        <p className="font-medium">{product.taxRate ? `${product.taxRate}%` : "0%"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">{product.location || "Not specified"}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="font-medium">{product.description || "No description"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Pricing Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Purchase Price</span>
                                        <span className="font-medium">{formatCurrency(product.purchasePrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Selling Price</span>
                                        <span className="font-bold text-emerald-600">{formatCurrency(product.sellingPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Weighted Avg Cost</span>
                                        <span className="font-medium">{formatCurrency(product.weightedAverageCost)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Inventory Value</span>
                                        <span className="font-bold">{formatCurrency(product.totalInventoryValue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Potential Revenue</span>
                                        <span className="font-bold text-emerald-600">{formatCurrency(product.potentialRevenue)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart className="h-5 w-5" />
                                Performance Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Inventory Turnover</p>
                                    <p className="text-2xl font-bold">{product.statistics.inventoryTurnover}</p>
                                    <p className="text-xs text-muted-foreground">Days: {product.statistics.daysOfInventory}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Avg Selling Price</p>
                                    <p className="text-2xl font-bold">{formatCurrency(product.statistics.averageSellingPrice)}</p>
                                    <p className="text-xs text-muted-foreground">Total sales: {product.statistics.sellItemCount}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Gross Margin</p>
                                    <p className="text-2xl font-bold">{product.statistics.grossMargin.toFixed(2)}%</p>
                                    <p className="text-xs text-muted-foreground">Net sold: {product.statistics.netQuantitySold}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Activity Logs</p>
                                    <p className="text-2xl font-bold">{product.statistics.logCount}</p>
                                    <p className="text-xs text-muted-foreground">Since: {formatDateShort(product.createdAt)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                Inventory Summary
                            </CardTitle>
                            <CardDescription>
                                {product.inventoryBatchesSummary.totalBatches} batches totaling {product.inventoryBatchesSummary.totalQuantity} units
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Total Batches</p>
                                    <p className="text-2xl font-bold">{product.inventoryBatchesSummary.totalBatches}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Total Quantity</p>
                                    <p className="text-2xl font-bold">{product.inventoryBatchesSummary.totalQuantity}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Avg Unit Cost</p>
                                    <p className="text-2xl font-bold">{formatCurrency(product.inventoryBatchesSummary.averageUnitCost)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Total Value</p>
                                    <p className="text-2xl font-bold">{formatCurrency(product.inventoryBatchesSummary.totalInventoryValue)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Recent Batches</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Batch ID</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Cost</TableHead>
                                            <TableHead>Total Value</TableHead>
                                            <TableHead>Received</TableHead>
                                            <TableHead>Expiry</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {product.inventoryBatchesSummary.recentBatches.map((batch: any) => (
                                            <TableRow key={batch.batchID}>
                                                <TableCell className="font-medium">#{batch.batchID}</TableCell>
                                                <TableCell>{batch.quantity}</TableCell>
                                                <TableCell>{formatCurrency(batch.unitCost)}</TableCell>
                                                <TableCell>{formatCurrency(batch.totalValue)}</TableCell>
                                                <TableCell>{formatDateShort(batch.receivedAt)}</TableCell>
                                                <TableCell>
                                                    {batch.expiryDate ? (
                                                        <Badge variant={batch.isExpired ? "destructive" : "outline"}>
                                                            {formatDateShort(batch.expiryDate)}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">No expiry</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Inventory Health</p>
                                        <p className="text-sm text-muted-foreground">
                                            {product.inventoryBatchesSummary.hasExpiredBatches ? (
                                                <span className="text-red-600">Contains expired batches</span>
                                            ) : (
                                                <span className="text-emerald-600">No expired batches</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">First batch</p>
                                        <p className="text-sm font-medium">{formatDateShort(product.inventoryBatchesSummary.earliestBatchDate)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Last batch</p>
                                        <p className="text-sm font-medium">{formatDateShort(product.inventoryBatchesSummary.latestBatchDate)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Sales Summary
                            </CardTitle>
                            <CardDescription>
                                {product.salesSummary.numberOfSales} sales totaling {product.salesSummary.totalSoldQuantity} units
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Total Sales</p>
                                    <p className="text-2xl font-bold">{product.salesSummary.numberOfSales}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Units Sold</p>
                                    <p className="text-2xl font-bold">{product.salesSummary.totalSoldQuantity}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(product.salesSummary.totalRevenue)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Avg Price</p>
                                    <p className="text-2xl font-bold">{formatCurrency(product.salesSummary.averageSellingPrice)}</p>
                                </div>
                            </div>

                            {/* Monthly Sales */}
                            <div className="space-y-4 mb-6">
                                <h3 className="text-lg font-semibold">Monthly Sales</h3>
                                <div className="grid gap-4">
                                    {product.salesSummary.monthlySales.map((month: any) => (
                                        <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">Month {month.month.split('-')[1]}, {month.month.split('-')[0]}</p>
                                                <p className="text-sm text-muted-foreground">{month.quantity} units</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(month.revenue)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Avg: {formatCurrency(month.averagePrice)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Sales */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Recent Sales</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {product.salesSummary.recentSales.map((sale: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                                                <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                                                <TableCell>{sale.quantity}</TableCell>
                                                <TableCell>{formatCurrency(sale.unitPrice)}</TableCell>
                                                <TableCell>{formatCurrency(sale.subtotal)}</TableCell>
                                                <TableCell>{formatDateShort(sale.createdAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Sales Period</p>
                                        <p className="text-sm text-muted-foreground">
                                            First sale: {formatDateShort(product.salesSummary.firstSaleDate)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Latest sale</p>
                                        <p className="text-sm font-medium">{formatDateShort(product.salesSummary.lastSaleDate)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Activity Summary
                            </CardTitle>
                            <CardDescription>
                                {product.activitySummary.totalLogs} activities recorded
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Action Breakdown */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4">Action Breakdown</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(product.activitySummary.actionBreakdown).map(([action, count]: [string, any]) => (
                                        count > 0 && (
                                            <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <Badge variant={getActionVariant(action)}>
                                                        {action}
                                                    </Badge>
                                                </div>
                                                <span className="text-lg font-bold">{count}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Recent Activity</h3>
                                <div className="space-y-4">
                                    {product.activitySummary.recentActivity.map((activity: any) => (
                                        <div key={activity.logID} className="flex items-start gap-4 p-4 border rounded-lg">
                                            <div className="flex-shrink-0">
                                                <Badge variant={getActionVariant(activity.action)}>
                                                    {activity.action}
                                                </Badge>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium">{activity.description}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Users className="h-3 w-3" />
                                                    <span>{activity.performedBy}</span>
                                                    <Clock className="h-3 w-3 ml-2" />
                                                    <span>{formatDate(activity.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {activity.timeAgo}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Activity Period</p>
                                        <p className="text-sm text-muted-foreground">
                                            First activity: {formatDateShort(product.activitySummary.firstActivityDate)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Latest activity</p>
                                        <p className="text-sm font-medium">{formatDateShort(product.activitySummary.lastActivityDate)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Footer - Created Info */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {formatDate(product.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Last updated: {formatDate(product.updatedAt)}</span>
                        </div>
                        {product.createdBy && (
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Created by: {product.createdBy.name} ({product.createdBy.email})</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}