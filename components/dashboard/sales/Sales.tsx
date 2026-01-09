"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, DollarSign, ShoppingBag, Package, TrendingUp, Loader2, ChevronLeft, ChevronRight, User, Calendar, Percent, Tag, X, Download, FileText } from "lucide-react"
import { useGetAll } from "@/hooks/useGet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/units"
import { SalesDetails } from "./sales-details"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { exportSalesToCSV, exportSalesToPDF } from "@/lib/exportUtils"


import { ArrowLeftRight, RefreshCw } from "lucide-react"
import { ReturnsManagement } from "./return-exchange/returns-management"
import { ReturnModal } from "./return-exchange/return-modal"

interface SalesListProps {
    onView?: (item: any) => void
    refresh?: number
}

interface Sale {
    sellID: number
    sellSid: string
    invoiceNumber: string
    customerName: string
    customerPhone: string
    subtotal: number
    discount: number
    tax: number
    taxRate: number
    total: number
    paymentMethod: string
    paymentStatus: string
    notes: string
    createdAt: string
    updatedAt: string
    createdBy: {
        userID: number
        name: string
        email: string
    }
    sellItems: Array<{
        sellItemID: number
        sellItemSid: string
        productID: number
        quantity: number
        unitPrice: number
        subtotal: number
        productName: string
        productSku: string
    }>
}

interface StatisticsData {
    period: string
    startDate: string
    endDate: string
    totalSales: number
    totalRevenue: number
    totalItems: number
    totalDiscount: number
    totalTax: number
    averageSaleValue: number
}

interface UseSalesReturn {
    sales: Sale[]
    statistics: StatisticsData | null
    meta: {
        totalItems: number
        itemCount: number
        itemsPerPage: number
        totalPages: number
        currentPage: number
    }
    isLoading: boolean
    searchTerm: string
    currentPage: number
    itemsPerPage: number
    period: string
    setItemsPerPage: (count: number) => void
    setSearchTerm: (term: string) => void
    setCurrentPage: (page: number) => void
    setPeriod: (period: string) => void
    refetch: () => void
}

//use 
export const useSales = (): UseSalesReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [period, setPeriod] = useState("today")

    // Build query parameters for pagination and search
    const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
    }).toString()

    // Fetch sales data
    const { data: salesData, isLoading: isSalesLoading, refetch: refetchSales } = useGetAll<any>(
        `/sales?${queryParams}`,
        ["sales", currentPage, searchTerm, itemsPerPage]
    )

    // Fetch statistics data
    const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useGetAll<any>(
        `/sales/statistics?period=${period}`,
        ["sales-statistics", period]
    )

    const salesList = salesData?.data || []
    const meta = salesData?.meta || {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    }

    const statistics = statsData?.data || null

    const refetch = () => {
        refetchSales()
        refetchStats()
    }

    const isLoading = isSalesLoading || isStatsLoading

    return {
        sales: salesList,
        statistics,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        itemsPerPage,
        period,
        setItemsPerPage,
        setSearchTerm,
        setCurrentPage,
        setPeriod,
        refetch
    }
}

