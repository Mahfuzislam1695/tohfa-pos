"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    saleStorage,
    purchaseStorage,
    productStorage,
    type Sale,
    type Purchase,
    type Product,
} from "@/lib/localStorage"
import { Download, FileText, TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react"
import { exportSalesToCSV, exportSalesToPDF } from "@/lib/exportUtils"
import { getDateRange } from "@/lib/dateUtils"

export default function Reports() {
    const [sales, setSales] = useState<Sale[]>([])
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [dateFilter, setDateFilter] = useState("thisMonth")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setSales(saleStorage.getAll())
        setPurchases(purchaseStorage.getAll())
        setProducts(productStorage.getAll())
    }

    const filteredSales = sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt)
        const { start, end } = getDateRange(dateFilter)
        return saleDate >= start && saleDate <= end
    })

    const filteredPurchases = purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.createdAt)
        const { start, end } = getDateRange(dateFilter)
        return purchaseDate >= start && purchaseDate <= end
    })

    // Sales Statistics
    const salesStats = {
        totalSales: filteredSales.length,
        totalRevenue: filteredSales.reduce((sum, s) => sum + s.total, 0),
        totalDiscount: filteredSales.reduce((sum, s) => sum + s.discount, 0),
        totalTax: filteredSales.reduce((sum, s) => sum + s.tax, 0),
        itemsSold: filteredSales.reduce((sum, s) => sum + s.items.reduce((acc, i) => acc + i.quantity, 0), 0),
    }

    // Purchase Statistics
    const purchaseStats = {
        totalPurchases: filteredPurchases.length,
        totalCost: filteredPurchases.reduce((sum, p) => sum + p.total, 0),
        totalDiscount: filteredPurchases.reduce((sum, p) => sum + p.discount, 0),
        itemsPurchased: filteredPurchases.reduce((sum, p) => sum + p.items.reduce((acc, i) => acc + i.quantity, 0), 0),
    }

    // Profit
    const grossProfit = salesStats.totalRevenue - purchaseStats.totalCost

    // Product Statistics
    const lowStockProducts = products.filter((p) => p.stockQuantity <= p.lowStockThreshold)
    const outOfStockProducts = products.filter((p) => p.stockQuantity === 0)
    const totalInventoryValue = products.reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0)

    // Top Products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
    filteredSales.forEach((sale) => {
        sale.items.forEach((item) => {
            const existing = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 }
            existing.quantity += item.quantity
            existing.revenue += item.subtotal
            productSales.set(item.productId, existing)
        })
    })
    const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

    // Category-wise sales
    const categorySales = new Map<string, number>()
    filteredSales.forEach((sale) => {
        sale.items.forEach((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (product) {
                categorySales.set(product.category, (categorySales.get(product.category) || 0) + item.subtotal)
            }
        })
    })

    // Brand-wise sales
    const brandSales = new Map<string, number>()
    filteredSales.forEach((sale) => {
        sale.items.forEach((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (product) {
                brandSales.set(product.brand, (brandSales.get(product.brand) || 0) + item.subtotal)
            }
        })
    })
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">Comprehensive business insights and statistics</p>
                </div>
                <div className="flex items-center gap-2">
                    <Label>Period:</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="last7days">Last 7 Days</SelectItem>
                            <SelectItem value="last30days">Last 30 Days</SelectItem>
                            <SelectItem value="thisMonth">This Month</SelectItem>
                            <SelectItem value="lastMonth">Last Month</SelectItem>
                            <SelectItem value="thisQuarter">This Quarter</SelectItem>
                            <SelectItem value="thisYear">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales Report</TabsTrigger>
                    <TabsTrigger value="purchase">Purchase Report</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Total Revenue
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">৳{salesStats.totalRevenue.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">{salesStats.totalSales} sales</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4" />
                                    Total Cost
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">৳{purchaseStats.totalCost.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">{purchaseStats.totalPurchases} purchases</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Gross Profit
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    ৳{grossProfit.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{grossProfit >= 0 ? "Profit" : "Loss"}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Inventory Value
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">৳{totalInventoryValue.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">{products.length} products</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
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
                                            <TableHead>Qty Sold</TableHead>
                                            <TableHead>Revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                    No data available
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            topProducts.map((product, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell>{product.quantity.toFixed(2)}</TableCell>
                                                    <TableCell>৳{product.revenue.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Category-wise Sales</CardTitle>
                                <CardDescription>Sales breakdown by product category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Array.from(categorySales.entries())
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([category, revenue]) => (
                                                <TableRow key={category}>
                                                    <TableCell className="font-medium">{category}</TableCell>
                                                    <TableCell>৳{revenue.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        {categorySales.size === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                    No data available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-5">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{salesStats.totalSales}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">৳{salesStats.totalRevenue.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{salesStats.itemsSold.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">৳{salesStats.totalDiscount.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">৳{salesStats.totalTax.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Sales Details</CardTitle>
                                    <CardDescription>All sales for the selected period</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => exportSalesToCSV(filteredSales)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                    <Button variant="outline" onClick={() => exportSalesToPDF(filteredSales)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Export PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSales.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                No sales found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSales.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                                                <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                                                <TableCell>{sale.items.length} items</TableCell>
                                                <TableCell className="font-medium">৳{sale.total.toFixed(2)}</TableCell>
                                                <TableCell>{sale.paymentMethod}</TableCell>
                                                <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="purchase" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{purchaseStats.totalPurchases}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">৳{purchaseStats.totalCost.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Items Purchased</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{purchaseStats.itemsPurchased.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">৳{purchaseStats.totalDiscount.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Details</CardTitle>
                            <CardDescription>All purchases for the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Purchase No.</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPurchases.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                No purchases found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPurchases.map((purchase) => (
                                            <TableRow key={purchase.id}>
                                                <TableCell className="font-medium">{purchase.purchaseNumber}</TableCell>
                                                <TableCell>{purchase.supplierName}</TableCell>
                                                <TableCell>{purchase.items.length} items</TableCell>
                                                <TableCell className="font-medium">৳{purchase.total.toFixed(2)}</TableCell>
                                                <TableCell>{purchase.paymentMethod}</TableCell>
                                                <TableCell>{new Date(purchase.createdAt).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{products.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">৳{totalInventoryValue.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Low Stock Products</CardTitle>
                                <CardDescription>Products that need restocking</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Threshold</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lowStockProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                    No low stock products
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            lowStockProducts.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell className="text-orange-600">{product.stockQuantity}</TableCell>
                                                    <TableCell>{product.lowStockThreshold}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Out of Stock Products</CardTitle>
                                <CardDescription>Products that are unavailable</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Category</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {outOfStockProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                    No out of stock products
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            outOfStockProducts.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell>{product.sku}</TableCell>
                                                    <TableCell>{product.category}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
