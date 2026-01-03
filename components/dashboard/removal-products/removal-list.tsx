"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Edit,
    Trash2,
    Package,
    AlertTriangle,
    DollarSign,
    TrendingDown,
    Loader2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Filter,
    Download,
} from "lucide-react";
import { useDelete } from "@/hooks/useDelete";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { RemovalReason, RemovalFilters } from "@/types/removal";
import { useRemovals } from "@/hooks/use-removals";
import { RemovalFilterDialog } from "./removal-filter-dialog";

interface RemovalListProps {
    onEdit?: (item: any) => void;
    onView?: (item: any) => void;
    refresh?: number;
}

export function RemovalList({ onEdit, onView, refresh }: RemovalListProps) {
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null
    );
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filters, setFilters] = useState<Partial<RemovalFilters>>({});
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    // In removal-list.tsx, replace the hook usage:
    const {
        removals,
        meta,
        isLoading,
        refetch,
        setSearchTerm,
        searchTerm,
        itemsPerPage,
        setItemsPerPage,
        currentPage,
        setCurrentPage,
    } = useRemovals({
        filters,
    });

    console.log("removals", removals);


    // Delete mutation
    const { mutate: deleteRemoval, isPending: isDeleting } = useDelete(
        "/removals",
        ["removals", currentPage, itemsPerPage, debouncedSearch, filters],
        {
            successMessage: "Removal record deleted successfully!",
            errorMessage: "Failed to delete removal record",
            onSuccess: () => {
                refetch();
            },
        }
    );

    // Debounce search input
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);

        setSearchTimeout(timeout);

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTerm]);

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        const newLimit = parseInt(value);
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Handle delete
    const handleDelete = (id: number) => {
        if (
            !confirm(
                "Are you sure you want to delete this removal record? This will restore stock."
            )
        )
            return;
        deleteRemoval(id);
    };

    // Calculate serial number
    const getSerialNumber = (index: number) => {
        return (currentPage - 1) * itemsPerPage + index + 1;
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return `৳${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    // Get reason badge color
    const getReasonColor = (reason: RemovalReason) => {
        const colors: Record<RemovalReason, string> = {
            [RemovalReason.EXPIRED]: "destructive",
            [RemovalReason.DAMAGED]: "destructive",
            [RemovalReason.BROKEN]: "destructive",
            [RemovalReason.DEFECTIVE]: "destructive",
            [RemovalReason.STOLEN]: "secondary",
            [RemovalReason.LOST]: "secondary",
            [RemovalReason.SAMPLE]: "default",
            [RemovalReason.QUALITY_ISSUE]: "outline",
            [RemovalReason.RECALL]: "secondary",
            [RemovalReason.WASTE]: "outline",
            [RemovalReason.DONATION]: "default",
            [RemovalReason.EMPLOYEE_USE]: "default",
            [RemovalReason.TESTING]: "outline",
            [RemovalReason.DEMONSTRATION]: "outline",
            [RemovalReason.SHOWROOM_DISPLAY]: "outline",
            [RemovalReason.PROMOTIONAL]: "default",
            [RemovalReason.MANUFACTURER_DEFECT]: "secondary",
            [RemovalReason.SHIPPING_DAMAGE]: "destructive",
            [RemovalReason.STORAGE_DAMAGE]: "destructive",
            [RemovalReason.NATURAL_DISASTER]: "secondary",
            [RemovalReason.OTHER]: "outline",
        };
        return colors[reason] || "outline";
    };

    // Export to CSV
    const handleExportCSV = async () => {
        try {
            const res = await fetch("/api/removals/export/csv");
            if (!res.ok) throw new Error("Failed to export");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `product_removals_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Export started successfully");
        } catch (error) {
            toast.error("Failed to export data");
        }
    };

    // Check if filters are active
    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Removals</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{meta?.totalItems || 0}</div>
                        <p className="text-xs text-muted-foreground">Records in system</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
                        <DollarSign className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {formatCurrency(
                                removals.reduce((sum, r) => sum + (r.totalLoss || 0), 0)
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Estimated total loss</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quantity Removed</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {removals.reduce((sum, r) => sum + r.quantity, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Units removed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {formatCurrency(
                                removals.length > 0
                                    ? removals.reduce((sum, r) => sum + (r.totalLoss || 0), 0) /
                                    removals.length
                                    : 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Per removal</p>
                    </CardContent>
                </Card>
            </div>

            {/* Removals Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Product Removals</CardTitle>
                                <CardDescription>Manage removed/defective inventory</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleExportCSV}
                                    disabled={isLoading}
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                                {/* <Button
                                    variant={hasActiveFilters ? "default" : "outline"}
                                    onClick={() => setShowFilterDialog(true)}
                                    className="gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filter
                                    {hasActiveFilters && (
                                        <Badge variant="secondary" className="ml-1">
                                            {Object.keys(filters).length}
                                        </Badge>
                                    )}
                                </Button> */}
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search removals..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                                <span className="text-sm font-medium">Active filters:</span>
                                {filters.startDate && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Calendar className="h-3 w-3" />
                                        From: {formatDate(filters.startDate.toISOString())}
                                    </Badge>
                                )}
                                {filters.endDate && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Calendar className="h-3 w-3" />
                                        To: {formatDate(filters.endDate.toISOString())}
                                    </Badge>
                                )}
                                {filters.reason && (
                                    <Badge variant="secondary">
                                        Reason: {filters.reason}
                                    </Badge>
                                )}
                                {filters.productId && (
                                    <Badge variant="secondary">
                                        Product ID: {filters.productId}
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilters({})}
                                    className="h-6 text-xs"
                                >
                                    Clear all
                                </Button>
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
                                    Search results for: "
                                    <span className="font-medium">{searchTerm}</span>"
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {isLoading && removals.length === 0 ? (
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
                                            <TableHead>Product</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Loss</TableHead>
                                            <TableHead>Batch</TableHead>
                                            <TableHead>Removed By</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {removals.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={9}
                                                    className="text-center text-muted-foreground h-32"
                                                >
                                                    {searchTerm || hasActiveFilters
                                                        ? "No removal records found matching your criteria"
                                                        : "No removal records found"}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            removals.map((removal, index) => (
                                                <TableRow key={removal.removalID}>
                                                    <TableCell className="font-medium text-center">
                                                        {getSerialNumber(index)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {removal.product?.name || "Unknown Product"}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                SKU: {removal.product?.sku || "N/A"} | Stock:{" "}
                                                                {removal.product?.stockQuantity || 0}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getReasonColor(removal.reason)}>
                                                            {removal.reason.replace("_", " ")}
                                                        </Badge>
                                                        {removal.damageDescription && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {removal.damageDescription.substring(0, 50)}
                                                                {removal.damageDescription.length > 50 && "..."}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium">
                                                                {removal.quantity}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {removal.product?.unit || "units"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-medium text-destructive">
                                                                {formatCurrency(removal.totalLoss)}
                                                            </span>
                                                            {removal.estimatedLoss && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    Est: {formatCurrency(removal.estimatedLoss)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {removal.batchId ? (
                                                            <Badge variant="outline">
                                                                Batch #{removal.batchId}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">
                                                                Multiple
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {removal.removedBy ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">
                                                                    {removal.removedBy.name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {removal.removedBy.email}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">
                                                                System
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">
                                                                {formatDate(removal.createdAt)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(removal.createdAt).toLocaleTimeString(
                                                                    "en-US",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-1">
                                                            {onView && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => onView(removal)}
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
                                                                    onClick={() => onEdit(removal)}
                                                                    disabled={isDeleting || isLoading}
                                                                    className="h-8 w-8 p-0"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {/* <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(removal.removalID)}
                                                                disabled={isDeleting || isLoading}
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                title="Delete (Restore Stock)"
                                                            >
                                                                {isDeleting ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </Button> */}
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
                                                {Array.from(
                                                    { length: Math.min(5, meta.totalPages) },
                                                    (_, i) => {
                                                        let pageNum;
                                                        if (meta.totalPages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (currentPage <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (currentPage >= meta.totalPages - 2) {
                                                            pageNum = meta.totalPages - 4 + i;
                                                        } else {
                                                            pageNum = currentPage - 2 + i;
                                                        }

                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={
                                                                    currentPage === pageNum ? "default" : "outline"
                                                                }
                                                                size="sm"
                                                                onClick={() => handlePageChange(pageNum)}
                                                                disabled={isLoading}
                                                                className="w-8 h-8 p-0"
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        );
                                                    }
                                                )}
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

            {/* Filter Dialog */}
            <RemovalFilterDialog
                open={showFilterDialog}
                onOpenChange={setShowFilterDialog}
                filters={filters}
                onFiltersChange={setFilters}
            />
        </div>
    );
}