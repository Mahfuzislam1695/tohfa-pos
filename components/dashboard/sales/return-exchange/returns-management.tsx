"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Download, Eye, FileText, Filter, Loader2, RefreshCw, Search, X } from "lucide-react"
import { ReturnStatus, ReturnType, ProductReturn } from "@/types/return.types"
import { formatDate } from "@/lib/units"
import { ReturnDetails } from "./return-details"
import { useGetAll } from "@/hooks/useGet"
// import { exportReturnsToCSV } from "@/lib/exportUtils"

interface ReturnsManagementProps {
    saleId?: number
    showCreateButton?: boolean
}

export function ReturnsManagement({ saleId, showCreateButton = true }: ReturnsManagementProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedReturn, setSelectedReturn] = useState<ProductReturn | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [filters, setFilters] = useState({
        status: "all",
        returnType: "all",
        search: "",
        startDate: "",
        endDate: "",
    })

    const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
    }).toString()

    // Fetch sales data
    const { data: returnsData1, isLoading: isReturnsLoading, refetch: refetchReturns } = useGetAll<any>(
        `/returns?${queryParams}`,
        ["allReturns", currentPage, searchTerm, itemsPerPage]
    )

    const returnsData: ProductReturn[] = returnsData1?.data || [];


    console.log("returnData", returnsData);


    // const handleExportCSV = () => {
    //     if (returns.length === 0) return
    //     exportReturnsToCSV(returns, "returns-report")
    // }

    const handleClearFilters = () => {
        setFilters({
            status: "all",
            returnType: "all",
            search: "",
            startDate: "",
            endDate: "",
        })
    }

    const getStatusBadge = (status: ReturnStatus) => {
        const variants = {
            [ReturnStatus.PENDING]: "secondary",
            [ReturnStatus.APPROVED]: "default",
            [ReturnStatus.COMPLETED]: "default",
            [ReturnStatus.REJECTED]: "destructive",
            [ReturnStatus.CANCELLED]: "outline",
        }

        const colors = {
            [ReturnStatus.PENDING]: "text-yellow-600 bg-yellow-100 border-yellow-200",
            [ReturnStatus.APPROVED]: "text-blue-600 bg-blue-100 border-blue-200",
            [ReturnStatus.COMPLETED]: "text-emerald-600 bg-emerald-100 border-emerald-200",
            [ReturnStatus.REJECTED]: "text-red-600 bg-red-100 border-red-200",
            [ReturnStatus.CANCELLED]: "text-gray-600 bg-gray-100 border-gray-200",
        }

        return (
            <Badge variant={variants[status] as any} className={colors[status]}>
                {status}
            </Badge>
        )
    }

    const getTypeBadge = (type: ReturnType) => {
        const variants = {
            [ReturnType.FULL_RETURN]: "default",
            [ReturnType.PARTIAL_RETURN]: "secondary",
            [ReturnType.EXCHANGE]: "outline",
        }

        const icons = {
            [ReturnType.FULL_RETURN]: "🔄",
            [ReturnType.PARTIAL_RETURN]: "📦",
            [ReturnType.EXCHANGE]: "🔄",
        }

        return (
            <Badge variant={variants[type] as any}>
                {icons[type]} {type.replace('_', ' ')}
            </Badge>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Returns Management</h2>
                    <p className="text-muted-foreground">Manage product returns and exchanges</p>
                </div>
                <div className="flex gap-2">
                    {/* <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button> */}
                    {/* <Button variant="outline" size="sm" onClick={fetchReturns}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button> */}
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                        {(filters.status !== "all" || filters.search || filters.startDate) && (
                            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto">
                                <X className="h-3 w-3 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters({ ...filters, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {Object.values(ReturnStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Type</Label>
                            <Select
                                value={filters.returnType}
                                onValueChange={(value) => setFilters({ ...filters, returnType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.values(ReturnType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Start Date</Label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">End Date</Label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by return number, customer, invoice..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Returns Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Returns History</CardTitle>
                    <CardDescription>
                        Showing {returnsData?.length} returns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isReturnsLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : returnsData?.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No returns found</p>
                            <p className="text-sm mt-1">Try changing your filters or create a new return</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Return #</TableHead>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {returnsData?.map((ret) => (
                                        <TableRow key={ret.returnID}>
                                            <TableCell className="font-medium">
                                                <div className="font-mono">{ret.returnNumber}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{ret.sell.invoiceNumber}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDate(ret.sell.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{ret.customerName}</div>
                                                {ret.customerPhone && (
                                                    <div className="text-xs text-muted-foreground">{ret.customerPhone}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>{getTypeBadge(ret.returnType)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {ret.returnItems.length} items
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold">
                                                    ৳{ret.refundAmount?.toFixed(2) || "0.00"}
                                                </div>
                                                {ret.exchangeForProduct && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Exchange: {ret.exchangeForProduct.name}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(ret.status)}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{formatDate(ret.createdAt)}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedReturn(ret)
                                                        setIsDetailsOpen(true)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Return Details Dialog */}
            {selectedReturn && (
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Return Details</DialogTitle>
                        </DialogHeader>
                        <ReturnDetails returnData={selectedReturn} />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

// Add missing Label component
const Label = ({ children, className, ...props }: any) => (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
        {children}
    </label>
)