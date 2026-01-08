import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, CheckCircle, Lightbulb, Package, Repeat, XCircle } from "lucide-react"
import { InventoryReportData } from "@/types/dashboard"
import { formatCurrency } from "@/lib/units"

interface InventoryReportSummaryProps {
    data: InventoryReportData
}

export function InventoryReportSummary({ data }: InventoryReportSummaryProps) {
    return (
        <div className="space-y-6">
            {/* Inventory Health Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Inventory Value Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Inventory Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="text-2xl font-bold text-blue-700">
                                {formatCurrency(data.summary.inventoryValue)}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Potential Revenue</span>
                                <span className="font-medium text-green-700">
                                    {formatCurrency(data.summary.potentialRevenue)}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                                {data.summary.totalStockQuantity} units in stock
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Health Card */}
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Stock Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="text-2xl font-bold text-emerald-700">
                                {data.summary.totalProducts - data.summary.outOfStockProducts}
                            </div>
                            <div className="text-sm text-muted-foreground">Products Available</div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Healthy Stock</span>
                                <span className="font-medium text-emerald-700">
                                    {data.summary.totalProducts - data.summary.lowStockProducts - data.summary.outOfStockProducts}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Alerts Card */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Low Stock</span>
                                <div className="text-lg font-bold text-orange-600">
                                    {data.summary.lowStockProducts}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Out of Stock</span>
                                <div className="text-lg font-bold text-red-600">
                                    {data.summary.outOfStockProducts}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                                {((data.summary.lowStockProducts + data.summary.outOfStockProducts) / data.summary.totalProducts * 100).toFixed(1)}% of products need attention
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Efficiency Card */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Repeat className="h-4 w-4" />
                            Inventory Efficiency
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="text-2xl font-bold text-purple-700">
                                {data.summary.inventoryTurnover.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">Turnover Ratio</div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Avg. Value/Product</span>
                                <span className="font-medium text-purple-700">
                                    {formatCurrency(data.summary.averageStockValue)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Inventory Insights
                    </CardTitle>
                    <CardDescription>Key metrics for better inventory management</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-700">
                                {data.summary.totalProducts}
                            </div>
                            <p className="text-sm mt-1">Total Products</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {data.summary.activeProducts} active
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                            <div className="text-lg font-bold text-emerald-700">
                                {formatCurrency(data.summary.potentialRevenue - data.summary.inventoryValue)}
                            </div>
                            <p className="text-sm mt-1">Potential Profit</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                If all stock sells
                            </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg">
                            <div className="text-lg font-bold text-amber-700">
                                {data.summary.totalStockQuantity > 0 ?
                                    (data.summary.lowStockProducts / data.summary.totalStockQuantity * 100).toFixed(1) : 0}%
                            </div>
                            <p className="text-sm mt-1">Stock Risk</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Low stock percentage
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-700">
                                {data.summary.inventoryTurnover > 2.5 ? 'Fast' :
                                    data.summary.inventoryTurnover > 1.0 ? 'Moderate' : 'Slow'}
                            </div>
                            <p className="text-sm mt-1">Turnover Rate</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Sales vs. inventory
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stock Status Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Stock Status Overview
                    </CardTitle>
                    <CardDescription>Current inventory health by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-4">
                            <h3 className="font-medium text-emerald-700 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Healthy Stock
                            </h3>
                            <div className="p-4 bg-emerald-50 rounded-lg">
                                <div className="text-2xl font-bold text-emerald-700">
                                    {data.summary.totalProducts - data.summary.lowStockProducts - data.summary.outOfStockProducts}
                                </div>
                                <p className="text-sm mt-1">Products</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Stock levels are sufficient
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-medium text-orange-700 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Needs Attention
                            </h3>
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">
                                    {data.summary.lowStockProducts}
                                </div>
                                <p className="text-sm mt-1">Products</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Below threshold, restock soon
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-medium text-red-700 flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Urgent Action
                            </h3>
                            <div className="p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {data.summary.outOfStockProducts}
                                </div>
                                <p className="text-sm mt-1">Products</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Currently unavailable
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}