"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Calendar,
    DollarSign,
    Package,
    Box,
    User,
    FileText,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    Tag,
    Layers,
    ShoppingCart,
    Trash2,
    Percent
} from "lucide-react"
import { Progress } from "@/components/ui/progress" // Add this if you have a Progress component

interface PurchaseDetailsProps {
    purchase: any
}

export function PurchaseDetails({ purchase }: PurchaseDetailsProps) {
    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    // Format date with time
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Check expiry status
    const getExpiryStatus = (expiryDate?: string) => {
        if (!expiryDate) return null

        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return { status: "expired", label: "Expired", color: "text-red-600", bgColor: "bg-red-50", icon: AlertTriangle }
        if (diffDays <= 7) return { status: "expiring", label: "Expiring Soon", color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertTriangle }
        return { status: "valid", label: "Valid", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle }
    }

    // Calculate metrics
    const remainingQuantity = purchase.remainingQuantity || purchase.remainigQuantity || 0
    const totalQuantity = purchase.totalQuantity || purchase.quantity || 0
    const soldRemovedQuantity = totalQuantity - remainingQuantity
    const utilizationPercentage = totalQuantity > 0 ? (soldRemovedQuantity / totalQuantity) * 100 : 0
    const averageUnitPrice = remainingQuantity > 0 ? purchase.batchValue / remainingQuantity : 0

    const expiryStatus = getExpiryStatus(purchase.expiryDate)
    const IconComponent = expiryStatus?.icon || CheckCircle

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Purchase Batch #{purchase.batchID}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={expiryStatus?.status === "expired" ? "destructive" : expiryStatus?.status === "expiring" ? "warning" : "default"}>
                            {expiryStatus?.label || "Active"}
                        </Badge>
                        {purchase.product && (
                            <Badge variant="outline">
                                {purchase.product.sku}
                            </Badge>
                        )}
                        {soldRemovedQuantity > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {utilizationPercentage.toFixed(1)}% Utilized
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                        ৳{purchase.batchValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Batch Value</div>
                </div>
            </div>

            <Separator />

            {/* Main Info Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Batch Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Batch Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Batch ID</p>
                                    <p className="font-medium font-mono">{purchase.batchID}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Batch SID</p>
                                    <p className="font-medium text-xs font-mono text-gray-500">{purchase.batchSid}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Quantity</p>
                                    <p className="text-2xl font-bold">{totalQuantity.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Remaining Quantity</p>
                                    <p className="text-2xl font-bold text-blue-600">{remainingQuantity.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Unit Cost</p>
                                    <p className="font-medium">৳{purchase.unitCost.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Price</p>
                                    <p className="font-medium">৳{averageUnitPrice.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Progress Bar for Utilization */}
                            {totalQuantity > 0 && (
                                <div className="pt-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Utilization</span>
                                        <span className="font-medium">{utilizationPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${Math.min(100, utilizationPercentage)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>Remaining: {remainingQuantity}</span>
                                        <span>Sold/Removed: {soldRemovedQuantity}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Product Information */}
                    {purchase.product && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Box className="h-5 w-5" />
                                    Product Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Product Name</p>
                                        <p className="font-medium">{purchase.product.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">SKU</p>
                                        <p className="font-medium font-mono text-sm">{purchase.product.sku}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Product ID</p>
                                        <p className="font-medium">{purchase.product.productID}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit</p>
                                        <p className="font-medium">{purchase.product.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Category</p>
                                        <p className="font-medium">{purchase.product.category?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Brand</p>
                                        <p className="font-medium">{purchase.product.brand?.name || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Dates Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Dates Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Received At</span>
                                    </div>
                                    <span className="font-medium">{formatDateTime(purchase.receivedAt)}</span>
                                </div>

                                {purchase.expiryDate && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className={`h-4 w-4 ${expiryStatus?.color || 'text-muted-foreground'}`} />
                                                <span className="text-sm text-muted-foreground">Expiry Date</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{formatDate(purchase.expiryDate)}</span>
                                                {expiryStatus && (
                                                    <IconComponent className={`h-4 w-4 ${expiryStatus.color}`} />
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Financial Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Purchase Price</p>
                                    <p className="font-medium">৳{purchase.product?.purchasePrice?.toFixed(2) || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Selling Price</p>
                                    <p className="font-medium text-green-600">
                                        ৳{purchase.product?.sellingPrice?.toFixed(2) || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                                    <p className="font-medium text-emerald-600">
                                        {purchase.product?.sellingPrice && purchase.product?.purchasePrice
                                            ? `${((purchase.product.sellingPrice - purchase.product.purchasePrice) / purchase.product.purchasePrice * 100).toFixed(2)}%`
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Stock</p>
                                    <p className="font-medium">{purchase.product?.stockQuantity?.toLocaleString() || '0'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Created By */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Created By
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {purchase.createdBy ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{purchase.createdBy.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">User ID</p>
                                        <p className="font-medium">{purchase.createdBy.userID}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{purchase.createdBy.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No creator information available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes and Reason */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {purchase.reason && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Reason</p>
                                    <p className="font-medium">{purchase.reason}</p>
                                </div>
                            )}
                            {purchase.notes && (
                                <>
                                    {purchase.reason && <Separator />}
                                    <div>
                                        <p className="text-sm text-muted-foreground">Notes</p>
                                        <p className="font-medium whitespace-pre-wrap">{purchase.notes}</p>
                                    </div>
                                </>
                            )}
                            {!purchase.reason && !purchase.notes && (
                                <p className="text-muted-foreground">No additional information</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer - Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Batch Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Layers className="h-4 w-4 text-gray-600" />
                                <p className="text-sm text-muted-foreground">Total Quantity</p>
                            </div>
                            <p className="text-2xl font-bold">{totalQuantity.toLocaleString()} units</p>
                            <p className="text-xs text-muted-foreground mt-1">Originally received</p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-blue-600" />
                                <p className="text-sm text-muted-foreground">Remaining</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{remainingQuantity.toLocaleString()} units</p>
                            <p className="text-xs text-muted-foreground mt-1">Currently available</p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                    <ShoppingCart className="h-3 w-3" />
                                    <Trash2 className="h-3 w-3" />
                                </div>
                                <p className="text-sm text-muted-foreground">Sold/Removed</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{soldRemovedQuantity.toLocaleString()} units</p>
                            <p className="text-xs text-muted-foreground mt-1">Used or disposed</p>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Percent className="h-4 w-4 text-emerald-600" />
                                <p className="text-sm text-muted-foreground">Utilization</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{utilizationPercentage.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground mt-1">Batch efficiency</p>
                        </div>
                    </div>

                    {/* Additional Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Unit Cost</p>
                            <p className="text-xl font-bold">৳{purchase.unitCost.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Per unit cost</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Remaining Value</p>
                            <p className="text-xl font-bold text-blue-600">
                                ৳{(remainingQuantity * purchase.unitCost).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </p>
                            <p className="text-xs text-muted-foreground">Current inventory value</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Value</p>
                            <p className="text-xl font-bold text-emerald-600">
                                ৳{purchase.batchValue.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </p>
                            <p className="text-xs text-muted-foreground">Original batch value</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}