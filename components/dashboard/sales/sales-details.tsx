"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, Package, Percent, Hash, User, FileText, ShoppingBag, CreditCard, Tag, Receipt } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/units"

interface SalesDetailsProps {
    sale: any
}

export function SalesDetails({ sale }: SalesDetailsProps) {
    // Calculate totals
    const totalItems = sale.sellItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{sale.invoiceNumber}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={
                            sale.paymentStatus === "COMPLETED" ? "default" :
                                sale.paymentStatus === "PENDING" ? "secondary" :
                                    sale.paymentStatus === "FAILED" ? "destructive" : "outline"
                        }>
                            {sale.paymentStatus}
                        </Badge>
                        <Badge variant={
                            sale.paymentMethod === "CASH" ? "default" :
                                sale.paymentMethod === "CARD" ? "secondary" : "outline"
                        }>
                            {sale.paymentMethod.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">৳{sale.total.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
            </div>

            <Separator />

            {/* Main Info Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{sale.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{sale.customerPhone || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">৳{sale.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Discount</span>
                                    <span className="font-medium text-emerald-600">-৳{sale.discount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Tax ({sale.taxRate}%)</span>
                                    <span className="font-medium">৳{sale.tax.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Total Amount</span>
                                    <span className="text-xl font-bold">৳{sale.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Received Amount</span>
                                    <span className="font-medium">৳{sale.receivedAmount?.toFixed(2) || sale.total.toFixed(2)}</span>
                                </div>
                                {sale.changeAmount && sale.changeAmount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Change Amount</span>
                                        <span className="font-medium text-emerald-600">৳{sale.changeAmount.toFixed(2)}</span>
                                    </div>
                                )}
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
                                <p className="text-sm text-muted-foreground">Notes</p>
                                <p className="font-medium">{sale.notes || "No notes"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Items Sold */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Items Sold ({totalItems} items)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sale.sellItems.map((item: any) => (
                                            <TableRow key={item.sellItemID}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.productName}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            SKU: {item.productSku}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-medium">{item.quantity}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-medium">৳{item.unitPrice.toFixed(2)}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-bold">৳{item.subtotal.toFixed(2)}</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Transaction Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Items</span>
                                    <span className="font-medium">{totalItems}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Unique Products</span>
                                    <span className="font-medium">{sale.sellItems.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Average Item Value</span>
                                    <span className="font-medium">৳{(sale.subtotal / totalItems).toFixed(2)}</span>
                                </div>
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
                            <span>Created: {formatDate(sale.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Updated: {formatDate(sale.updatedAt)}</span>
                        </div>
                        {sale.createdBy && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Sold by: {sale.createdBy.name} ({sale.createdBy.email})</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}