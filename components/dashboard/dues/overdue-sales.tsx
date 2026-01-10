"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, FileText, AlertTriangle, DollarSign, Loader2, Phone } from "lucide-react"
import { useOverdueSales } from "@/hooks/useDues"

interface OverdueSalesProps {
    onAddPayment?: (customerId: number, sellId: number, dueAmount: number) => void
}

export function OverdueSales({ onAddPayment }: OverdueSalesProps) {
    const [daysThreshold, setDaysThreshold] = useState<number>(30)
    const { overdueSales, isLoading, refetch } = useOverdueSales(daysThreshold)

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // Get overdue severity
    const getOverdueSeverity = (days: number) => {
        if (days <= 7) return <Badge variant="warning">Warning</Badge>
        if (days <= 30) return <Badge variant="destructive">Critical</Badge>
        return <Badge variant="destructive">Severe</Badge>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Overdue Sales</CardTitle>
                            <CardDescription>
                                Track sales that are past their due date
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Threshold:</span>
                            <Select
                                value={daysThreshold.toString()}
                                onValueChange={(value) => setDaysThreshold(parseInt(value))}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="30 days" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 days</SelectItem>
                                    <SelectItem value="15">15 days</SelectItem>
                                    <SelectItem value="30">30 days</SelectItem>
                                    <SelectItem value="60">60 days</SelectItem>
                                    <SelectItem value="90">90 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Sale Date</TableHead>
                                    <TableHead className="text-right">Due Amount</TableHead>
                                    <TableHead>Days Overdue</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {overdueSales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                                            No overdue sales found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    overdueSales.map((sale) => (
                                        <TableRow key={sale.sellID}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{sale.invoiceNumber}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{sale.customer.name}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {sale.customer.phone}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>{formatDate(sale.createdAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xl font-bold text-amber-600">
                                                        ৳{sale.dueAmount.toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                    <span className="font-medium">{sale.daysOverdue} days</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getOverdueSeverity(sale.daysOverdue)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onAddPayment?.(
                                                        sale.customer.customerID,
                                                        sale.sellID,
                                                        sale.dueAmount
                                                    )}
                                                    className="flex items-center gap-2"
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                    Collect
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}