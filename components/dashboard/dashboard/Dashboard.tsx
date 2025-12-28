"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    saleStorage,
    productStorage,
    productSpecificStorage,
    saleSpecificStorage,
    type Sale,
    type Product,
} from "@/lib/localStorage"
import { StatCard } from "@/components/dashboard/dashboard/stat-card"

export default function Dashboard() {
    const [sales, setSales] = useState<Sale[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
    const [todaySales, setTodaySales] = useState<Sale[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const allSales = saleStorage.getAll()
        const allProducts = productStorage.getAll()

        setSales(allSales)
        setProducts(allProducts)
        setLowStockProducts(productSpecificStorage.getLowStock())
        setTodaySales(saleSpecificStorage.getTodaySales())
    }

    // Calculate statistics
    const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0)
    const totalOrders = todaySales.length

    // Get top selling products (from all sales)
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
    sales.forEach((sale) => {
        sale.items.forEach((item) => {
            const existing = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 }
            existing.quantity += item.quantity
            existing.revenue += item.subtotal
            productSales.set(item.productId, existing)
        })
    })
    const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

    // Recent sales (last 5)
    const recentSales = [...sales]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2">
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
                    title="Today's Sales"
                    value={`৳${totalSales.toFixed(2)}`}
                    change={`${totalOrders} orders today`}
                    changeType="positive"
                    icon={DollarSign}
                    iconColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    title="Total Orders"
                    value={totalOrders.toString()}
                    change={`Total: ${sales.length} orders`}
                    changeType="positive"
                    icon={ShoppingCart}
                    iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Total Products"
                    value={products.length.toString()}
                    change={`${lowStockProducts.length} low stock items`}
                    changeType={lowStockProducts.length > 0 ? "neutral" : "positive"}
                    icon={Package}
                    iconColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                />
                <StatCard
                    title="Inventory Value"
                    value={`৳${products.reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0).toFixed(2)}`}
                    change="Current stock value"
                    changeType="neutral"
                    icon={TrendingUp}
                    iconColor="bg-orange-500/10 text-orange-600 dark:text-orange-400"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Sales Chart Placeholder */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Your sales performance this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            <div className="text-center space-y-2">
                                <TrendingUp className="h-12 w-12 mx-auto text-primary" />
                                <p>Sales trend visualization</p>
                                <p className="text-sm">Total revenue: ৳{sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}</p>
                            </div>
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
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">{product.quantity.toFixed(2)} sold</p>
                                        </div>
                                        <div className="text-sm font-medium">৳{product.revenue.toFixed(2)}</div>
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
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                                            <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                                            <TableCell>৳{sale.total.toFixed(2)}</TableCell>
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
                                <p className="text-center text-muted-foreground py-8">All products are well stocked</p>
                            ) : (
                                lowStockProducts.slice(0, 5).map((product) => (
                                    <div key={product.id} className="flex items-center gap-4">
                                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="text-orange-600 dark:text-orange-400 border-orange-600/50"
                                        >
                                            {product.stockQuantity.toFixed(2)} left
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}