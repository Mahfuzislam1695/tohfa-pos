import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import { InventoryReportData } from "@/types/dashboard"
import { formatCurrency } from "@/lib/units"

interface InventoryReportDetailedProps {
    data: InventoryReportData
    onExport: () => void
}

export function InventoryReportDetailed({ data, onExport }: InventoryReportDetailedProps) {
    return (
        <div className="space-y-6 pt-6 border-t">
            <h2 className="text-xl font-bold">Detailed Inventory Analysis</h2>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalProducts}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {data.summary.activeProducts} active
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(data.summary.inventoryValue)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {data.summary.totalStockQuantity} units
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {data.summary.lowStockProducts}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {data.summary.lowStockProducts > 0 ?
                                `${((data.summary.lowStockProducts / data.summary.totalProducts) * 100).toFixed(1)}% of products` :
                                'All good'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {data.summary.outOfStockProducts}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {data.summary.outOfStockProducts > 0 ?
                                `${((data.summary.outOfStockProducts / data.summary.totalProducts) * 100).toFixed(1)}% of products` :
                                'All in stock'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-green-600">
                            {formatCurrency(data.summary.potentialRevenue)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            If all stock sells
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Average Stock Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-blue-600">
                            {formatCurrency(data.summary.averageStockValue)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Per product
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-purple-600">
                            {data.summary.inventoryTurnover.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            Times per period
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Breakdown */}
            {data.categoryBreakdown && data.categoryBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                        <CardDescription>Inventory value by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Inventory Value</TableHead>
                                    <TableHead>% of Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.categoryBreakdown.map((category) => (
                                    <TableRow key={category.categoryID}>
                                        <TableCell className="font-medium">{category.categoryName}</TableCell>
                                        <TableCell>{category.productCount}</TableCell>
                                        <TableCell className="text-blue-600">
                                            {formatCurrency(category.stockValue)}
                                        </TableCell>
                                        <TableCell>
                                            {data.summary.inventoryValue > 0 ?
                                                ((category.stockValue / data.summary.inventoryValue) * 100).toFixed(1) : 0}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Inventory Details Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Inventory Details</CardTitle>
                            <CardDescription>All products with current stock levels</CardDescription>
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
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Threshold</TableHead>
                                    <TableHead>Purchase Price</TableHead>
                                    <TableHead>Selling Price</TableHead>
                                    <TableHead>Profit Margin</TableHead>
                                    <TableHead>Inventory Value</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                            No products found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.products.map((product) => (
                                        <TableRow key={product.productID}>
                                            <TableCell className="font-medium">{product.sku}</TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.categoryName}</TableCell>
                                            <TableCell className={
                                                product.isOutOfStock ? "text-red-600" :
                                                    product.isLowStock ? "text-orange-600" : "text-emerald-600"
                                            }>
                                                {product.stockQuantity}
                                            </TableCell>
                                            <TableCell>{product.lowStockThreshold}</TableCell>
                                            <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
                                            <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                                            <TableCell className={`${product.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {product.profitMargin.toFixed(1)}%
                                            </TableCell>
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
            {data.lowStockProducts && data.lowStockProducts.length > 0 && (
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
                                    <TableHead>Category</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>Threshold</TableHead>
                                    <TableHead>Difference</TableHead>
                                    <TableHead>Urgency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.lowStockProducts.map((product) => {
                                    const difference = product.lowStockThreshold - product.stockQuantity;
                                    const urgency = difference > 5 ? 'High' : difference > 2 ? 'Medium' : 'Low';
                                    return (
                                        <TableRow key={product.productID}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.sku}</TableCell>
                                            <TableCell>{product.categoryName}</TableCell>
                                            <TableCell className="text-orange-600">{product.stockQuantity}</TableCell>
                                            <TableCell>{product.lowStockThreshold}</TableCell>
                                            <TableCell className="text-red-600">
                                                {difference}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${urgency === 'High' ? 'bg-red-100 text-red-800' :
                                                    urgency === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {urgency}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Out of Stock Products */}
            {data.outOfStockProducts && data.outOfStockProducts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-700">Out of Stock Products</CardTitle>
                        <CardDescription>Products currently unavailable for sale</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Last Stock</TableHead>
                                    <TableHead>Purchase Price</TableHead>
                                    <TableHead>Selling Price</TableHead>
                                    <TableHead>Lost Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.outOfStockProducts.map((product) => (
                                    <TableRow key={product.productID}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>{product.categoryName}</TableCell>
                                        <TableCell className="text-red-600">0</TableCell>
                                        <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
                                        <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                                        <TableCell className="text-red-600">
                                            {formatCurrency(product.sellingPrice - product.purchasePrice)} per unit
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}