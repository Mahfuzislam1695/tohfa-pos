"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Eye,
    Receipt,
    Trash2,
    DollarSign,
    CreditCard,
    Smartphone,
    Building,
    Wallet,
    Loader2,
    ChevronLeft,
    ChevronRight,
    User,
    FileText,
    Calendar,
    Filter,
    Download
} from "lucide-react"
import { useDelete } from "@/hooks/useDelete"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { useDues, Payment } from "@/hooks/useDues"
import { useQueryClient } from "@tanstack/react-query"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
// import { DatePickerWithRange } from "@/components/ui/date-range-picker"
// import { DateRange } from "react-day-picker"

interface PaymentListProps {
    customerId?: number
    onView?: (item: any) => void
    onAddPayment?: (customerId?: number, saleId?: number, dueAmount?: number) => void
}

export function PaymentList({ customerId, onView, onAddPayment }: PaymentListProps) {
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [methodFilter, setMethodFilter] = useState<string>("")
    // const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [showFilters, setShowFilters] = useState(false)
    const queryClient = useQueryClient()

    // Use payments hook
    const {
        payments,
        meta,
        isLoading,
        refetch,
        setSearchTerm,
        searchTerm,
        itemsPerPage,
        setItemsPerPage,
        currentPage,
        setCurrentPage
    } = useDues(customerId, {
        // startDate: dateRange?.from?.toISOString().split('T')[0],
        // endDate: dateRange?.to?.toISOString().split('T')[0],
        status: statusFilter,
        paymentMethod: methodFilter
    })

    // Delete mutation
    const { mutate: deletePayment, isPending: isDeleting } = useDelete(
        "/payments",
        ["payments", currentPage, itemsPerPage, debouncedSearch, customerId],
        {
            successMessage: "Payment deleted successfully!",
            errorMessage: "Failed to delete payment",
            onSuccess: () => {
                refetch()
                queryClient.invalidateQueries({ queryKey: ["customerDueDetails"] })
                queryClient.invalidateQueries({ queryKey: ["allCustomerDues"] })
            }
        }
    )

    // Debounce search input
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 500)

        setSearchTimeout(timeout)

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTerm])

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        const newLimit = parseInt(value)
        setItemsPerPage(newLimit)
        setCurrentPage(1)
    }

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Handle search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    // Handle delete
    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this payment? This action cannot be undone.")) return
        deletePayment(id)
    }

    // Handle view
    const handleView = (payment: Payment) => {
        setSelectedPayment(payment)
        setIsViewDialogOpen(true)
    }

    // Handle add payment for specific sale
    const handleAddForSale = (payment: Payment) => {
        if (onAddPayment && payment.sellID) {
            onAddPayment(payment.customerID, payment.sellID, payment.amount)
        }
    }

    // Handle download receipt
    const handleDownloadReceipt = (paymentId: number) => {
        // Implement receipt download
        window.open(`/payments/export/receipt/${paymentId}`, '_blank')
    }

    // Clear filters
    const clearFilters = () => {
        setStatusFilter("")
        setMethodFilter("")
        // setDateRange(undefined)
        setShowFilters(false)
    }

    // Get payment method icon
    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH': return <Wallet className="h-4 w-4" />
            case 'CARD': return <CreditCard className="h-4 w-4" />
            case 'MOBILE_BANKING': return <Smartphone className="h-4 w-4" />
            case 'BANK_TRANSFER': return <Building className="h-4 w-4" />
            default: return <DollarSign className="h-4 w-4" />
        }
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
            case 'PENDING':
                return <Badge variant="outline" className="border-amber-500 text-amber-700">Pending</Badge>
            case 'PARTIAL':
                return <Badge variant="outline" className="border-blue-500 text-blue-700">Partial</Badge>
            case 'VOIDED':
                return <Badge variant="destructive">Voided</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // Format date with time
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Calculate serial number
    const getSerialNumber = (index: number) => {
        return (currentPage - 1) * itemsPerPage + index + 1
    }

    return (
        <>
            <div className="space-y-6">
                {/* Statistics Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{meta?.totalItems || 0}</div>
                            <p className="text-xs text-muted-foreground">All time payments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ৳{payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">Collected amount</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <Badge variant="default" className="bg-green-100 text-green-800">✓</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {payments.filter(p => p.status === 'COMPLETED').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Successful payments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Badge variant="outline" className="border-amber-500 text-amber-700">!</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {payments.filter(p => p.status === 'PENDING').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Awaiting completion</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Payments</CardTitle>
                                    <CardDescription>
                                        {customerId ? "Payments for this customer" : "All payments"}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center gap-2"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Filters
                                    </Button>
                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search payments..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            {showFilters && (
                                <div className="p-4 border rounded-lg space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Filters</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-8 text-xs"
                                        >
                                            Clear all
                                        </Button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm">Status</Label>
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All Statuses</SelectItem>
                                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                    <SelectItem value="PARTIAL">Partial</SelectItem>
                                                    <SelectItem value="VOIDED">Voided</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Payment Method</Label>
                                            <Select value={methodFilter} onValueChange={setMethodFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All methods" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All Methods</SelectItem>
                                                    <SelectItem value="CASH">Cash</SelectItem>
                                                    <SelectItem value="CARD">Card</SelectItem>
                                                    <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
                                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* <div className="space-y-2">
                                            <Label className="text-sm">Date Range</Label>
                                            <DatePickerWithRange
                                                date={dateRange}
                                                setDate={setDateRange}
                                            />
                                        </div> */}
                                    </div>
                                </div>
                            )}

                            {/* Items per page selector */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">Show:</span>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onValueChange={handleItemsPerPageChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-20">
                                            <SelectValue placeholder="10" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-muted-foreground">per page</span>
                                </div>
                                {searchTerm && (
                                    <div className="text-sm text-muted-foreground">
                                        Search results for: "<span className="font-medium">{searchTerm}</span>"
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {isLoading && payments.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border mb-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16 text-center">SL</TableHead>
                                                <TableHead>Payment Number</TableHead>
                                                {!customerId && <TableHead>Customer</TableHead>}
                                                {!customerId && <TableHead>Invoice</TableHead>}
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={!customerId ? 9 : 7}
                                                        className="text-center text-muted-foreground h-32"
                                                    >
                                                        {searchTerm
                                                            ? `No payments found matching "${searchTerm}"`
                                                            : `No payments found`
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                payments.map((payment, index) => (
                                                    <TableRow key={payment.paymentID}>
                                                        <TableCell className="font-medium text-center">
                                                            {getSerialNumber(index)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{payment.paymentNumber}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    ID: {payment.paymentID}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        {!customerId && (
                                                            <TableCell>
                                                                {payment.customer ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{payment.customer.name}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {payment.customer.phone}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </TableCell>
                                                        )}
                                                        {!customerId && (
                                                            <TableCell>
                                                                {payment.sell ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{payment.sell.invoiceNumber}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Due: ৳{payment.sell.dueAmount.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">Advance</span>
                                                                )}
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-bold text-emerald-600">
                                                                    ৳{payment.amount.toLocaleString('en-US', {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getPaymentMethodIcon(payment.paymentMethod)}
                                                                <span>{payment.paymentMethod.replace('_', ' ')}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {payment.paymentType.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(payment.status)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span>{formatDate(payment.paymentDate)}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(payment.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-center gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleView(payment)}
                                                                    disabled={isDeleting}
                                                                    className="h-8 w-8 p-0"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                {payment.status !== 'VOIDED' && onAddPayment && payment.sell && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleAddForSale(payment)}
                                                                        disabled={isDeleting}
                                                                        className="h-8 w-8 p-0"
                                                                        title="Add Another Payment"
                                                                    >
                                                                        <DollarSign className="h-4 w-4" />
                                                                    </Button>
                                                                )}


                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {meta && meta.totalPages > 0 && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                            {Math.min(currentPage * itemsPerPage, meta.totalItems)} of{" "}
                                            {meta.totalItems} entries
                                        </div>

                                        {meta.totalPages > 1 && (
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1 || isLoading}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>

                                                {/* Page numbers */}
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                                                        let pageNum
                                                        if (meta.totalPages <= 5) {
                                                            pageNum = i + 1
                                                        } else if (currentPage <= 3) {
                                                            pageNum = i + 1
                                                        } else if (currentPage >= meta.totalPages - 2) {
                                                            pageNum = meta.totalPages - 4 + i
                                                        } else {
                                                            pageNum = currentPage - 2 + i
                                                        }

                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => handlePageChange(pageNum)}
                                                                disabled={isLoading}
                                                                className="w-8 h-8 p-0"
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        )
                                                    })}
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === meta.totalPages || isLoading}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View Payment Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <PaymentDetails payment={selectedPayment} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

// Add missing imports
import { Label } from "@/components/ui/label"
import { PaymentDetails } from "./payment-details"
