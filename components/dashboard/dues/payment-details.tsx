"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    DollarSign,
    CreditCard,
    Smartphone,
    Building,
    Wallet,
    Calendar,
    User,
    FileText,
    Receipt,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    ExternalLink,
    Phone,
    Mail,
    Banknote,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Payment } from "@/hooks/useDues"

interface PaymentDetailsProps {
    payment: Payment
}

export function PaymentDetails({ payment }: PaymentDetailsProps) {
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

    // Get payment method icon and label
    const getPaymentMethodInfo = (method: string) => {
        switch (method) {
            case 'CASH':
                return { icon: Wallet, label: 'Cash', color: 'text-green-600', bgColor: 'bg-green-50' }
            case 'CARD':
                return { icon: CreditCard, label: 'Card', color: 'text-blue-600', bgColor: 'bg-blue-50' }
            case 'MOBILE_BANKING':
                return { icon: Smartphone, label: 'Mobile Banking', color: 'text-purple-600', bgColor: 'bg-purple-50' }
            case 'BANK_TRANSFER':
                return { icon: Building, label: 'Bank Transfer', color: 'text-amber-600', bgColor: 'bg-amber-50' }
            default:
                return { icon: DollarSign, label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-50' }
        }
    }

    // Get status info
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { icon: CheckCircle, label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-50' }
            case 'PENDING':
                return { icon: Clock, label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-50' }
            case 'PARTIAL':
                return { icon: TrendingUp, label: 'Partial', color: 'text-blue-600', bgColor: 'bg-blue-50' }
            case 'VOIDED':
                return { icon: AlertTriangle, label: 'Voided', color: 'text-red-600', bgColor: 'bg-red-50' }
            default:
                return { icon: DollarSign, label: status, color: 'text-gray-600', bgColor: 'bg-gray-50' }
        }
    }

    const methodInfo = getPaymentMethodInfo(payment.paymentMethod)
    const statusInfo = getStatusInfo(payment.status)
    const MethodIcon = methodInfo.icon
    const StatusIcon = statusInfo.icon

    // Handle receipt download
    const handleDownloadReceipt = () => {
        window.open(`/payments/export/receipt/${payment.paymentID}`, '_blank')
    }

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{payment.paymentNumber}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={payment.status === 'COMPLETED' ? 'default' : payment.status === 'VOIDED' ? 'destructive' : 'outline'}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                        </Badge>
                        <Badge variant="outline" className={methodInfo.bgColor}>
                            <MethodIcon className={`h-3 w-3 mr-1 ${methodInfo.color}`} />
                            {methodInfo.label}
                        </Badge>
                        {payment.paymentType && (
                            <Badge variant="secondary">
                                {payment.paymentType.replace('_', ' ')}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">
                        ৳{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground">Payment Amount</div>
                </div>
            </div>

            <Separator />

            {/* Main Info Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment ID</p>
                                    <p className="font-medium font-mono">{payment.paymentID}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">SID</p>
                                    <p className="font-medium text-xs font-mono text-gray-500">{payment.paymentSid}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        ৳{payment.amount.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                                        <span className="font-medium">{statusInfo.label}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Method</p>
                                    <div className="flex items-center gap-2">
                                        <MethodIcon className={`h-4 w-4 ${methodInfo.color}`} />
                                        <span className="font-medium">{methodInfo.label}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium">{payment.paymentType?.replace('_', ' ') || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Transaction Details */}
                            {payment.transactionId && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Transaction ID</p>
                                        <p className="font-medium font-mono text-sm">{payment.transactionId}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    {payment.customer && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{payment.customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{payment.customer.phone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Customer ID</p>
                                        <p className="font-medium">{payment.customer.customerID}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Current Balance</p>
                                        <p className={`text-xl font-bold ${payment.customer.currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            ৳{payment.customer.currentBalance.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
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
                                Dates & Times
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Payment Date</span>
                                    </div>
                                    <span className="font-medium">{formatDateTime(payment.paymentDate)}</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Created At</span>
                                    </div>
                                    <span className="font-medium">{formatDateTime(payment.createdAt)}</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Last Updated</span>
                                    </div>
                                    <span className="font-medium">{formatDateTime(payment.updatedAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sale Information (if applicable) */}
                    {payment.sell && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    Sale Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Invoice Number</p>
                                        <p className="font-medium font-mono">{payment.sell.invoiceNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Sale ID</p>
                                        <p className="font-medium">{payment.sell.sellID}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Amount</p>
                                        <p className="font-medium">
                                            ৳{payment.sell.total.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Due Amount</p>
                                        <p className="font-medium text-amber-600">
                                            ৳{payment.sell.dueAmount.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Method Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Banknote className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {payment.bankName && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Bank Name</span>
                                        <span className="font-medium">{payment.bankName}</span>
                                    </div>
                                )}
                                {payment.accountNumber && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Account Number</span>
                                            <span className="font-medium font-mono">{payment.accountNumber}</span>
                                        </div>
                                    </>
                                )}
                                {payment.chequeNumber && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Cheque/Card Number</span>
                                            <span className="font-medium">{payment.chequeNumber}</span>
                                        </div>
                                    </>
                                )}
                                {payment.mobileOperator && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Mobile Operator</span>
                                            <span className="font-medium">{payment.mobileOperator}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Received By */}
                    {payment.receivedBy && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Received By
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{payment.receivedBy.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">User ID</p>
                                        <p className="font-medium">{payment.receivedBy.userID}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{payment.receivedBy.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Notes and Footer */}
            {payment.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{payment.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                    Last updated: {formatDateTime(payment.updatedAt)}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDownloadReceipt}
                        className="flex items-center gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        Download Receipt
                    </Button>
                    {payment.sell && (
                        <Button
                            variant="outline"
                            onClick={() => window.open(`/sales/invoice/${payment.sell?.invoiceNumber}`, '_blank')}
                            className="flex items-center gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Sale
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}