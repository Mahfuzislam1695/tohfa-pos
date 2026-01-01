"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, Package, Box, User, FileText, Clock, Calendar as CalendarIcon, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

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

    const expiryStatus = getExpiryStatus(purchase.expiryDate)
    const IconComponent = expiryStatus?.icon || CheckCircle

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Purchase Batch #{purchase.batchID}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={expiryStatus?.status === "expired" ? "destructive" : "default"}>
                            {expiryStatus?.label || "Active"}
                        </Badge>
                        {purchase.product && (
                            <Badge variant="outline">
                                {purchase.product.sku}
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
                                    <p className="text-sm text-muted-foreground">Quantity</p>
                                    <p className="text-2xl font-bold">{purchase.quantity.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Unit Cost</p>
                                    <p className="font-medium">৳{purchase.unitCost.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Unit Price</p>
                                    <p className="font-medium">৳{(purchase.batchValue / purchase.quantity).toFixed(2)}</p>
                                </div>
                            </div>
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
                                        <p className="font-medium">{purchase.product.sku}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Product ID</p>
                                        <p className="font-medium">{purchase.product.productID}</p>
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
                                <CalendarIcon className="h-5 w-5" />
                                Dates Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Received At</span>
                                    <span className="font-medium">{formatDateTime(purchase.receivedAt)}</span>
                                </div>

                                {purchase.expiryDate && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Expiry Date</span>
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
                                        <p className="font-medium">{purchase.notes}</p>
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
                    <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Quantity</p>
                            <p className="text-2xl font-bold">{purchase.quantity.toLocaleString()} units</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Average Cost</p>
                            <p className="text-2xl font-bold">৳{purchase.unitCost.toFixed(2)} per unit</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Value</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                ৳{purchase.batchValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}