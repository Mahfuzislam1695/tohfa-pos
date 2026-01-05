"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, Eye, Download, Filter, ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react"
import { useExpenses } from "@/hooks/use-expenses"
import { useDelete } from "@/hooks/useDelete"
import { ExpenseCategory, ExpensePaymentMethod } from "@/types/expense"
import { toast } from "react-toastify"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/lib/units"
import { ExpenseDetails } from "./expense-details"

interface ExpenseListProps {
    onEdit?: (expense: any) => void
    refresh?: number
}

export function ExpenseList({ onEdit, refresh }: ExpenseListProps) {
    const {
        expenses,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        itemsPerPage,
        startDate,
        endDate,
        category,
        paymentMethod,
        minAmount,
        maxAmount,
        sortOrder,
        setSearchTerm,
        setCurrentPage,
        setItemsPerPage,
        setStartDate,
        setEndDate,
        setCategory,
        setPaymentMethod,
        setMinAmount,
        setMaxAmount,
        setSortOrder,
        refetch
    } = useExpenses()


    const [viewingExpense, setViewingExpense] = useState<any>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Delete mutation
    const { mutate: deleteExpense, isPending: isDeleting } = useDelete(
        "/expenses",
        ["expenses"],
        {
            successMessage: "Expense deleted successfully!",
            errorMessage: "Failed to delete expense",
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
            setCurrentPage(1)
            setDebouncedSearch(searchTerm)
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

    // Handle delete
    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this expense?")) return
        deleteExpense(id)
    }

    // Clear filters
    const clearFilters = () => {
        setSearchTerm("")
        setStartDate("")
        setEndDate("")
        setCategory('all')
        setPaymentMethod('all')
        setMinAmount("")
        setMaxAmount("")
        setSortOrder("date,desc")
        setCurrentPage(1)
    }

    // Calculate statistics
    const statistics = {
        totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        expenseCount: expenses.length,
        avgExpense: expenses.length > 0 ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length : 0,
        highestExpense: expenses.length > 0 ? Math.max(...expenses.map(exp => exp.amount)) : 0,
        categoryBreakdown: Object.values(ExpenseCategory).map(cat => {
            const catExpenses = expenses.filter(exp => exp.category === cat)
            return {
                category: cat,
                total: catExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                count: catExpenses.length
            }
        }).filter(item => item.count > 0)
    }

    // Format category badge
    const formatCategory = (category: ExpenseCategory) => {
        const colors = {
            [ExpenseCategory.RENT]: "bg-purple-500",
            [ExpenseCategory.UTILITIES]: "bg-blue-500",
            [ExpenseCategory.SALARIES]: "bg-green-500",
            [ExpenseCategory.SUPPLIES]: "bg-yellow-500",
            [ExpenseCategory.MARKETING]: "bg-pink-500",
            [ExpenseCategory.TRANSPORTATION]: "bg-orange-500",
            [ExpenseCategory.MAINTENANCE]: "bg-red-500",
            [ExpenseCategory.INSURANCE]: "bg-indigo-500",
            [ExpenseCategory.TAXES]: "bg-gray-500",
            [ExpenseCategory.OTHER]: "bg-gray-300"
        }

        return (
            <Badge className={`${colors[category]} text-white`}>
                {category.replace('_', ' ')}
            </Badge>
        )
    }

    const hasActiveFilters = searchTerm || startDate || endDate || category !== 'all' ||
        paymentMethod !== 'all' || minAmount || maxAmount

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <div className="h-4 w-4 text-muted-foreground">৳</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            ৳{statistics.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">{statistics.expenseCount} transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                        <div className="h-4 w-4 text-muted-foreground">৳</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ৳{statistics.avgExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">Per transaction</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Highest Expense</CardTitle>
                        <div className="h-4 w-4 text-muted-foreground">৳</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ৳{statistics.highestExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">Single transaction</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.categoryBreakdown.length}</div>
                        <p className="text-xs text-muted-foreground">Active categories</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear All
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Description, reference..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <Label>Date Range</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    placeholder="Start date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <Input
                                    type="date"
                                    placeholder="End date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory | 'all')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {Object.values(ExpenseCategory).map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as ExpensePaymentMethod | 'all')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Methods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    {Object.values(ExpensePaymentMethod).map((method) => (
                                        <SelectItem key={method} value={method}>
                                            {method.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount Range */}
                        <div className="space-y-2">
                            <Label>Amount Range</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Sort Order */}
                        <div className="space-y-2">
                            <Label>Sort By</Label>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date,desc">Date (Newest First)</SelectItem>
                                    <SelectItem value="date,asc">Date (Oldest First)</SelectItem>
                                    <SelectItem value="amount,desc">Amount (High to Low)</SelectItem>
                                    <SelectItem value="amount,asc">Amount (Low to High)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>All Expenses</CardTitle>
                                <CardDescription>Manage your expense records</CardDescription>
                            </div>

                            <div className="flex items-center gap-2">
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
                                </div>

                                <Button variant="outline" size="sm" onClick={() => { }}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {isLoading && expenses.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border mb-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenses.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                                                    No expenses found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            expenses.map((expense) => (
                                                <TableRow key={expense.expenseID}>
                                                    <TableCell className="font-medium">
                                                        {formatDate(expense.date)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCategory(expense.category)}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {expense.description || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {expense.paymentMethod.replace('_', ' ')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {expense.referenceNumber || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-destructive">
                                                        ৳{expense.amount.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setViewingExpense(expense)
                                                                    setIsViewDialogOpen(true)
                                                                }}
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                            {onEdit && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => onEdit(expense)}
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(expense.expenseID)}
                                                                className="text-destructive hover:text-destructive"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                            {meta.totalPages > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
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

            {/* View Expense Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="w-[80vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Expense Details</DialogTitle>
                    </DialogHeader>
                    {viewingExpense && (
                        <ExpenseDetails expense={viewingExpense} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Add missing Label component
function Label({ children, ...props }: any) {
    return (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>
            {children}
        </label>
    )
}