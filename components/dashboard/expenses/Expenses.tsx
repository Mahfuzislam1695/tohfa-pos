"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { expenseStorage, type Expense } from "@/lib/localStorage"
import { getDateRange } from "@/lib/dateUtils"
import { exportToCSV, exportToPDF } from "@/lib/exportUtils"
import {
    Wallet,
    Plus,
    Search,
    Calendar,
    TrendingDown,
    DollarSign,
    FileText,
    Filter,
    X,
    Trash2,
    Edit,
    Download,
    Eye,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const EXPENSE_CATEGORIES = [
    "Rent",
    "Utilities",
    "Salaries",
    "Supplies",
    "Marketing",
    "Transportation",
    "Maintenance",
    "Insurance",
    "Taxes",
    "Other",
]

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Credit Card", "Debit Card", "Mobile Payment"]

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [dateFilter, setDateFilter] = useState("thisMonth")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [customStartDate, setCustomStartDate] = useState("")
    const [customEndDate, setCustomEndDate] = useState("")
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        category: "",
        amount: "",
        description: "",
        paymentMethod: "",
        reference: "",
    })

    useEffect(() => {
        loadExpenses()
    }, [])

    const loadExpenses = () => {
        setExpenses(expenseStorage.getAll())
    }

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split("T")[0],
            category: "",
            amount: "",
            description: "",
            paymentMethod: "",
            reference: "",
        })
        setIsEditing(false)
        setEditingId(null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.category || !formData.amount || !formData.paymentMethod) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        const expenseData = {
            date: formData.date,
            category: formData.category,
            amount: Number.parseFloat(formData.amount),
            description: formData.description,
            paymentMethod: formData.paymentMethod,
            reference: formData.reference,
            createdBy: "Admin", // In a real app, get from auth context
        }

        if (isEditing && editingId) {
            expenseStorage.update(editingId, expenseData)
            toast({
                title: "Success",
                description: "Expense updated successfully",
            })
        } else {
            expenseStorage.add(expenseData)
            toast({
                title: "Success",
                description: "Expense added successfully",
            })
        }

        loadExpenses()
        resetForm()
    }

    const handleEdit = (expense: Expense) => {
        setFormData({
            date: expense.date,
            category: expense.category,
            amount: expense.amount.toString(),
            description: expense.description,
            paymentMethod: expense.paymentMethod,
            reference: expense.reference,
        })
        setIsEditing(true)
        setEditingId(expense.id)
    }

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            expenseStorage.delete(id)
            loadExpenses()
            toast({
                title: "Success",
                description: "Expense deleted successfully",
            })
        }
    }

    // Filter expenses
    const filteredExpenses = useMemo(() => {
        let filtered = expenses

        // Date filter
        const { startDate, endDate } = getDateRange(
            dateFilter,
            customStartDate ? new Date(customStartDate) : undefined,
            customEndDate ? new Date(customEndDate) : undefined,
        )
        filtered = filtered.filter((expense) => {
            const expenseDate = new Date(expense.date)
            return expenseDate >= startDate && expenseDate <= endDate
        })

        // Category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter((expense) => expense.category === categoryFilter)
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (expense) =>
                    expense.category.toLowerCase().includes(query) ||
                    expense.description.toLowerCase().includes(query) ||
                    expense.reference.toLowerCase().includes(query),
            )
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }, [expenses, dateFilter, categoryFilter, searchQuery, customStartDate, customEndDate])

    // Calculate statistics
    const statistics = useMemo(() => {
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        const expenseCount = filteredExpenses.length

        // Category-wise breakdown
        const categoryBreakdown = EXPENSE_CATEGORIES.map((cat) => {
            const catExpenses = filteredExpenses.filter((exp) => exp.category === cat)
            const total = catExpenses.reduce((sum, exp) => sum + exp.amount, 0)
            return { category: cat, total, count: catExpenses.length }
        }).filter((item) => item.count > 0)

        const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0
        const highestExpense = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map((exp) => exp.amount)) : 0

        return {
            totalExpenses,
            expenseCount,
            avgExpense,
            highestExpense,
            categoryBreakdown,
        }
    }, [filteredExpenses])

    const hasActiveFilters = dateFilter !== "thisMonth" || categoryFilter !== "all" || searchQuery !== ""

    const clearFilters = () => {
        setDateFilter("thisMonth")
        setCategoryFilter("all")
        setSearchQuery("")
        setCustomStartDate("")
        setCustomEndDate("")
    }

    const handleExportCSV = () => {
        const data = filteredExpenses.map((exp) => ({
            Date: new Date(exp.date).toLocaleDateString(),
            Category: exp.category,
            Amount: `৳${exp.amount.toFixed(2)}`,
            Description: exp.description,
            "Payment Method": exp.paymentMethod,
            Reference: exp.reference,
        }))
        exportToCSV(data, `expenses-${new Date().toISOString().split("T")[0]}.csv`)
    }

    const handleExportPDF = () => {
        const data = filteredExpenses.map((exp) => ({
            Date: new Date(exp.date).toLocaleDateString(),
            Category: exp.category,
            Amount: `৳${exp.amount.toFixed(2)}`,
            Description: exp.description,
            "Payment Method": exp.paymentMethod,
            Reference: exp.reference,
        }))
        exportToPDF(data, "Expenses Report", `expenses-${new Date().toISOString().split("T")[0]}`)
    }
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                    <p className="text-muted-foreground">Track and manage all shop expenses</p>
                </div>
            </div>



            <Tabs defaultValue="view" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="view">All Expenses</TabsTrigger>
                    <TabsTrigger value="add">{isEditing ? "Edit Expense" : "Add Expense"}</TabsTrigger>
                </TabsList>

                <TabsContent value="view" className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">৳{statistics.totalExpenses.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">{statistics.expenseCount} transactions</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">৳{statistics.avgExpense.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Highest Expense</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">৳{statistics.highestExpense.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Single transaction</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.categoryBreakdown.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Active categories</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-8 text-xs">
                                        <X className="h-3 w-3 mr-1" />
                                        Clear All
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Date Range Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date Range</label>
                                    <Select value={dateFilter} onValueChange={setDateFilter}>
                                        <SelectTrigger>
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="yesterday">Yesterday</SelectItem>
                                            <SelectItem value="last7days">Last 7 Days</SelectItem>
                                            <SelectItem value="last30days">Last 30 Days</SelectItem>
                                            <SelectItem value="thisMonth">This Month</SelectItem>
                                            <SelectItem value="lastMonth">Last Month</SelectItem>
                                            <SelectItem value="thisQuarter">This Quarter</SelectItem>
                                            <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                                            <SelectItem value="thisYear">This Year</SelectItem>
                                            <SelectItem value="lastYear">Last Year</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {EXPENSE_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Search */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Description, reference..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Custom Date Range */}
                            {dateFilter === "custom" && (
                                <div className="grid gap-4 md:grid-cols-2 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Start Date</label>
                                        <Input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">End Date</label>
                                        <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category Breakdown */}
                    {statistics.categoryBreakdown.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {statistics.categoryBreakdown.map((item) => (
                                        <div key={item.category} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{item.category}</Badge>
                                                <span className="text-sm text-muted-foreground">{item.count} transactions</span>
                                            </div>
                                            <span className="font-semibold">৳{item.total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Expenses Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Expense List ({filteredExpenses.length})</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                                        <Download className="h-4 w-4 mr-2" />
                                        CSV
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                                        <Download className="h-4 w-4 mr-2" />
                                        PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
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
                                    {filteredExpenses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                No expenses found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredExpenses.map((expense) => (
                                            <TableRow key={expense.id}>
                                                <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{expense.category}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">{expense.description || "-"}</TableCell>
                                                <TableCell>{expense.paymentMethod}</TableCell>
                                                <TableCell>{expense.reference || "-"}</TableCell>
                                                <TableCell className="text-right font-semibold text-destructive">
                                                    ৳{expense.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => setSelectedExpense(expense)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Expense Details</DialogTitle>
                                                                </DialogHeader>
                                                                {selectedExpense && (
                                                                    <div className="space-y-4">
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <p className="text-sm font-medium text-muted-foreground">Date</p>
                                                                                <p className="text-sm">
                                                                                    {new Date(selectedExpense.date).toLocaleDateString()}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                                                                <Badge variant="secondary">{selectedExpense.category}</Badge>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                                                                <p className="text-lg font-bold text-destructive">
                                                                                    ৳{selectedExpense.amount.toFixed(2)}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                                                                <p className="text-sm">{selectedExpense.paymentMethod}</p>
                                                                            </div>
                                                                            <div className="col-span-2">
                                                                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                                                                <p className="text-sm">{selectedExpense.description || "N/A"}</p>
                                                                            </div>
                                                                            <div className="col-span-2">
                                                                                <p className="text-sm font-medium text-muted-foreground">Reference</p>
                                                                                <p className="text-sm">{selectedExpense.reference || "N/A"}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                                                                                <p className="text-sm">{selectedExpense.createdBy}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                                                                <p className="text-sm">
                                                                                    {new Date(selectedExpense.createdAt).toLocaleString()}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                handleEdit(expense)
                                                                // Switch to add tab programmatically if needed
                                                                const addTab = document.querySelector('[value="add"]') as HTMLButtonElement
                                                                addTab?.click()
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="add">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                {isEditing ? "Edit Expense" : "Add New Expense"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXPENSE_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount (৳) *</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                                        <Select
                                            value={formData.paymentMethod}
                                            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_METHODS.map((method) => (
                                                    <SelectItem key={method} value={method}>
                                                        {method}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reference">Reference Number</Label>
                                        <Input
                                            id="reference"
                                            placeholder="e.g., Invoice #12345"
                                            value={formData.reference}
                                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Enter expense details..."
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit" className="flex-1">
                                        <Plus className="h-4 w-4 mr-2" />
                                        {isEditing ? "Update Expense" : "Add Expense"}
                                    </Button>
                                    {isEditing && (
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
