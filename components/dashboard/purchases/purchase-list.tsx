
"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Edit,
    Trash2,
    Package,
    AlertTriangle,
    DollarSign,
    TrendingUp,
    Loader2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Box,
    User,
    Clock,
    CalendarClock,
    FileText
} from "lucide-react"
import { useDelete } from "@/hooks/useDelete"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { usePurchases } from "@/hooks/use-purchases"

interface PurchaseListProps {
    productId?: number
    onView?: (item: any) => void
    onEdit?: (item: any) => void
}

export function PurchaseList({ productId, onView, onEdit }: PurchaseListProps) {
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Use purchases hook
    const {
        purchases,
        meta,
        isLoading,
        refetch,
        setSearchTerm,
        searchTerm,
        itemsPerPage,
        setItemsPerPage,
        currentPage,
        setCurrentPage
    } = usePurchases(productId)

    // Delete mutation
    const { mutate: deletePurchase, isPending: isDeleting } = useDelete(
        "/inventory/batches",
        ["purchases", currentPage, itemsPerPage, debouncedSearch, productId],
        {
            successMessage: "Purchase batch deleted successfully!",
            errorMessage: "Failed to delete purchase batch",
            onSuccess: () => {
                refetch()
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
            setCurrentPage(1) // Reset to first page when searching
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

    // Handle search on Enter key
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur()
        }
    }

    // Handle delete
    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this purchase batch?")) return
        deletePurchase(id)
    }

    // Calculate serial number
    const getSerialNumber = (index: number) => {
        return (currentPage - 1) * itemsPerPage + index + 1
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

    // Check if expiry date is approaching
    const getExpiryStatus = (expiryDate?: string) => {
        if (!expiryDate) return null

        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return { status: "expired", label: "Expired", variant: "destructive" as const }
        if (diffDays <= 7) return { status: "expiring", label: "Expiring Soon", variant: "warning" as const }
        return { status: "valid", label: "Valid", variant: "default" as const }
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {meta?.statistics && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{meta.statistics.totalBatches}</div>
                            <p className="text-xs text-muted-foreground">
                                {meta.statistics.batchesWithExpiry} with expiry date
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                            <Box className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{meta.statistics.totalQuantity.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Avg: {meta.statistics.averageBatchQuantity.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ৳{meta.statistics.totalValue.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Avg: ৳{meta.statistics.averageBatchValue.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expiry Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                {meta.statistics.expiringSoonCount + meta.statistics.expiredCount}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {meta.statistics.expiredCount} expired, {meta.statistics.expiringSoonCount} expiring soon
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Purchases Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Purchase Batches</CardTitle>
                                <CardDescription>
                                    {productId ? "Inventory batches for this product" : "Manage all purchase batches"}
                                </CardDescription>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search batches..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchKeyDown}
                                    className="pl-10"
                                />
                                {searchTerm && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <span className="text-xs text-muted-foreground">
                                            {isLoading ? "Searching..." : "Press Enter or wait"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

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
                    {isLoading && purchases.length === 0 ? (
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
                                            {!productId && <TableHead>Product</TableHead>}
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Unit Cost</TableHead>
                                            <TableHead className="text-right">Batch Value</TableHead>
                                            <TableHead>Expiry Date</TableHead>
                                            <TableHead>Received At</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created By</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchases.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={!productId ? 10 : 9}
                                                    className="text-center text-muted-foreground h-32"
                                                >
                                                    {searchTerm
                                                        ? `No purchase batches found matching "${searchTerm}"`
                                                        : `No purchase batches found`
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            purchases.map((purchase, index) => {
                                                const expiryStatus = getExpiryStatus(purchase.expiryDate)

                                                return (
                                                    <TableRow key={purchase.batchID}>
                                                        <TableCell className="font-medium text-center">
                                                            {getSerialNumber(index)}
                                                        </TableCell>

                                                        {!productId && (
                                                            <TableCell>
                                                                {purchase.product ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{purchase.product.name}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            SKU: {purchase.product.sku}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </TableCell>
                                                        )}

                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-medium">{purchase.quantity.toLocaleString()}</span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-medium">
                                                                    ৳{purchase.unitCost.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-bold">
                                                                    ৳{purchase.batchValue.toLocaleString('en-US', {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            {purchase.expiryDate ? (
                                                                <div className="flex flex-col">
                                                                    <span>{formatDate(purchase.expiryDate)}</span>
                                                                    {expiryStatus && (
                                                                        <span className={`text-xs ${expiryStatus.status === "expired" ? "text-destructive" :
                                                                            expiryStatus.status === "expiring" ? "text-orange-500" :
                                                                                "text-green-600"
                                                                            }`}>
                                                                            {expiryStatus.label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground">No expiry</span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span>{formatDateTime(purchase.receivedAt)}</span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            {expiryStatus ? (
                                                                <Badge variant={expiryStatus.variant}>
                                                                    {expiryStatus.label}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="default">Active</Badge>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            {purchase.createdBy && (
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{purchase.createdBy.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {purchase.createdBy.email}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex justify-center gap-1">
                                                                {onView && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => onView(purchase)}
                                                                        disabled={isDeleting || isLoading}
                                                                        className="h-8 w-8 p-0"
                                                                        title="View Details"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                {onEdit && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => onEdit(purchase)}
                                                                        disabled={isDeleting || isLoading}
                                                                        className="h-8 w-8 p-0"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(purchase.batchID)}
                                                                    disabled={isDeleting || isLoading}
                                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                    title="Delete"
                                                                >
                                                                    {isDeleting ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
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
                                                <span className="sr-only">Previous</span>
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
                                                <span className="sr-only">Next</span>
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
    )
}
