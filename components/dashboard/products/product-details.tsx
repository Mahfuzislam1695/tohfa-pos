"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, Package, Percent, Hash, MapPin, FileText, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react"

interface ProductDetailsProps {
    product: any
}

export function ProductDetails({ product }: ProductDetailsProps) {
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

    // Calculate some values
    const inventoryValue = product.purchasePrice * product.stockQuantity
    const potentialRevenue = product.sellingPrice * product.stockQuantity
    const totalProfit = potentialRevenue - inventoryValue

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{product.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={product.isLowStock ? "destructive" : "default"}>
                            {product.isLowStock ? "Low Stock" : "In Stock"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">৳{product.sellingPrice.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Selling Price</div>
                </div>
            </div>

            <Separator />

            {/* Main Info Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
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
                                    <p className="text-sm text-muted-foreground">Barcode</p>
                                    <p className="font-medium">{product.barcode || "N/A"}</p>
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
                                    <p className="font-medium">{product.taxRate ? `${product.taxRate}%` : "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Hash className="h-5 w-5" />
                                Stock Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Stock</p>
                                    <p className="text-2xl font-bold">{product.stockQuantity}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Low Stock Threshold</p>
                                    <p className="text-2xl font-bold text-orange-600">{product.lowStockThreshold}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Reorder Point</p>
                                    <p className="font-medium">{product.reorderPoint || "Not Set"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Restocked</p>
                                    <p className="font-medium">
                                        {product.lastRestockedAt ? formatDate(product.lastRestockedAt) : "Never"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Pricing Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Pricing Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Purchase Price</p>
                                    <p className="text-xl font-bold">৳{product.purchasePrice.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Selling Price</p>
                                    <p className="text-xl font-bold text-emerald-600">৳{product.sellingPrice.toFixed(2)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                                    <div className="flex items-center gap-2">
                                        {product.profitMargin !== undefined ? (
                                            <>
                                                {product.profitMargin >= 0 ? (
                                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                )}
                                                <span className={`text-xl font-bold ${product.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {product.profitMargin.toFixed(2)}%
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory Value */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Percent className="h-5 w-5" />
                                Inventory Value
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Current Inventory Value</span>
                                    <span className="font-bold">৳{inventoryValue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Potential Revenue</span>
                                    <span className="font-bold text-emerald-600">৳{potentialRevenue.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Potential Profit</span>
                                    <span className={`font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        ৳{totalProfit.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Storage Location</p>
                                <p className="font-medium">{product.location || "Not Specified"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="font-medium">{product.description || "No description"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Notes</p>
                                <p className="font-medium">{product.notes || "No notes"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer - Created Info */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {formatDate(product.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Updated: {formatDate(product.updatedAt)}</span>
                        </div>
                        {product.createdBy && (
                            <div>
                                <span>Created by: {product.createdBy.name} ({product.createdBy.email})</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}