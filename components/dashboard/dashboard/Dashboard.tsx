"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle, ArrowUpRight, TrendingDown, Users, RefreshCw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useDashboard } from "@/hooks/use-dashboard"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "./stat-card"
import { formatCurrency } from "@/lib/units"
import { log } from "console"

export default function Dashboard() {
    const { dashboardData, isLoading, error, refetch } = useDashboard()
    const [refreshing, setRefreshing] = useState(false)


    const handleRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setTimeout(() => setRefreshing(false), 500)
    }

    if (isLoading && !dashboardData) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-destructive">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Error loading dashboard</h3>
                            <p className="text-sm mt-2">{error.message}</p>
                            <Button onClick={handleRefresh} className="mt-4">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const stats = dashboardData?.statistics || {
        totalSalesToday: 0,
        totalRevenueToday: 0,
        totalOrdersToday: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        inventoryValue: 0,
        totalCustomers: 0,
        newCustomersToday: 0,
        pendingOrders: 0,
        completedOrdersToday: 0,
        totalRemovalsToday: 0,
        removalLossToday: 0,
        profitMarginToday: 0,
    }


    const topProducts = dashboardData?.topProducts || []
    const recentSales = dashboardData?.recentSales || []
    const lowStockProducts = dashboardData?.lowStockProducts || []
    const salesTrend = dashboardData?.salesTrend || []
    const categoryBreakdown = dashboardData?.categoryBreakdown || []

    // Calculate sales trend percentage
    const getSalesTrendPercentage = () => {
        if (salesTrend.length < 2) return 0
        const recent = salesTrend[0]?.revenue || 0
        const previous = salesTrend[1]?.revenue || 0
        if (previous === 0) return recent > 0 ? 100 : 0
        return ((recent - previous) / previous) * 100
    }

    const salesTrendPercentage = getSalesTrendPercentage()

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/reports">View Reports</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/pos">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Open POS
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Today's Revenue"
                    value={formatCurrency(stats.totalRevenueToday)}
                    change={`${stats.totalOrdersToday} orders • ${stats.completedOrdersToday} completed`}
                    changeType={stats.totalRevenueToday > 0 ? "positive" : "neutral"}
                    icon={DollarSign}
                    iconColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrdersToday.toString()}
                    change={`${stats.pendingOrders} pending`}
                    changeType={stats.pendingOrders > 0 ? "neutral" : "positive"}
                    icon={ShoppingCart}
                    iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts.toString()}
                    change={`${stats.lowStockProducts} low stock`}
                    changeType={stats.lowStockProducts > 0 ? "warning" : "positive"}
                    icon={Package}
                    iconColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                />
                <StatCard
                    title="Inventory Value"
                    value={formatCurrency(stats.inventoryValue)}
                    change={`${stats.totalProducts} products`}
                    changeType="neutral"
                    icon={TrendingUp}
                    iconColor="bg-orange-500/10 text-orange-600 dark:text-orange-400"
                />
            </div>

            {/* Second Row Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers.toString()}
                    change={`${stats.newCustomersToday} new today`}
                    changeType="positive"
                    icon={Users}
                    iconColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                />
                <StatCard
                    title="Profit Margin"
                    value={`${stats.profitMarginToday.toFixed(2)}%`}
                    change="Today's margin"
                    changeType={stats.profitMarginToday > 20 ? "positive" : stats.profitMarginToday > 10 ? "neutral" : "warning"}
                    icon={TrendingUp}
                    iconColor="bg-green-500/10 text-green-600 dark:text-green-400"
                />
                <StatCard
                    title="Removals Today"
                    value={stats.totalRemovalsToday.toString()}
                    change={`${formatCurrency(stats.removalLossToday)} loss`}
                    changeType={stats.totalRemovalsToday > 0 ? "negative" : "positive"}
                    icon={AlertTriangle}
                    iconColor="bg-red-500/10 text-red-600 dark:text-red-400"
                />
                <StatCard
                    title="Sales Trend"
                    value={`${salesTrendPercentage >= 0 ? '+' : ''}${salesTrendPercentage.toFixed(1)}%`}
                    change="vs yesterday"
                    changeType={salesTrendPercentage >= 0 ? "positive" : "negative"}
                    icon={TrendingDown}
                    iconColor={salesTrendPercentage >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Sales Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Sales Overview</CardTitle>
                                <CardDescription>Last 30 days sales trend</CardDescription>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total: {formatCurrency(salesTrend.reduce((sum, day) => sum + day.revenue, 0))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {salesTrend.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center space-y-2">
                                        <TrendingUp className="h-12 w-12 mx-auto text-primary" />
                                        <p>No sales data for the last 30 days</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-7 gap-2 h-48">
                                        {salesTrend.slice(0, 7).map((day, index) => {
                                            const maxRevenue = Math.max(...salesTrend.slice(0, 7).map(d => d.revenue))
                                            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                                            return (
                                                <div key={index} className="flex flex-col items-center justify-end">
                                                    <div
                                                        className="w-8 bg-primary rounded-t-md transition-all duration-300 hover:bg-primary/80"
                                                        style={{ height: `${height}%` }}
                                                        title={`${formatCurrency(day.revenue)}`}
                                                    />
                                                    <div className="text-xs text-muted-foreground mt-2">
                                                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 border rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-600">
                                                {salesTrend[0]?.orders || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Orders Today</div>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {formatCurrency(salesTrend[0]?.revenue || 0)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Revenue Today</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Best performers overall</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No sales data yet</p>
                            ) : (
                                topProducts.map((product, index) => (
                                    <div key={product.productID} className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{product.productName}</p>
                                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{product.quantitySold.toFixed(2)} sold</div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatCurrency(product.revenue)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Sales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>Latest transactions from your store</CardDescription>
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
                                {recentSales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No sales yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentSales.map((sale) => (
                                        <TableRow key={sale.sellID}>
                                            <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                                            <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                                            <TableCell>{formatCurrency(sale.total)}</TableCell>
                                            <TableCell>
                                                <Badge variant="default">Completed</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                        <CardDescription>Products running low on inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lowStockProducts.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    All products are well stocked
                                </p>
                            ) : (
                                lowStockProducts.slice(0, 5).map((product) => (
                                    <div key={product.productID} className="flex items-center gap-4">
                                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{product.productName}</p>
                                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="text-orange-600 dark:text-orange-400 border-orange-600/50"
                                        >
                                            {product.stockQuantity} left
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                        {lowStockProducts.length > 5 && (
                            <div className="mt-4 pt-4 border-t">
                                <Button variant="ghost" size="sm" className="w-full" asChild>
                                    <Link href="/products">
                                        View all {lowStockProducts.length} low stock products
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Category Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>Revenue breakdown by product category</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {categoryBreakdown.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No category data available</p>
                        ) : (
                            categoryBreakdown.map((category) => (
                                <div key={category.categoryID} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{category.categoryName}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {Math.round(category?.percentage)}%
                                            </Badge>
                                        </div>
                                        <span className="font-medium">{formatCurrency(category.revenue)}</span>
                                    </div>
                                    <Progress value={category.percentage} className="h-2" />
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}