export default function Sales({ onView, refresh }: SalesListProps) {
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
    const [selectedSaleForReturn, setSelectedSaleForReturn] = useState<any>(null)
    const [showReturnsTab, setShowReturnsTab] = useState(false)


    const {
        sales: salesData,
        statistics,
        meta,
        isLoading,
        refetch,
        setSearchTerm,
        searchTerm,
        itemsPerPage,
        setItemsPerPage,
        currentPage,
        setCurrentPage,
        period,
        setPeriod
    } = useSales()

    // Period options
    const periodOptions = [
        { value: "today", label: "Today" },
        { value: "yesterday", label: "Yesterday" },
        { value: "last7days", label: "Last 7 Days" },
        { value: "last30days", label: "Last 30 Days" },
        { value: "thismonth", label: "This Month" },
        { value: "lastmonth", label: "Last Month" },
        { value: "thisquarter", label: "This Quarter" },
        { value: "lastquarter", label: "Last Quarter" },
        { value: "thisyear", label: "This Year" },
        { value: "lastyear", label: "Last Year" },
        { value: "custom", label: "Custom" }
    ]

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

    // Handle period change
    const handlePeriodChange = (value: string) => {
        setPeriod(value)
    }

    // Handle view sale
    const handleViewSale = (sale: Sale) => {
        setSelectedSale(sale)
        setIsViewModalOpen(true)
        // Call the onView prop if provided
        if (onView) {
            onView(sale)
        }
    }

    // Calculate serial number based on page and index
    const getSerialNumber = (index: number) => {
        return (currentPage - 1) * itemsPerPage + index + 1
    }

    // Format payment method badge
    const formatPaymentMethod = (method: string) => {
        const variants: Record<string, "default" | "secondary" | "outline"> = {
            'CASH': 'default',
            'CARD': 'secondary',
            'MOBILE_BANKING': 'outline',
            'BANK_TRANSFER': 'outline'
        }

        return (
            <Badge variant={variants[method] || "default"}>
                {method.replace('_', ' ')}
            </Badge>
        )
    }

    // Format payment status badge
    const formatPaymentStatus = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'COMPLETED': 'default',
            'PENDING': 'secondary',
            'FAILED': 'destructive',
            'REFUNDED': 'outline'
        }

        return (
            <Badge variant={variants[status] || "default"}>
                {status}
            </Badge>
        )
    }

    // Handle export to CSV
    const handleExportCSV = () => {
        if (salesData.length === 0) {
            return
        }

        // Format sales data for export
        const exportData = salesData.map(sale => ({
            ...sale,
            date: sale.createdAt,
            items: sale.sellItems,
            customerName: sale.customerName || "Walk-in Customer"
        }))

        exportSalesToCSV(exportData, "sales-report", statistics || undefined)
    }

    // Handle export to PDF
    const handleExportPDF = () => {
        if (salesData.length === 0) {
            return
        }

        // Format sales data for export
        const exportData = salesData.map(sale => ({
            ...sale,
            date: sale.createdAt,
            items: sale.sellItems,
            customerName: sale.customerName || "Walk-in Customer"
        }))

        exportSalesToPDF(exportData, "sales-report", statistics || undefined)
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>
                    <p className="text-muted-foreground mt-1">Track and analyze your sales performance</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleExportCSV} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="flex border-b">
                <Button
                    variant="ghost"
                    className={`rounded-none ${!showReturnsTab ? 'border-b-2 border-primary' : ''}`}
                    onClick={() => setShowReturnsTab(false)}
                >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Sales
                </Button>
                <Button
                    variant="ghost"
                    className={`rounded-none ${showReturnsTab ? 'border-b-2 border-primary' : ''}`}
                    onClick={() => setShowReturnsTab(true)}
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Returns
                </Button>
            </div>

            {showReturnsTab ? (
                <ReturnsManagement />
            ) : (<>

                { /* Statistics Cards */}
                {/* <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics?.totalSales || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {periodOptions.find(p => p.value === period)?.label || 'Today'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{statistics?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
                            <p className="text-xs text-muted-foreground">
                                Average: ৳{statistics?.averageSaleValue?.toFixed(2) || '0.00'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics?.totalItems || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Total items sold
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                            <Tag className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">৳{statistics?.totalDiscount?.toFixed(2) || '0.00'}</div>
                            <p className="text-xs text-muted-foreground">
                                Total tax: ৳{statistics?.totalTax?.toFixed(2) || '0.00'}
                            </p>
                        </CardContent>
                    </Card>
                </div> */}

                { /* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Sales Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics?.totalSales || 0}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    Returns: {statistics?.totalReturns || 0}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {statistics?.returnRate?.toFixed(1) || 0}% rate
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                ৳{statistics?.netRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </div>
                            <div className="space-y-1 mt-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Gross:</span>
                                    <span>৳{statistics?.grossRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Refunded:</span>
                                    <span className="text-red-500">-৳{statistics?.totalRefundedAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Items Sold</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics?.netItems || 0}</div>
                            <div className="space-y-1 mt-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Gross Items:</span>
                                    <span>{statistics?.grossItems || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Returned:</span>
                                    <span className="text-red-500">-{statistics?.returnedItems || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Performance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Avg. Sale:</span>
                                    <span className="font-semibold">৳{statistics?.averageNetSaleValue?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Items/Sale:</span>
                                    <span className="font-semibold">{statistics?.averageItemsPerSale?.toFixed(1) || '0'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Refund Rate:</span>
                                    <span className={`font-semibold ${(statistics?.refundRate || 0) > 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {statistics?.refundRate?.toFixed(1) || 0}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sales Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Sales History</CardTitle>
                                    <CardDescription>View and manage all sales transactions</CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Period Selector */}
                                    <div className="w-full sm:w-48">
                                        <Select
                                            value={period}
                                            onValueChange={handlePeriodChange}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {periodOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by invoice, customer..."
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
                        {isLoading && salesData.length === 0 ? (
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
                                                <TableHead>Invoice</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead className="text-right">Items</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead className="text-right">Discount</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                                <TableHead>Payment Method</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {salesData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={11} className="text-center text-muted-foreground h-32">
                                                        {searchTerm ? `No sales found matching "${searchTerm}"` : `No sales found`}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                salesData.map((sale, index) => (
                                                    <TableRow key={sale.sellID}>
                                                        <TableCell className="font-medium text-center">
                                                            {getSerialNumber(index)}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {sale.invoiceNumber}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{sale.customerName}</span>
                                                                {sale.customerPhone && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {sale.customerPhone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-medium">{sale.sellItems.length}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Qty: {sale.sellItems.reduce((sum, item) => sum + item.quantity, 0)}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-medium">৳{sale.subtotal.toFixed(2)}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Tax: ৳{sale.tax.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="font-medium text-emerald-600">৳{sale.discount.toFixed(2)}</span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="font-bold">৳{sale.total.toFixed(2)}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatPaymentMethod(sale.paymentMethod)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatPaymentStatus(sale.paymentStatus)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{formatDate(sale.createdAt)}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    By: {sale.createdBy.name}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleViewSale(sale)}
                                                                    disabled={isLoading}
                                                                    className="h-8 w-8 p-0"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setSelectedSaleForReturn(sale)
                                                                        setIsReturnModalOpen(true)
                                                                    }}
                                                                    disabled={isLoading || sale.paymentStatus === "VOIDED"}
                                                                    className="h-8 w-8 p-0"
                                                                    title="Create Return"
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>

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

                {/* Sale Details Modal */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Sale Details</DialogTitle>
                        </DialogHeader>
                        {selectedSale && (
                            <SalesDetails sale={selectedSale} />
                        )}
                    </DialogContent>
                </Dialog></>)}

            {selectedSaleForReturn && (
                <ReturnModal
                    sale={selectedSaleForReturn}
                    isOpen={isReturnModalOpen}
                    onClose={() => {
                        setIsReturnModalOpen(false)
                        setSelectedSaleForReturn(null)
                    }}
                    onSuccess={() => {
                        // Refresh sales data
                        refetch()
                    }}
                />
            )}
        </div>
    )
}
// "use client"

// import { useState, useEffect } from "react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Search, Eye, DollarSign, ShoppingBag, Package, TrendingUp, Loader2, ChevronLeft, ChevronRight, User, Calendar, Percent, Tag } from "lucide-react"
// import { useGetAll } from "@/hooks/useGet"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { formatDate } from "@/lib/units"


// interface SalesListProps {
//     onView?: (item: any) => void
//     refresh?: number
// }

// interface Sale {
//     sellID: number
//     sellSid: string
//     invoiceNumber: string
//     customerName: string
//     customerPhone: string
//     subtotal: number
//     discount: number
//     tax: number
//     taxRate: number
//     total: number
//     paymentMethod: string
//     paymentStatus: string
//     notes: string
//     createdAt: string
//     updatedAt: string
//     createdBy: {
//         userID: number
//         name: string
//         email: string
//     }
//     sellItems: Array<{
//         sellItemID: number
//         sellItemSid: string
//         productID: number
//         quantity: number
//         unitPrice: number
//         subtotal: number
//         productName: string
//         productSku: string
//     }>
// }

// interface StatisticsData {
//     period: string
//     startDate: string
//     endDate: string
//     totalSales: number
//     totalRevenue: number
//     totalItems: number
//     totalDiscount: number
//     totalTax: number
//     averageSaleValue: number
// }

// interface UseSalesReturn {
//     sales: Sale[]
//     statistics: StatisticsData | null
//     meta: {
//         totalItems: number
//         itemCount: number
//         itemsPerPage: number
//         totalPages: number
//         currentPage: number
//     }
//     isLoading: boolean
//     searchTerm: string
//     currentPage: number
//     itemsPerPage: number
//     period: string
//     setItemsPerPage: (count: number) => void
//     setSearchTerm: (term: string) => void
//     setCurrentPage: (page: number) => void
//     setPeriod: (period: string) => void
//     refetch: () => void
// }

// export const useSales = (): UseSalesReturn => {
//     const [currentPage, setCurrentPage] = useState(1)
//     const [searchTerm, setSearchTerm] = useState("")
//     const [itemsPerPage, setItemsPerPage] = useState(10)
//     const [period, setPeriod] = useState("today")

//     // Build query parameters for pagination and search
//     const queryParams = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: itemsPerPage.toString(),
//         ...(searchTerm && { search: searchTerm })
//     }).toString()

//     // Fetch sales data
//     const { data: salesData, isLoading: isSalesLoading, refetch: refetchSales } = useGetAll<any>(
//         `/sales?${queryParams}`,
//         ["sales", currentPage, searchTerm, itemsPerPage]
//     )

//     // Fetch statistics data
//     const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useGetAll<any>(
//         `/sales/statistics?period=${period}`,
//         ["sales-statistics", period]
//     )

//     const salesList = salesData?.data || []
//     const meta = salesData?.meta || {
//         currentPage: 1,
//         itemCount: 0,
//         itemsPerPage: 10,
//         totalItems: 0,
//         totalPages: 1
//     }

//     const statistics = statsData?.data || null

//     const refetch = () => {
//         refetchSales()
//         refetchStats()
//     }

//     const isLoading = isSalesLoading || isStatsLoading

//     return {
//         sales: salesList,
//         statistics,
//         meta,
//         isLoading,
//         searchTerm,
//         currentPage,
//         itemsPerPage,
//         period,
//         setItemsPerPage,
//         setSearchTerm,
//         setCurrentPage,
//         setPeriod,
//         refetch
//     }
// }

// export default function Sales({ onView, refresh }: SalesListProps) {
//     const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
//     const [debouncedSearch, setDebouncedSearch] = useState("")

//     const {
//         sales,
//         statistics,
//         meta,
//         isLoading,
//         refetch,
//         setSearchTerm,
//         searchTerm,
//         itemsPerPage,
//         setItemsPerPage,
//         currentPage,
//         setCurrentPage,
//         period,
//         setPeriod
//     } = useSales()

//     // Period options
//     const periodOptions = [
//         { value: "today", label: "Today" },
//         { value: "yesterday", label: "Yesterday" },
//         { value: "last7days", label: "Last 7 Days" },
//         { value: "last30days", label: "Last 30 Days" },
//         { value: "thismonth", label: "This Month" },
//         { value: "lastmonth", label: "Last Month" },
//         { value: "thisquarter", label: "This Quarter" },
//         { value: "lastquarter", label: "Last Quarter" },
//         { value: "thisyear", label: "This Year" },
//         { value: "lastyear", label: "Last Year" },
//         { value: "custom", label: "Custom" }
//     ]

//     // Debounce search input
//     useEffect(() => {
//         if (searchTimeout) {
//             clearTimeout(searchTimeout)
//         }

//         const timeout = setTimeout(() => {
//             setDebouncedSearch(searchTerm)
//             setCurrentPage(1) // Reset to first page when searching
//         }, 500)

//         setSearchTimeout(timeout)

//         return () => {
//             if (searchTimeout) {
//                 clearTimeout(searchTimeout)
//             }
//         }
//     }, [searchTerm])

//     // Handle items per page change
//     const handleItemsPerPageChange = (value: string) => {
//         const newLimit = parseInt(value)
//         setItemsPerPage(newLimit)
//         setCurrentPage(1)
//     }

//     // Handle page change
//     const handlePageChange = (page: number) => {
//         setCurrentPage(page)
//     }

//     // Handle search
//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchTerm(e.target.value)
//     }

//     // Handle search on Enter key
//     const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === 'Enter') {
//             e.currentTarget.blur()
//         }
//     }

//     // Handle period change
//     const handlePeriodChange = (value: string) => {
//         setPeriod(value)
//     }

//     // Calculate serial number based on page and index
//     const getSerialNumber = (index: number) => {
//         return (currentPage - 1) * itemsPerPage + index + 1
//     }


//     // Format payment method badge
//     const formatPaymentMethod = (method: string) => {
//         const variants: Record<string, "default" | "secondary" | "outline"> = {
//             'CASH': 'default',
//             'CARD': 'secondary',
//             'MOBILE_BANKING': 'outline',
//             'BANK_TRANSFER': 'outline'
//         }

//         return (
//             <Badge variant={variants[method] || "default"}>
//                 {method.replace('_', ' ')}
//             </Badge>
//         )
//     }

//     // Format payment status badge
//     const formatPaymentStatus = (status: string) => {
//         const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
//             'COMPLETED': 'default',
//             'PENDING': 'secondary',
//             'FAILED': 'destructive',
//             'REFUNDED': 'outline'
//         }

//         return (
//             <Badge variant={variants[status] || "default"}>
//                 {status}
//             </Badge>
//         )
//     }

//     return (
//         <div className="p-6 space-y-6">
//             {/* Statistics Cards */}
//             <div className="grid gap-4 md:grid-cols-4">
//                 <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
//                         <ShoppingBag className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{statistics?.totalSales || 0}</div>
//                         <p className="text-xs text-muted-foreground">
//                             {periodOptions.find(p => p.value === period)?.label || 'Today'}
//                         </p>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                         <DollarSign className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">৳{statistics?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
//                         <p className="text-xs text-muted-foreground">
//                             Average: ৳{statistics?.averageSaleValue?.toFixed(2) || '0.00'}
//                         </p>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
//                         <Package className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{statistics?.totalItems || 0}</div>
//                         <p className="text-xs text-muted-foreground">
//                             Total items sold
//                         </p>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
//                         <Tag className="h-4 w-4 text-emerald-500" />
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold text-emerald-600">৳{statistics?.totalDiscount?.toFixed(2) || '0.00'}</div>
//                         <p className="text-xs text-muted-foreground">
//                             Total tax: ৳{statistics?.totalTax?.toFixed(2) || '0.00'}
//                         </p>
//                     </CardContent>
//                 </Card>
//             </div>

//             {/* Sales Table */}
//             <Card>
//                 <CardHeader>
//                     <div className="flex flex-col space-y-4">
//                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                             <div>
//                                 <CardTitle>Sales History</CardTitle>
//                                 <CardDescription>View and manage all sales transactions</CardDescription>
//                             </div>
//                             <div className="flex flex-col sm:flex-row gap-4">
//                                 {/* Period Selector */}
//                                 <div className="w-full sm:w-48">
//                                     <Select
//                                         value={period}
//                                         onValueChange={handlePeriodChange}
//                                         disabled={isLoading}
//                                     >
//                                         <SelectTrigger>
//                                             <SelectValue placeholder="Select period" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {periodOptions.map((option) => (
//                                                 <SelectItem key={option.value} value={option.value}>
//                                                     {option.label}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 {/* Search Input */}
//                                 <div className="relative w-full sm:w-72">
//                                     <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                                     <Input
//                                         placeholder="Search by invoice, customer..."
//                                         value={searchTerm}
//                                         onChange={handleSearchChange}
//                                         onKeyDown={handleSearchKeyDown}
//                                         className="pl-10"
//                                     />
//                                     {searchTerm && (
//                                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                                             <span className="text-xs text-muted-foreground">
//                                                 {isLoading ? "Searching..." : "Press Enter or wait"}
//                                             </span>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Items per page selector */}
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-2">
//                                 <span className="text-sm text-muted-foreground">Show:</span>
//                                 <Select
//                                     value={itemsPerPage.toString()}
//                                     onValueChange={handleItemsPerPageChange}
//                                     disabled={isLoading}
//                                 >
//                                     <SelectTrigger className="w-20">
//                                         <SelectValue placeholder="10" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="5">5</SelectItem>
//                                         <SelectItem value="10">10</SelectItem>
//                                         <SelectItem value="20">20</SelectItem>
//                                         <SelectItem value="50">50</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                                 <span className="text-sm text-muted-foreground">per page</span>
//                             </div>
//                             {searchTerm && (
//                                 <div className="text-sm text-muted-foreground">
//                                     Search results for: "<span className="font-medium">{searchTerm}</span>"
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </CardHeader>

//                 <CardContent>
//                     {isLoading && sales.length === 0 ? (
//                         <div className="flex justify-center items-center h-64">
//                             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//                         </div>
//                     ) : (
//                         <>
//                             <div className="rounded-md border mb-4">
//                                 <Table>
//                                     <TableHeader>
//                                         <TableRow>
//                                             <TableHead className="w-16 text-center">SL</TableHead>
//                                             <TableHead>Invoice</TableHead>
//                                             <TableHead>Customer</TableHead>
//                                             <TableHead className="text-right">Items</TableHead>
//                                             <TableHead className="text-right">Subtotal</TableHead>
//                                             <TableHead className="text-right">Discount</TableHead>
//                                             <TableHead className="text-right">Total</TableHead>
//                                             <TableHead>Payment Method</TableHead>
//                                             <TableHead>Status</TableHead>
//                                             <TableHead>Date</TableHead>
//                                             <TableHead className="text-center">Actions</TableHead>
//                                         </TableRow>
//                                     </TableHeader>
//                                     <TableBody>
//                                         {sales.length === 0 ? (
//                                             <TableRow>
//                                                 <TableCell colSpan={11} className="text-center text-muted-foreground h-32">
//                                                     {searchTerm ? `No sales found matching "${searchTerm}"` : `No sales found`}
//                                                 </TableCell>
//                                             </TableRow>
//                                         ) : (
//                                             sales.map((sale, index) => (
//                                                 <TableRow key={sale.sellID}>
//                                                     <TableCell className="font-medium text-center">
//                                                         {getSerialNumber(index)}
//                                                     </TableCell>
//                                                     <TableCell className="font-mono text-sm">
//                                                         {sale.invoiceNumber}
//                                                     </TableCell>
//                                                     <TableCell className="font-medium">
//                                                         <div className="flex flex-col">
//                                                             <span>{sale.customerName}</span>
//                                                             {sale.customerPhone && (
//                                                                 <span className="text-xs text-muted-foreground">
//                                                                     {sale.customerPhone}
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                     </TableCell>
//                                                     <TableCell className="text-right">
//                                                         <div className="flex flex-col items-end">
//                                                             <span className="font-medium">{sale.sellItems.length}</span>
//                                                             <span className="text-xs text-muted-foreground">
//                                                                 Qty: {sale.sellItems.reduce((sum, item) => sum + item.quantity, 0)}
//                                                             </span>
//                                                         </div>
//                                                     </TableCell>
//                                                     <TableCell className="text-right">
//                                                         <div className="flex flex-col items-end">
//                                                             <span className="font-medium">৳{sale.subtotal.toFixed(2)}</span>
//                                                             <span className="text-xs text-muted-foreground">
//                                                                 Tax: ৳{sale.tax.toFixed(2)}
//                                                             </span>
//                                                         </div>
//                                                     </TableCell>
//                                                     <TableCell className="text-right">
//                                                         <span className="font-medium text-emerald-600">৳{sale.discount.toFixed(2)}</span>
//                                                     </TableCell>
//                                                     <TableCell className="text-right">
//                                                         <span className="font-bold">৳{sale.total.toFixed(2)}</span>
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         {formatPaymentMethod(sale.paymentMethod)}
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         {formatPaymentStatus(sale.paymentStatus)}
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <div className="flex flex-col">
//                                                             <span className="text-sm">{formatDate(sale.createdAt)}</span>
//                                                             <span className="text-xs text-muted-foreground">
//                                                                 By: {sale.createdBy.name}
//                                                             </span>
//                                                         </div>
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <div className="flex justify-center">
//                                                             {onView && (
//                                                                 <Button
//                                                                     size="sm"
//                                                                     variant="ghost"
//                                                                     onClick={() => onView(sale)}
//                                                                     disabled={isLoading}
//                                                                     className="h-8 w-8 p-0"
//                                                                     title="View Details"
//                                                                 >
//                                                                     <Eye className="h-4 w-4" />
//                                                                 </Button>
//                                                             )}
//                                                         </div>
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ))
//                                         )}
//                                     </TableBody>
//                                 </Table>
//                             </div>

//                             {/* Pagination */}
//                             {meta && meta.totalPages > 0 && (
//                                 <div className="flex items-center justify-between">
//                                     <div className="text-sm text-muted-foreground">
//                                         Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
//                                         {Math.min(currentPage * itemsPerPage, meta.totalItems)} of{" "}
//                                         {meta.totalItems} entries
//                                     </div>

//                                     {meta.totalPages > 1 && (
//                                         <div className="flex items-center space-x-2">
//                                             <Button
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={() => handlePageChange(currentPage - 1)}
//                                                 disabled={currentPage === 1 || isLoading}
//                                             >
//                                                 <ChevronLeft className="h-4 w-4" />
//                                                 <span className="sr-only">Previous</span>
//                                             </Button>

//                                             {/* Page numbers */}
//                                             <div className="flex items-center space-x-1">
//                                                 {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
//                                                     let pageNum
//                                                     if (meta.totalPages <= 5) {
//                                                         pageNum = i + 1
//                                                     } else if (currentPage <= 3) {
//                                                         pageNum = i + 1
//                                                     } else if (currentPage >= meta.totalPages - 2) {
//                                                         pageNum = meta.totalPages - 4 + i
//                                                     } else {
//                                                         pageNum = currentPage - 2 + i
//                                                     }

//                                                     return (
//                                                         <Button
//                                                             key={pageNum}
//                                                             variant={currentPage === pageNum ? "default" : "outline"}
//                                                             size="sm"
//                                                             onClick={() => handlePageChange(pageNum)}
//                                                             disabled={isLoading}
//                                                             className="w-8 h-8 p-0"
//                                                         >
//                                                             {pageNum}
//                                                         </Button>
//                                                     )
//                                                 })}
//                                             </div>

//                                             <Button
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={() => handlePageChange(currentPage + 1)}
//                                                 disabled={currentPage === meta.totalPages || isLoading}
//                                             >
//                                                 <ChevronRight className="h-4 w-4" />
//                                                 <span className="sr-only">Next</span>
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     )
// }
// "use client"

// import { useState, useEffect, useMemo } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { saleStorage, productStorage, type Sale, type Product } from "@/lib/localStorage"
// import { getDateRange, formatDateRange } from "@/lib/dateUtils"
// import { exportSalesToCSV, exportSalesToPDF } from "@/lib/exportUtils"
// import {
//     Search,
//     Download,
//     FileText,
//     TrendingUp,
//     ShoppingCart,
//     Banknote,
//     Package,
//     Calendar,
//     Filter,
//     Eye,
//     X,
// } from "lucide-react"

// export default function Sales() {
//     const [sales, setSales] = useState<Sale[]>([])
//     const [products, setProducts] = useState<Product[]>([])
//     const [searchQuery, setSearchQuery] = useState("")
//     const [dateFilter, setDateFilter] = useState("today")
//     const [categoryFilter, setCategoryFilter] = useState("all")
//     const [brandFilter, setBrandFilter] = useState("all")
//     const [customStartDate, setCustomStartDate] = useState("")
//     const [customEndDate, setCustomEndDate] = useState("")
//     const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

//     useEffect(() => {
//         setSales(saleStorage.getAll())
//         setProducts(productStorage.getAll())
//     }, [])

//     // Filter sales based on all criteria
//     const filteredSales = useMemo(() => {
//         let filtered = sales

//         // Date filter
//         const { startDate, endDate } = getDateRange(
//             dateFilter,
//             customStartDate ? new Date(customStartDate) : undefined,
//             customEndDate ? new Date(customEndDate) : undefined,
//         )
//         filtered = filtered.filter((sale) => {
//             const saleDate = new Date(sale.createdAt)
//             return saleDate >= startDate && saleDate <= endDate
//         })

//         // Category filter
//         if (categoryFilter !== "all") {
//             filtered = filtered.filter((sale) =>
//                 sale.items.some((item) => {
//                     const product = products.find((p) => p.id === item.productId)
//                     return product?.category === categoryFilter
//                 }),
//             )
//         }

//         // Brand filter
//         if (brandFilter !== "all") {
//             filtered = filtered.filter((sale) =>
//                 sale.items.some((item) => {
//                     const product = products.find((p) => p.id === item.productId)
//                     return product?.brand === brandFilter
//                 }),
//             )
//         }

//         // Search filter
//         if (searchQuery) {
//             const query = searchQuery.toLowerCase()
//             filtered = filtered.filter(
//                 (sale) =>
//                     sale.invoiceNumber.toLowerCase().includes(query) ||
//                     sale.customerName?.toLowerCase().includes(query) ||
//                     sale.customerPhone?.includes(query),
//             )
//         }

//         return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//     }, [sales, products, dateFilter, categoryFilter, brandFilter, searchQuery, customStartDate, customEndDate])

//     // Calculate statistics
//     const statistics = useMemo(() => {
//         const totalSales = filteredSales.length
//         const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
//         const totalDiscount = filteredSales.reduce((sum, sale) => sum + sale.discount, 0)
//         const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax, 0)
//         const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items.reduce((s, i) => s + i.quantity, 0), 0)
//         const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

//         return {
//             totalSales,
//             totalRevenue,
//             totalDiscount,
//             totalTax,
//             totalItems,
//             avgSaleValue,
//         }
//     }, [filteredSales])

//     const handleExportCSV = () => {
//         exportSalesToCSV(filteredSales, "sales-report")
//     }

//     const handleExportPDF = () => {
//         exportSalesToPDF(filteredSales, "sales-report", statistics)
//     }

//     const clearFilters = () => {
//         setDateFilter("today")
//         setCategoryFilter("all")
//         setBrandFilter("all")
//         setSearchQuery("")
//         setCustomStartDate("")
//         setCustomEndDate("")
//     }

//     const hasActiveFilters = dateFilter !== "today" || categoryFilter !== "all" || brandFilter !== "all" || searchQuery

//     return (
//         <div>
//             <div className="p-6 space-y-6">
//                 {/* Header */}
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>
//                         <p className="text-muted-foreground mt-1">Track and analyze your sales performance</p>
//                     </div>
//                     <div className="flex gap-2">
//                         <Button onClick={handleExportCSV} variant="outline" size="sm">
//                             <Download className="h-4 w-4 mr-2" />
//                             Export CSV
//                         </Button>
//                         <Button onClick={handleExportPDF} variant="outline" size="sm">
//                             <FileText className="h-4 w-4 mr-2" />
//                             Export PDF
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Statistics Cards */}
//                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                     <Card>
//                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                             <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
//                             <ShoppingCart className="h-4 w-4 text-muted-foreground" />
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{statistics.totalSales}</div>
//                             <p className="text-xs text-muted-foreground mt-1">
//                                 {dateFilter === "today"
//                                     ? "Today"
//                                     : dateFilter === "custom"
//                                         ? formatDateRange(new Date(customStartDate), new Date(customEndDate))
//                                         : dateFilter.replace(/([A-Z])/g, " $1").trim()}
//                             </p>
//                         </CardContent>
//                     </Card>

//                     <Card>
//                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                             <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                             <Banknote className="h-4 w-4 text-muted-foreground" />
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">৳{statistics.totalRevenue.toFixed(2)}</div>
//                             <p className="text-xs text-muted-foreground mt-1">
//                                 Avg: ৳{statistics.avgSaleValue.toFixed(2)} per sale
//                             </p>
//                         </CardContent>
//                     </Card>

//                     <Card>
//                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                             <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
//                             <Package className="h-4 w-4 text-muted-foreground" />
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{statistics.totalItems}</div>
//                             <p className="text-xs text-muted-foreground mt-1">Total products quantity</p>
//                         </CardContent>
//                     </Card>

//                     <Card>
//                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                             <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
//                             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">৳{statistics.totalDiscount.toFixed(2)}</div>
//                             <p className="text-xs text-muted-foreground mt-1">Tax: ৳{statistics.totalTax.toFixed(2)}</p>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* Filters */}
//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center gap-2">
//                             <Filter className="h-5 w-5" />
//                             Filters
//                             {hasActiveFilters && (
//                                 <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-8 text-xs">
//                                     <X className="h-3 w-3 mr-1" />
//                                     Clear All
//                                 </Button>
//                             )}
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                             {/* Date Range Filter */}
//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">Date Range</label>
//                                 <Select value={dateFilter} onValueChange={setDateFilter}>
//                                     <SelectTrigger>
//                                         <Calendar className="h-4 w-4 mr-2" />
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="today">Today</SelectItem>
//                                         <SelectItem value="yesterday">Yesterday</SelectItem>
//                                         <SelectItem value="last7days">Last 7 Days</SelectItem>
//                                         <SelectItem value="last30days">Last 30 Days</SelectItem>
//                                         <SelectItem value="thisMonth">This Month</SelectItem>
//                                         <SelectItem value="lastMonth">Last Month</SelectItem>
//                                         <SelectItem value="thisQuarter">This Quarter</SelectItem>
//                                         <SelectItem value="lastQuarter">Last Quarter</SelectItem>
//                                         <SelectItem value="thisYear">This Year</SelectItem>
//                                         <SelectItem value="lastYear">Last Year</SelectItem>
//                                         <SelectItem value="custom">Custom Range</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             {/* Search */}
//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">Search</label>
//                                 <div className="relative">
//                                     <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                                     <Input
//                                         placeholder="Invoice, customer..."
//                                         value={searchQuery}
//                                         onChange={(e) => setSearchQuery(e.target.value)}
//                                         className="pl-9"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Custom Date Range */}
//                         {dateFilter === "custom" && (
//                             <div className="grid gap-4 md:grid-cols-2 mt-4">
//                                 <div className="space-y-2">
//                                     <label className="text-sm font-medium">Start Date</label>
//                                     <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <label className="text-sm font-medium">End Date</label>
//                                     <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
//                                 </div>
//                             </div>
//                         )}
//                     </CardContent>
//                 </Card>

//                 {/* Sales Table */}
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Sales History ({filteredSales.length})</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="overflow-x-auto">
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow>
//                                         <TableHead>Invoice</TableHead>
//                                         <TableHead>Date & Time</TableHead>
//                                         <TableHead>Customer</TableHead>
//                                         <TableHead>Items</TableHead>
//                                         <TableHead>Subtotal</TableHead>
//                                         <TableHead>Discount</TableHead>
//                                         <TableHead>Tax</TableHead>
//                                         <TableHead>Total</TableHead>
//                                         <TableHead>Payment</TableHead>
//                                         <TableHead className="text-right">Actions</TableHead>
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {filteredSales.length === 0 ? (
//                                         <TableRow>
//                                             <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
//                                                 No sales found for the selected filters
//                                             </TableCell>
//                                         </TableRow>
//                                     ) : (
//                                         filteredSales.map((sale) => (
//                                             <TableRow key={sale.id}>
//                                                 <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
//                                                 <TableCell>
//                                                     <div className="text-sm">
//                                                         <div>{new Date(sale.createdAt).toLocaleDateString()}</div>
//                                                         <div className="text-muted-foreground">
//                                                             {new Date(sale.createdAt).toLocaleTimeString()}
//                                                         </div>
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <div className="text-sm">
//                                                         <div>{sale.customerName || "Walk-in Customer"}</div>
//                                                         {sale.customerPhone && (
//                                                             <div className="text-muted-foreground">{sale.customerPhone}</div>
//                                                         )}
//                                                     </div>
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <Badge variant="secondary">{sale.items.length} items</Badge>
//                                                 </TableCell>
//                                                 <TableCell>৳{sale.subtotal.toFixed(2)}</TableCell>
//                                                 <TableCell>৳{sale.discount.toFixed(2)}</TableCell>
//                                                 <TableCell>৳{sale.tax.toFixed(2)}</TableCell>
//                                                 <TableCell className="font-semibold">৳{sale.total.toFixed(2)}</TableCell>
//                                                 <TableCell>
//                                                     <Badge
//                                                         variant={
//                                                             sale.paymentMethod === "cash"
//                                                                 ? "default"
//                                                                 : sale.paymentMethod === "card"
//                                                                     ? "secondary"
//                                                                     : "outline"
//                                                         }
//                                                     >
//                                                         {sale.paymentMethod}
//                                                     </Badge>
//                                                 </TableCell>
//                                                 <TableCell className="text-right">
//                                                     <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
//                                                         <Eye className="h-4 w-4" />
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//             {/* Sale Details Modal */}
//             {selectedSale && (
//                 <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
//                     <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                         <CardHeader>
//                             <div className="flex items-center justify-between">
//                                 <CardTitle>Sale Details</CardTitle>
//                                 <Button variant="ghost" size="sm" onClick={() => setSelectedSale(null)}>
//                                     <X className="h-4 w-4" />
//                                 </Button>
//                             </div>
//                         </CardHeader>
//                         <CardContent className="space-y-6">
//                             {/* Invoice Info */}
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <p className="text-sm text-muted-foreground">Invoice Number</p>
//                                     <p className="font-semibold">{selectedSale.invoiceNumber}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-muted-foreground">Date & Time</p>
//                                     <p className="font-semibold">{new Date(selectedSale.createdAt).toLocaleString()}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-muted-foreground">Customer Name</p>
//                                     <p className="font-semibold">{selectedSale.customerName || "Walk-in"}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-muted-foreground">Customer Phone</p>
//                                     <p className="font-semibold">{selectedSale.customerPhone || "-"}</p>
//                                 </div>
//                             </div>

//                             {/* Items */}
//                             <div>
//                                 <h3 className="font-semibold mb-3">Items Purchased</h3>
//                                 <Table>
//                                     <TableHeader>
//                                         <TableRow>
//                                             <TableHead>Product</TableHead>
//                                             <TableHead>SKU</TableHead>
//                                             <TableHead>Qty</TableHead>
//                                             <TableHead>Price</TableHead>
//                                             <TableHead className="text-right">Subtotal</TableHead>
//                                         </TableRow>
//                                     </TableHeader>
//                                     <TableBody>
//                                         {selectedSale.items.map((item, idx) => (
//                                             <TableRow key={idx}>
//                                                 <TableCell>{item.productName}</TableCell>
//                                                 <TableCell className="text-muted-foreground">{item.sku}</TableCell>
//                                                 <TableCell>{item.quantity}</TableCell>
//                                                 <TableCell>৳{item.unitPrice.toFixed(2)}</TableCell>
//                                                 <TableCell className="text-right">৳{item.subtotal.toFixed(2)}</TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </div>

//                             {/* Payment Summary */}
//                             <div className="border-t pt-4 space-y-2">
//                                 <div className="flex justify-between">
//                                     <span className="text-muted-foreground">Subtotal</span>
//                                     <span>৳{selectedSale.subtotal.toFixed(2)}</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-muted-foreground">Discount</span>
//                                     <span>-৳{selectedSale.discount.toFixed(2)}</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-muted-foreground">Tax</span>
//                                     <span>৳{selectedSale.tax.toFixed(2)}</span>
//                                 </div>
//                                 <div className="flex justify-between text-lg font-bold border-t pt-2">
//                                     <span>Total</span>
//                                     <span>৳{selectedSale.total.toFixed(2)}</span>
//                                 </div>
//                                 <div className="flex justify-between pt-2 border-t">
//                                     <span className="text-muted-foreground">Payment Method</span>
//                                     <Badge>{selectedSale.paymentMethod}</Badge>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-muted-foreground">Amount Received</span>
//                                     <span>৳{selectedSale.receivedAmount.toFixed(2)}</span>
//                                 </div>
//                                 {selectedSale.changeAmount > 0 && (
//                                     <div className="flex justify-between">
//                                         <span className="text-muted-foreground">Change</span>
//                                         <span>৳{selectedSale.changeAmount.toFixed(2)}</span>
//                                     </div>
//                                 )}
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             )}
//         </div>
//     )
// }
