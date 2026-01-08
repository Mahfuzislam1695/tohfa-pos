"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportPeriod, ReportFilters } from "@/types/dashboard"
import { OverviewTab } from "./OverviewTab"
import { SalesReportTab } from "./SalesReportTab"
import { InventoryReportTab } from "./InventoryReportTab"
import { ProfitLossReportTab } from "./ProfitLossReportTab"


export default function Reports() {
    const [activeTab, setActiveTab] = useState("overview")
    const [dateFilter, setDateFilter] = useState<ReportPeriod>(ReportPeriod.THIS_MONTH)
    const [filters, setFilters] = useState<ReportFilters>({
        period: ReportPeriod.THIS_MONTH,
    })

    // Handle date filter change
    useEffect(() => {
        setFilters({
            ...filters,
            period: dateFilter,
        })
    }, [dateFilter])

    // Format period label
    const getPeriodLabel = (period: ReportPeriod) => {
        const labels = {
            [ReportPeriod.TODAY]: 'Today',
            [ReportPeriod.YESTERDAY]: 'Yesterday',
            [ReportPeriod.LAST_7_DAYS]: 'Last 7 Days',
            [ReportPeriod.LAST_30_DAYS]: 'Last 30 Days',
            [ReportPeriod.THIS_MONTH]: 'This Month',
            [ReportPeriod.LAST_MONTH]: 'Last Month',
            [ReportPeriod.THIS_QUARTER]: 'This Quarter',
            [ReportPeriod.THIS_YEAR]: 'This Year',
            [ReportPeriod.CUSTOM]: 'Custom Range',
        }
        return labels[period]
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive business insights and statistics
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label>Period:</Label>
                        <Select value={dateFilter} onValueChange={(value: ReportPeriod) => setDateFilter(value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(ReportPeriod).map((period) => (
                                    <SelectItem key={period} value={period}>
                                        {getPeriodLabel(period)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales Report</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
                    <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
                </TabsList>

                <OverviewTab />
                <SalesReportTab filters={filters} getPeriodLabel={getPeriodLabel} />
                <InventoryReportTab />
                <ProfitLossReportTab filters={filters} />
            </Tabs>
        </div>
    )
}


// "use client"

// import { useState, useEffect, Activity } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Download, FileText, TrendingUp, TrendingDown, Package, DollarSign, Calendar, Users, ShoppingCart, AlertCircle, XCircle, CheckCircle, Repeat, Calculator, ShoppingBag } from "lucide-react"
// import { ReportPeriod, ReportFilters } from "@/types/dashboard"
// import { useSalesReport } from "@/hooks/use-sales-report"
// import { useInventoryReport } from "@/hooks/use-inventory-report"
// import { useProfitLossReport } from "@/hooks/use-profit-loss-report"
// import { formatCurrency, formatDate } from "@/lib/units"

// import {
//     PieChart,
//     BarChart3,
//     AlertTriangle,
//     Lightbulb,
//     Circle
// } from 'lucide-react';


// export default function Reports() {
//     const [activeTab, setActiveTab] = useState("overview")
//     const [dateFilter, setDateFilter] = useState<ReportPeriod>(ReportPeriod.THIS_MONTH)
//     const [filters, setFilters] = useState<ReportFilters>({
//         period: ReportPeriod.THIS_MONTH,
//     })
//     const [customDateRange, setCustomDateRange] = useState<{
//         from: Date | undefined;
//         to: Date | undefined;
//     }>({
//         from: undefined,
//         to: undefined,
//     })

//     // Handle date filter change
//     useEffect(() => {
//         if (dateFilter === ReportPeriod.CUSTOM) {
//             setFilters({
//                 ...filters,
//                 period: ReportPeriod.CUSTOM,
//                 startDate: customDateRange.from?.toISOString().split('T')[0],
//                 endDate: customDateRange.to?.toISOString().split('T')[0],
//             })
//         } else {
//             setFilters({
//                 ...filters,
//                 period: dateFilter,
//                 startDate: undefined,
//                 endDate: undefined,
//             })
//         }
//     }, [dateFilter, customDateRange])

//     // Sales Report
//     const {
//         salesReportData,
//         isLoading: salesLoading,
//         error: salesError,
//     } = useSalesReport(filters)

//     // Inventory Report
//     const {
//         inventoryReportData,
//         isLoading: inventoryLoading,
//         error: inventoryError,
//     } = useInventoryReport()

//     // Profit & Loss Report
//     const {
//         profitLossData,
//         isLoading: profitLossLoading,
//         error: profitLossError,
//     } = useProfitLossReport(filters)

//     // Export functions
//     const handleExportSalesCSV = async () => {
//         try {
//             const params = new URLSearchParams()
//             if (filters.period) params.append('period', filters.period)
//             if (filters.startDate) params.append('startDate', filters.startDate)
//             if (filters.endDate) params.append('endDate', filters.endDate)

//             const response = await fetch(`/api/dashboard/sales-report/export/csv?${params.toString()}`)
//             if (!response.ok) throw new Error('Failed to export')

//             const blob = await response.blob()
//             const url = window.URL.createObjectURL(blob)
//             const a = document.createElement('a')
//             a.href = url
//             a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`
//             document.body.appendChild(a)
//             a.click()
//             window.URL.revokeObjectURL(url)
//             document.body.removeChild(a)
//         } catch (error) {
//             console.error('Export failed:', error)
//             alert('Failed to export CSV')
//         }
//     }

//     const handleExportInventoryCSV = async () => {
//         try {
//             const response = await fetch('/api/dashboard/inventory-report/export/csv')
//             if (!response.ok) throw new Error('Failed to export')

//             const blob = await response.blob()
//             const url = window.URL.createObjectURL(blob)
//             const a = document.createElement('a')
//             a.href = url
//             a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`
//             document.body.appendChild(a)
//             a.click()
//             window.URL.revokeObjectURL(url)
//             document.body.removeChild(a)
//         } catch (error) {
//             console.error('Export failed:', error)
//             alert('Failed to export CSV')
//         }
//     }

//     // Format period label
//     const getPeriodLabel = (period: ReportPeriod) => {
//         const labels = {
//             [ReportPeriod.TODAY]: 'Today',
//             [ReportPeriod.YESTERDAY]: 'Yesterday',
//             [ReportPeriod.LAST_7_DAYS]: 'Last 7 Days',
//             [ReportPeriod.LAST_30_DAYS]: 'Last 30 Days',
//             [ReportPeriod.THIS_MONTH]: 'This Month',
//             [ReportPeriod.LAST_MONTH]: 'Last Month',
//             [ReportPeriod.THIS_QUARTER]: 'This Quarter',
//             [ReportPeriod.THIS_YEAR]: 'This Year',
//             [ReportPeriod.CUSTOM]: 'Custom Range',
//         }
//         return labels[period]
//     }

//     return (
//         <div className="p-6 space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold">Reports & Analytics</h1>
//                     <p className="text-muted-foreground mt-1">
//                         Comprehensive business insights and statistics
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     <div className="flex items-center gap-2">
//                         <Label>Period:</Label>
//                         <Select value={dateFilter} onValueChange={(value: ReportPeriod) => setDateFilter(value)}>
//                             <SelectTrigger className="w-48">
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {Object.values(ReportPeriod).map((period) => (
//                                     <SelectItem key={period} value={period}>
//                                         {getPeriodLabel(period)}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                     {/* {dateFilter === ReportPeriod.CUSTOM && (
//             <DateRangePicker
//               value={customDateRange}
//               onChange={setCustomDateRange}
//             />
//           )} */}
//                 </div>
//             </div>

//             <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//                 <TabsList>
//                     <TabsTrigger value="overview">Overview</TabsTrigger>
//                     <TabsTrigger value="sales">Sales Report</TabsTrigger>
//                     <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
//                     <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
//                 </TabsList>

//                 {/* Overview Tab */}
//                 <TabsContent value="overview" className="space-y-4">
//                     {/* Add overview content here if needed */}
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Dashboard Overview</CardTitle>
//                             <CardDescription>
//                                 Select a specific report tab to view detailed analytics
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <DollarSign className="h-4 w-4" />
//                                             Sales Report
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">Detailed</div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             View sales analytics
//                                         </p>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <Package className="h-4 w-4" />
//                                             Inventory Report
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">Detailed</div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             View inventory status
//                                         </p>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <TrendingUp className="h-4 w-4" />
//                                             Profit & Loss
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">Detailed</div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             View financial performance
//                                         </p>
//                                     </CardContent>
//                                 </Card>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 {/* Sales Report Tab */}

//                 {/* Sales Report Tab */}
//                 <TabsContent value="sales" className="space-y-4">
//                     {salesLoading ? (
//                         <div className="flex justify-center items-center h-64">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                         </div>
//                     ) : salesError ? (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-destructive">
//                                     <TrendingDown className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">Error loading sales report</h3>
//                                     <p className="text-sm mt-2">{salesError.message}</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ) : salesReportData ? (
//                         <>
//                             {/* ==================== */}
//                             {/* NEW: Human-Friendly Sales Summary */}
//                             {/* ==================== */}
//                             <div className="space-y-6">
//                                 {/* Sales Performance Overview */}
//                                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                                     {/* Revenue Card */}
//                                     <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <DollarSign className="h-4 w-4" />
//                                                 Total Revenue
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="text-2xl font-bold text-green-700">
//                                                     {formatCurrency(salesReportData.summary.totalRevenue)}
//                                                 </div>
//                                                 <div className="flex justify-between items-center text-sm">
//                                                     <span className="text-muted-foreground">Orders</span>
//                                                     <span className="font-medium text-green-700">
//                                                         {salesReportData.summary.totalSales}
//                                                     </span>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     Avg: {formatCurrency(salesReportData.summary.averageOrderValue)} per order
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Profit Card */}
//                                     <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <TrendingUp className="h-4 w-4" />
//                                                 Total Profit
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className={`text-2xl font-bold ${salesReportData.summary.totalProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
//                                                     {formatCurrency(salesReportData.summary.totalProfit)}
//                                                 </div>
//                                                 <div className="flex justify-between items-center text-sm">
//                                                     <span className="text-muted-foreground">Margin</span>
//                                                     <span className={`font-medium ${salesReportData.summary.profitMargin >= 0 ? "text-emerald-700" : "text-red-700"}`}>
//                                                         {salesReportData.summary.profitMargin.toFixed(1)}%
//                                                     </span>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     Every ₹100 revenue → ₹{salesReportData.summary.profitMargin.toFixed(0)} profit
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Sales Volume Card */}
//                                     <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <ShoppingBag className="h-4 w-4" />
//                                                 Sales Volume
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="text-2xl font-bold text-blue-700">
//                                                     {salesReportData.summary.itemsSold.toFixed(0)}
//                                                 </div>
//                                                 <div className="text-sm text-muted-foreground">Items Sold</div>
//                                                 <div className="flex justify-between items-center text-sm">
//                                                     <span className="text-muted-foreground">Avg Items/Order</span>
//                                                     <span className="font-medium text-blue-700">
//                                                         {(salesReportData.summary.itemsSold / salesReportData.summary.totalSales).toFixed(1)}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Costs & Deductions Card */}
//                                     <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <Calculator className="h-4 w-4" />
//                                                 Costs & Deductions
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="flex items-center justify-between">
//                                                     <span className="text-sm">Product Cost</span>
//                                                     <div className="text-sm font-bold text-red-600">
//                                                         {formatCurrency(salesReportData.summary.totalCost)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center justify-between">
//                                                     <span className="text-sm">Discounts</span>
//                                                     <div className="text-sm font-bold text-orange-600">
//                                                         {formatCurrency(salesReportData.summary.totalDiscount)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     {salesReportData.summary.totalRevenue > 0 ?
//                                                         ((salesReportData.summary.totalDiscount / salesReportData.summary.totalRevenue) * 100).toFixed(1) : 0}% discount rate
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Quick Insights */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg flex items-center gap-2">
//                                             <Lightbulb className="h-5 w-5" />
//                                             Sales Insights
//                                         </CardTitle>
//                                         <CardDescription>Key metrics for better sales decisions</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                                             <div className="p-4 bg-green-50 rounded-lg">
//                                                 <div className="text-lg font-bold text-green-700">
//                                                     {formatCurrency(salesReportData.summary.averageOrderValue)}
//                                                 </div>
//                                                 <p className="text-sm mt-1">Average Order</p>
//                                                 <p className="text-xs text-muted-foreground mt-1">
//                                                     Per customer
//                                                 </p>
//                                             </div>
//                                             <div className="p-4 bg-emerald-50 rounded-lg">
//                                                 <div className="text-lg font-bold text-emerald-700">
//                                                     {salesReportData.summary.totalRevenue > 0 ?
//                                                         ((salesReportData.summary.totalProfit / salesReportData.summary.totalRevenue) * 100).toFixed(1) : 0}%
//                                                 </div>
//                                                 <p className="text-sm mt-1">Profit Margin</p>
//                                                 <p className="text-xs text-muted-foreground mt-1">
//                                                     Net profit percentage
//                                                 </p>
//                                             </div>
//                                             <div className="p-4 bg-orange-50 rounded-lg">
//                                                 <div className="text-lg font-bold text-orange-700">
//                                                     {salesReportData.summary.totalRevenue > 0 ?
//                                                         ((salesReportData.summary.totalDiscount / salesReportData.summary.totalRevenue) * 100).toFixed(1) : 0}%
//                                                 </div>
//                                                 <p className="text-sm mt-1">Discount Rate</p>
//                                                 <p className="text-xs text-muted-foreground mt-1">
//                                                     % of revenue discounted
//                                                 </p>
//                                             </div>
//                                             <div className="p-4 bg-blue-50 rounded-lg">
//                                                 <div className="text-lg font-bold text-blue-700">
//                                                     {salesReportData.summary.itemsSold > 0 ?
//                                                         (salesReportData.summary.totalRevenue / salesReportData.summary.itemsSold).toFixed(0) : 0}
//                                                 </div>
//                                                 <p className="text-sm mt-1">Avg. Price/Item</p>
//                                                 <p className="text-xs text-muted-foreground mt-1">
//                                                     Revenue per item sold
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>

//                                 {/* Sales Performance Breakdown */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg flex items-center gap-2">
//                                             <BarChart3 className="h-5 w-5" />
//                                             Performance Breakdown
//                                         </CardTitle>
//                                         <CardDescription>Revenue vs. costs vs. profit</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="grid gap-6 md:grid-cols-3">
//                                             <div className="space-y-4">
//                                                 <h3 className="font-medium text-green-700 flex items-center gap-2">
//                                                     <Circle className="h-3 w-3 fill-green-500" />
//                                                     Money Coming In
//                                                 </h3>
//                                                 <div className="p-4 bg-green-50 rounded-lg">
//                                                     <div className="text-xl font-bold text-green-700">
//                                                         {formatCurrency(salesReportData.summary.totalRevenue)}
//                                                     </div>
//                                                     <p className="text-sm mt-1">Total Revenue</p>
//                                                     <div className="mt-2 text-xs text-muted-foreground">
//                                                         {salesReportData.summary.totalSales} transactions
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="space-y-4">
//                                                 <h3 className="font-medium text-red-700 flex items-center gap-2">
//                                                     <Circle className="h-3 w-3 fill-red-500" />
//                                                     Money Going Out
//                                                 </h3>
//                                                 <div className="p-4 bg-red-50 rounded-lg">
//                                                     <div className="text-xl font-bold text-red-700">
//                                                         {formatCurrency(salesReportData.summary.totalCost)}
//                                                     </div>
//                                                     <p className="text-sm mt-1">Product Costs</p>
//                                                     <div className="mt-2 text-xs text-muted-foreground">
//                                                         + {formatCurrency(salesReportData.summary.totalDiscount)} discounts
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="space-y-4">
//                                                 <h3 className="font-medium text-emerald-700 flex items-center gap-2">
//                                                     <Circle className="h-3 w-3 fill-emerald-500" />
//                                                     Net Result
//                                                 </h3>
//                                                 <div className={`p-4 rounded-lg ${salesReportData.summary.totalProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
//                                                     <div className={`text-xl font-bold ${salesReportData.summary.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
//                                                         {formatCurrency(salesReportData.summary.totalProfit)}
//                                                     </div>
//                                                     <p className="text-sm mt-1">Net Profit</p>
//                                                     <div className={`mt-2 text-xs ${salesReportData.summary.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
//                                                         {salesReportData.summary.profitMargin.toFixed(1)}% margin
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* ==================== */}
//                             {/* PREVIOUS: Detailed Sales Analysis */}
//                             {/* ==================== */}
//                             <div className="space-y-6 pt-6 border-t">
//                                 <h2 className="text-xl font-bold">Detailed Sales Analysis</h2>

//                                 {/* Summary Cards */}
//                                 <div className="grid gap-4 md:grid-cols-5">
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold">{salesReportData.summary.totalSales}</div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Transactions
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold">
//                                                 {formatCurrency(salesReportData.summary.totalRevenue)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Before costs
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold">
//                                                 {salesReportData.summary.itemsSold.toFixed(0)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Units sold
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className={`text-2xl font-bold ${salesReportData.summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
//                                                 {formatCurrency(salesReportData.summary.totalProfit)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 After all costs
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold">
//                                                 {salesReportData.summary.profitMargin.toFixed(2)}%
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Net profit percentage
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Additional Stats */}
//                                 <div className="grid gap-4 md:grid-cols-3">
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold">
//                                                 {formatCurrency(salesReportData.summary.averageOrderValue)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Per transaction
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-orange-600">
//                                                 {formatCurrency(salesReportData.summary.totalDiscount)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Discounts given
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold">
//                                                 {formatCurrency(salesReportData.summary.totalTax)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Tax collected
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Cost Breakdown */}
//                                 <div className="grid gap-4 md:grid-cols-2">
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-red-600">
//                                                 {formatCurrency(salesReportData.summary.totalCost)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Product purchase cost
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-emerald-600">
//                                                 {formatCurrency(salesReportData.summary.totalRevenue - salesReportData.summary.totalCost)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Before discounts & tax
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Payment Method Breakdown */}
//                                 {salesReportData.paymentMethodBreakdown && salesReportData.paymentMethodBreakdown.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Payment Methods</CardTitle>
//                                             <CardDescription>Breakdown by payment type</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Method</TableHead>
//                                                         <TableHead>Transactions</TableHead>
//                                                         <TableHead>Amount</TableHead>
//                                                         <TableHead>Percentage</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {salesReportData.paymentMethodBreakdown.map((payment) => (
//                                                         <TableRow key={payment.method}>
//                                                             <TableCell className="font-medium">{payment.method}</TableCell>
//                                                             <TableCell>{payment.count}</TableCell>
//                                                             <TableCell>{formatCurrency(payment.amount)}</TableCell>
//                                                             <TableCell>{payment.percentage.toFixed(2)}%</TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}

//                                 {/* Category Breakdown */}
//                                 {salesReportData.categoryBreakdown && salesReportData.categoryBreakdown.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Category Performance</CardTitle>
//                                             <CardDescription>Sales breakdown by product category</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Category</TableHead>
//                                                         <TableHead>Revenue</TableHead>
//                                                         <TableHead>% of Total</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {salesReportData.categoryBreakdown.map((category) => (
//                                                         <TableRow key={category.categoryID}>
//                                                             <TableCell className="font-medium">{category.categoryName}</TableCell>
//                                                             <TableCell>{formatCurrency(category.revenue)}</TableCell>
//                                                             <TableCell>{category.percentage.toFixed(2)}%</TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}

//                                 {/* Top Products */}
//                                 {salesReportData.topProducts && salesReportData.topProducts.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Top Selling Products</CardTitle>
//                                             <CardDescription>Best performing products by revenue</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Product</TableHead>
//                                                         <TableHead>Quantity Sold</TableHead>
//                                                         <TableHead>Revenue</TableHead>
//                                                         <TableHead>Avg. Price</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {salesReportData.topProducts.map((product) => (
//                                                         <TableRow key={product.productID}>
//                                                             <TableCell className="font-medium">{product.productName}</TableCell>
//                                                             <TableCell>{product.quantity}</TableCell>
//                                                             <TableCell>{formatCurrency(product.revenue)}</TableCell>
//                                                             <TableCell>{product.quantity > 0 ? formatCurrency(product.revenue / product.quantity) : '-'}</TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}

//                                 {/* Sales Details Table */}
//                                 <Card>
//                                     <CardHeader>
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <CardTitle>Sales Details</CardTitle>
//                                                 <CardDescription>
//                                                     All sales for {getPeriodLabel(filters.period)} {filters.period === ReportPeriod.CUSTOM && filters.startDate ? `(${filters.startDate} to ${filters.endDate})` : ''}
//                                                 </CardDescription>
//                                             </div>
//                                             <Button variant="outline" onClick={handleExportSalesCSV}>
//                                                 <Download className="mr-2 h-4 w-4" />
//                                                 Export CSV
//                                             </Button>
//                                         </div>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="overflow-x-auto">
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Invoice</TableHead>
//                                                         <TableHead>Customer</TableHead>
//                                                         <TableHead>Phone</TableHead>
//                                                         <TableHead>Items</TableHead>
//                                                         <TableHead>Subtotal</TableHead>
//                                                         <TableHead>Discount</TableHead>
//                                                         <TableHead>Tax</TableHead>
//                                                         <TableHead>Total</TableHead>
//                                                         <TableHead>Payment</TableHead>
//                                                         <TableHead>Status</TableHead>
//                                                         <TableHead>Date</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {salesReportData.sales.length === 0 ? (
//                                                         <TableRow>
//                                                             <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
//                                                                 No sales found for this period
//                                                             </TableCell>
//                                                         </TableRow>
//                                                     ) : (
//                                                         salesReportData.sales.map((sale) => (
//                                                             <TableRow key={sale.sellID}>
//                                                                 <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
//                                                                 <TableCell>{sale.customerName || "Walk-in"}</TableCell>
//                                                                 <TableCell>{sale.customerPhone || "-"}</TableCell>
//                                                                 <TableCell>{sale.itemsCount} items</TableCell>
//                                                                 <TableCell>{formatCurrency(sale.subtotal)}</TableCell>
//                                                                 <TableCell className="text-orange-600">{formatCurrency(sale.discount)}</TableCell>
//                                                                 <TableCell>{formatCurrency(sale.tax)}</TableCell>
//                                                                 <TableCell className="font-medium">{formatCurrency(sale.total)}</TableCell>
//                                                                 <TableCell>{sale.paymentMethod}</TableCell>
//                                                                 <TableCell>
//                                                                     <span className={`px-2 py-1 rounded-full text-xs ${sale.paymentStatus === 'COMPLETED'
//                                                                         ? 'bg-green-100 text-green-800'
//                                                                         : 'bg-yellow-100 text-yellow-800'
//                                                                         }`}>
//                                                                         {sale.paymentStatus}
//                                                                     </span>
//                                                                 </TableCell>
//                                                                 <TableCell>{formatDate(sale.createdAt)}</TableCell>
//                                                             </TableRow>
//                                                         ))
//                                                     )}
//                                                 </TableBody>
//                                             </Table>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>
//                         </>
//                     ) : (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-muted-foreground">
//                                     <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">No sales data available</h3>
//                                     <p className="text-sm mt-2">Select a different period or check your data</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     )}
//                 </TabsContent>



//                 {/* Inventory Report Tab */}

//                 {/* Inventory Report Tab */}
//                 <TabsContent value="inventory" className="space-y-4">
//                     {inventoryLoading ? (
//                         <div className="flex justify-center items-center h-64">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                         </div>
//                     ) : inventoryError ? (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-destructive">
//                                     <Package className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">Error loading inventory report</h3>
//                                     <p className="text-sm mt-2">{inventoryError.message}</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ) : inventoryReportData ? (
//                         <>
//                             {/* ==================== */}
//                             {/* NEW: Human-Friendly Inventory Summary */}
//                             {/* ==================== */}
//                             <div className="space-y-6">
//                                 {/* Inventory Health Overview */}
//                                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                                     {/* Inventory Value Card */}
//                                     <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <Package className="h-4 w-4" />
//                                                 Total Inventory Value
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="text-2xl font-bold text-blue-700">
//                                                     {formatCurrency(inventoryReportData.summary.inventoryValue)}
//                                                 </div>
//                                                 <div className="flex justify-between items-center text-sm">
//                                                     <span className="text-muted-foreground">Potential Revenue</span>
//                                                     <span className="font-medium text-green-700">
//                                                         {formatCurrency(inventoryReportData.summary.potentialRevenue)}
//                                                     </span>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     {inventoryReportData.summary.totalStockQuantity} units in stock
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Stock Health Card */}
//                                     <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <CheckCircle className="h-4 w-4" />
//                                                 Stock Health
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="text-2xl font-bold text-emerald-700">
//                                                     {inventoryReportData.summary.totalProducts - inventoryReportData.summary.outOfStockProducts}
//                                                 </div>
//                                                 <div className="text-sm text-muted-foreground">Products Available</div>
//                                                 <div className="flex justify-between items-center text-sm">
//                                                     <span className="text-muted-foreground">Healthy Stock</span>
//                                                     <span className="font-medium text-emerald-700">
//                                                         {inventoryReportData.summary.totalProducts - inventoryReportData.summary.lowStockProducts - inventoryReportData.summary.outOfStockProducts}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Stock Alerts Card */}
//                                     <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <AlertTriangle className="h-4 w-4" />
//                                                 Stock Alerts
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="flex items-center justify-between">
//                                                     <span className="text-sm">Low Stock</span>
//                                                     <div className="text-lg font-bold text-orange-600">
//                                                         {inventoryReportData.summary.lowStockProducts}
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center justify-between">
//                                                     <span className="text-sm">Out of Stock</span>
//                                                     <div className="text-lg font-bold text-red-600">
//                                                         {inventoryReportData.summary.outOfStockProducts}
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     {((inventoryReportData.summary.lowStockProducts + inventoryReportData.summary.outOfStockProducts) / inventoryReportData.summary.totalProducts * 100).toFixed(1)}% of products need attention
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Inventory Efficiency Card */}
//                                     <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <Repeat className="h-4 w-4" />
//                                                 Inventory Efficiency
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="text-2xl font-bold text-purple-700">
//                                                     {inventoryReportData.summary.inventoryTurnover.toFixed(1)}
//                                                 </div>
//                                                 <div className="text-sm text-muted-foreground">Turnover Ratio</div>
//                                                 <div className="flex justify-between items-center text-sm">
//                                                     <span className="text-muted-foreground">Avg. Value/Product</span>
//                                                     <span className="font-medium text-purple-700">
//                                                         {formatCurrency(inventoryReportData.summary.averageStockValue)}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Quick Insights */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg flex items-center gap-2">
//                                             <Lightbulb className="h-5 w-5" />
//                                             Inventory Insights
//                                         </CardTitle>
//                                         <CardDescription>Key metrics for better inventory management</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                                             <div className="p-4 bg-blue-50 rounded-lg">
//                                                 <div className="text-lg font-bold text-blue-700">
//                                                     {inventoryReportData.summary.totalProducts}
//                                                 </div>
//                                                 <p className="text-sm mt-1">Total Products</p>
//                                                 <p className="text-xs text-muted-foreground mt-1">
//                                                     {inventoryReportData.summary.activeProducts} active
//                                                 </p>
//                                             </div>
//                                             <div className="p-4 bg-emerald-50 rounded-lg">
//                                                 <div className="text-lg font-bold text-emerald-700">
//                                                     {formatCurrency(inventoryReportData.summary.potentialRevenue - inventoryReportData.summary.inventoryValue)}
//                                                 </div>
//                                                 <p className="text-sm mt-1">Potential Profit</p>
//                                                 <p className="text-xs text-muted-foreground mt-1">
//                                                     If all stock sells
//                                                 </p>
//                                             </div>
//                                             <div className="p-4 bg-amber-50 rounded-lg">
//                                                 <div className="text-lg font-bold text-amber-700">
//                                                     {inventoryReportData.summary.totalStockQuantity > 0 ?
//                                                         (inventoryReportData.summary.lowStockProducts / inventoryReportData.summary.totalStockQuantity * 100).toFixed(1) : 0}%
//                                                 </div>
//                                                 <p className="text-sm mt-1">Stock Risk</p>
//                                                 <p className="text-xs text-muted-foreground mt-1">
//                                                     Low stock percentage
//                                                 </p>
//                                             </div>
//                                             <div className="p-4 bg-purple-50 rounded-lg">
//                                                 <div className="text-lg font-bold text-purple-700">
//                                                     {inventoryReportData.summary.inventoryTurnover > 2.5 ? 'Fast' :
//                                                         inventoryReportData.summary.inventoryTurnover > 1.0 ? 'Moderate' : 'Slow'}
//                                                 </div>
//                                                 <p className="text-sm mt-1">Turnover Rate</p>
//                                                 <p className="text-xs text-muted-foreground mt-1">
//                                                     Sales vs. inventory
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>

//                                 {/* Stock Status Overview */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg flex items-center gap-2">
//                                             <Activity className="h-5 w-5" />
//                                             Stock Status Overview
//                                         </CardTitle>
//                                         <CardDescription>Current inventory health by category</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="grid gap-6 md:grid-cols-3">
//                                             <div className="space-y-4">
//                                                 <h3 className="font-medium text-emerald-700 flex items-center gap-2">
//                                                     <CheckCircle className="h-4 w-4" />
//                                                     Healthy Stock
//                                                 </h3>
//                                                 <div className="p-4 bg-emerald-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-emerald-700">
//                                                         {inventoryReportData.summary.totalProducts - inventoryReportData.summary.lowStockProducts - inventoryReportData.summary.outOfStockProducts}
//                                                     </div>
//                                                     <p className="text-sm mt-1">Products</p>
//                                                     <div className="mt-2 text-xs text-muted-foreground">
//                                                         Stock levels are sufficient
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="space-y-4">
//                                                 <h3 className="font-medium text-orange-700 flex items-center gap-2">
//                                                     <AlertTriangle className="h-4 w-4" />
//                                                     Needs Attention
//                                                 </h3>
//                                                 <div className="p-4 bg-orange-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-orange-600">
//                                                         {inventoryReportData.summary.lowStockProducts}
//                                                     </div>
//                                                     <p className="text-sm mt-1">Products</p>
//                                                     <div className="mt-2 text-xs text-muted-foreground">
//                                                         Below threshold, restock soon
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="space-y-4">
//                                                 <h3 className="font-medium text-red-700 flex items-center gap-2">
//                                                     <XCircle className="h-4 w-4" />
//                                                     Urgent Action
//                                                 </h3>
//                                                 <div className="p-4 bg-red-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-red-600">
//                                                         {inventoryReportData.summary.outOfStockProducts}
//                                                     </div>
//                                                     <p className="text-sm mt-1">Products</p>
//                                                     <div className="mt-2 text-xs text-muted-foreground">
//                                                         Currently unavailable
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* ==================== */}
//                             {/* PREVIOUS: Detailed Inventory Analysis */}
//                             {/* ==================== */}
//                             <div className="space-y-6 pt-6 border-t">
//                                 <h2 className="text-xl font-bold">Detailed Inventory Analysis</h2>

//                                 {/* Summary Cards */}
//                                 <div className="grid gap-4 md:grid-cols-4">
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Products</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold">{inventoryReportData.summary.totalProducts}</div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 {inventoryReportData.summary.activeProducts} active
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold">
//                                                 {formatCurrency(inventoryReportData.summary.inventoryValue)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 {inventoryReportData.summary.totalStockQuantity} units
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold text-orange-600">
//                                                 {inventoryReportData.summary.lowStockProducts}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 {inventoryReportData.summary.lowStockProducts > 0 ?
//                                                     `${((inventoryReportData.summary.lowStockProducts / inventoryReportData.summary.totalProducts) * 100).toFixed(1)}% of products` :
//                                                     'All good'}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold text-red-600">
//                                                 {inventoryReportData.summary.outOfStockProducts}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 {inventoryReportData.summary.outOfStockProducts > 0 ?
//                                                     `${((inventoryReportData.summary.outOfStockProducts / inventoryReportData.summary.totalProducts) * 100).toFixed(1)}% of products` :
//                                                     'All in stock'}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Additional Metrics */}
//                                 <div className="grid gap-4 md:grid-cols-3">
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-green-600">
//                                                 {formatCurrency(inventoryReportData.summary.potentialRevenue)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 If all stock sells
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Average Stock Value</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-blue-600">
//                                                 {formatCurrency(inventoryReportData.summary.averageStockValue)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Per product
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-purple-600">
//                                                 {inventoryReportData.summary.inventoryTurnover.toFixed(2)}
//                                             </div>
//                                             <div className="text-sm text-muted-foreground mt-1">
//                                                 Times per period
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Category Breakdown */}
//                                 {inventoryReportData.categoryBreakdown && inventoryReportData.categoryBreakdown.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Category Breakdown</CardTitle>
//                                             <CardDescription>Inventory value by category</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Category</TableHead>
//                                                         <TableHead>Products</TableHead>
//                                                         <TableHead>Inventory Value</TableHead>
//                                                         <TableHead>% of Total</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {inventoryReportData.categoryBreakdown.map((category) => (
//                                                         <TableRow key={category.categoryID}>
//                                                             <TableCell className="font-medium">{category.categoryName}</TableCell>
//                                                             <TableCell>{category.productCount}</TableCell>
//                                                             <TableCell className="text-blue-600">
//                                                                 {formatCurrency(category.stockValue)}
//                                                             </TableCell>
//                                                             <TableCell>
//                                                                 {inventoryReportData.summary.inventoryValue > 0 ?
//                                                                     ((category.stockValue / inventoryReportData.summary.inventoryValue) * 100).toFixed(1) : 0}%
//                                                             </TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}

//                                 {/* Inventory Details Table */}
//                                 <Card>
//                                     <CardHeader>
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <CardTitle>Inventory Details</CardTitle>
//                                                 <CardDescription>All products with current stock levels</CardDescription>
//                                             </div>
//                                             <Button variant="outline" onClick={handleExportInventoryCSV}>
//                                                 <Download className="mr-2 h-4 w-4" />
//                                                 Export CSV
//                                             </Button>
//                                         </div>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="overflow-x-auto">
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>SKU</TableHead>
//                                                         <TableHead>Product</TableHead>
//                                                         <TableHead>Category</TableHead>
//                                                         <TableHead>Stock</TableHead>
//                                                         <TableHead>Threshold</TableHead>
//                                                         <TableHead>Purchase Price</TableHead>
//                                                         <TableHead>Selling Price</TableHead>
//                                                         <TableHead>Profit Margin</TableHead>
//                                                         <TableHead>Inventory Value</TableHead>
//                                                         <TableHead>Status</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {inventoryReportData.products.length === 0 ? (
//                                                         <TableRow>
//                                                             <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
//                                                                 No products found
//                                                             </TableCell>
//                                                         </TableRow>
//                                                     ) : (
//                                                         inventoryReportData.products.map((product) => (
//                                                             <TableRow key={product.productID}>
//                                                                 <TableCell className="font-medium">{product.sku}</TableCell>
//                                                                 <TableCell>{product.name}</TableCell>
//                                                                 <TableCell>{product.categoryName}</TableCell>
//                                                                 <TableCell className={
//                                                                     product.isOutOfStock ? "text-red-600" :
//                                                                         product.isLowStock ? "text-orange-600" : "text-emerald-600"
//                                                                 }>
//                                                                     {product.stockQuantity}
//                                                                 </TableCell>
//                                                                 <TableCell>{product.lowStockThreshold}</TableCell>
//                                                                 <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
//                                                                 <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
//                                                                 <TableCell className={`${product.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
//                                                                     {product.profitMargin.toFixed(1)}%
//                                                                 </TableCell>
//                                                                 <TableCell>{formatCurrency(product.inventoryValue)}</TableCell>
//                                                                 <TableCell>
//                                                                     <span className={`px-2 py-1 rounded-full text-xs ${product.isOutOfStock
//                                                                         ? 'bg-red-100 text-red-800'
//                                                                         : product.isLowStock
//                                                                             ? 'bg-orange-100 text-orange-800'
//                                                                             : 'bg-green-100 text-green-800'
//                                                                         }`}>
//                                                                         {product.isOutOfStock ? 'Out of Stock' :
//                                                                             product.isLowStock ? 'Low Stock' : 'In Stock'}
//                                                                     </span>
//                                                                 </TableCell>
//                                                             </TableRow>
//                                                         ))
//                                                     )}
//                                                 </TableBody>
//                                             </Table>
//                                         </div>
//                                     </CardContent>
//                                 </Card>

//                                 {/* Low Stock Products */}
//                                 {inventoryReportData.lowStockProducts && inventoryReportData.lowStockProducts.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Low Stock Alert</CardTitle>
//                                             <CardDescription>Products that need immediate restocking</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Product</TableHead>
//                                                         <TableHead>SKU</TableHead>
//                                                         <TableHead>Category</TableHead>
//                                                         <TableHead>Current Stock</TableHead>
//                                                         <TableHead>Threshold</TableHead>
//                                                         <TableHead>Difference</TableHead>
//                                                         <TableHead>Urgency</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {inventoryReportData.lowStockProducts.map((product) => {
//                                                         const difference = product.lowStockThreshold - product.stockQuantity;
//                                                         const urgency = difference > 5 ? 'High' : difference > 2 ? 'Medium' : 'Low';
//                                                         return (
//                                                             <TableRow key={product.productID}>
//                                                                 <TableCell className="font-medium">{product.name}</TableCell>
//                                                                 <TableCell>{product.sku}</TableCell>
//                                                                 <TableCell>{product.categoryName}</TableCell>
//                                                                 <TableCell className="text-orange-600">{product.stockQuantity}</TableCell>
//                                                                 <TableCell>{product.lowStockThreshold}</TableCell>
//                                                                 <TableCell className="text-red-600">
//                                                                     {difference}
//                                                                 </TableCell>
//                                                                 <TableCell>
//                                                                     <span className={`px-2 py-1 rounded-full text-xs ${urgency === 'High' ? 'bg-red-100 text-red-800' :
//                                                                         urgency === 'Medium' ? 'bg-orange-100 text-orange-800' :
//                                                                             'bg-yellow-100 text-yellow-800'
//                                                                         }`}>
//                                                                         {urgency}
//                                                                     </span>
//                                                                 </TableCell>
//                                                             </TableRow>
//                                                         );
//                                                     })}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}

//                                 {/* Out of Stock Products */}
//                                 {inventoryReportData.outOfStockProducts && inventoryReportData.outOfStockProducts.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle className="text-red-700">Out of Stock Products</CardTitle>
//                                             <CardDescription>Products currently unavailable for sale</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Product</TableHead>
//                                                         <TableHead>SKU</TableHead>
//                                                         <TableHead>Category</TableHead>
//                                                         <TableHead>Last Stock</TableHead>
//                                                         <TableHead>Purchase Price</TableHead>
//                                                         <TableHead>Selling Price</TableHead>
//                                                         <TableHead>Lost Revenue</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {inventoryReportData.outOfStockProducts.map((product) => (
//                                                         <TableRow key={product.productID}>
//                                                             <TableCell className="font-medium">{product.name}</TableCell>
//                                                             <TableCell>{product.sku}</TableCell>
//                                                             <TableCell>{product.categoryName}</TableCell>
//                                                             <TableCell className="text-red-600">0</TableCell>
//                                                             <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
//                                                             <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
//                                                             <TableCell className="text-red-600">
//                                                                 {formatCurrency(product.sellingPrice - product.purchasePrice)} per unit
//                                                             </TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}
//                             </div>
//                         </>
//                     ) : (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-muted-foreground">
//                                     <Package className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">No inventory data available</h3>
//                                     <p className="text-sm mt-2">Check your product data</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     )}
//                 </TabsContent>



//                 {/* Profit & Loss Tab */}
//                 {/* Profit & Loss Tab */}
//                 <TabsContent value="profit-loss" className="space-y-4">
//                     {profitLossLoading ? (
//                         <div className="flex justify-center items-center h-64">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                         </div>
//                     ) : profitLossError ? (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-destructive">
//                                     <TrendingDown className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">Error loading profit & loss report</h3>
//                                     <p className="text-sm mt-2">{profitLossError.message}</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ) : profitLossData ? (
//                         <>
//                             {/* ==================== */}
//                             {/* NEW: Human-Friendly Summary */}
//                             {/* ==================== */}
//                             <div className="space-y-6">
//                                 {/* Quick Snapshot - Most Important Metrics */}
//                                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                                     {/* Business Health Card */}
//                                     <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <TrendingUp className="h-4 w-4" />
//                                                 Business Health
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="text-sm text-muted-foreground">Net Profit</span>
//                                                     <div className={`text-lg font-bold ${profitLossData.summary.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
//                                                         {formatCurrency(profitLossData.summary.netProfit)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="text-sm text-muted-foreground">Margin</span>
//                                                     <div className={`text-lg font-bold ${profitLossData.summary.netProfitMargin >= 0 ? "text-green-700" : "text-red-700"}`}>
//                                                         {profitLossData.summary.netProfitMargin.toFixed(1)}%
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     {profitLossData.summary.netProfit >= 0 ? "✓ Profitable" : "⚠ Needs Attention"}
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Revenue Efficiency Card */}
//                                     <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <DollarSign className="h-4 w-4" />
//                                                 Revenue Efficiency
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="text-sm text-muted-foreground">Revenue</span>
//                                                     <div className="text-lg font-bold text-blue-700">
//                                                         {formatCurrency(profitLossData.summary.totalRevenue)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="text-sm text-muted-foreground">Gross Profit</span>
//                                                     <div className="text-lg font-bold text-emerald-700">
//                                                         {formatCurrency(profitLossData.summary.grossProfit)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     Every ৳100 revenue → ৳{profitLossData.summary.grossProfitMargin.toFixed(0)} gross profit
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Cost Management Card */}
//                                     <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <PieChart className="h-4 w-4" />
//                                                 Cost Management
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="text-sm text-muted-foreground">Cost of Goods</span>
//                                                     <div className="text-lg font-bold text-red-700">
//                                                         {formatCurrency(profitLossData.summary.totalCostOfGoodsSold)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="text-sm text-muted-foreground">Expenses</span>
//                                                     <div className="text-lg font-bold text-orange-700">
//                                                         {formatCurrency(profitLossData.summary.totalExpenses)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     Cost is {(profitLossData.summary.totalRevenue > 0 ?
//                                                         (profitLossData.summary.totalCostOfGoodsSold / profitLossData.summary.totalRevenue * 100).toFixed(0) : 0)}% of revenue
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>

//                                     {/* Losses Card */}
//                                     <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                                 <AlertTriangle className="h-4 w-4" />
//                                                 Losses & Issues
//                                             </CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-3">
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="text-sm text-muted-foreground">Total Losses</span>
//                                                     <div className="text-lg font-bold text-red-700">
//                                                         {formatCurrency(profitLossData.summary.totalRemovalsLoss + profitLossData.summary.totalReturnsLoss)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="text-sm text-muted-foreground">Impact on Profit</span>
//                                                     <div className="text-lg font-bold text-red-700">
//                                                         {profitLossData.summary.totalRevenue > 0 ?
//                                                             ((profitLossData.summary.totalRemovalsLoss + profitLossData.summary.totalReturnsLoss) /
//                                                                 profitLossData.summary.totalRevenue * 100).toFixed(1) : 0}%
//                                                     </div>
//                                                 </div>
//                                                 <div className="text-xs text-muted-foreground pt-2 border-t">
//                                                     Losses reduce profit by {formatCurrency(profitLossData.summary.totalRemovalsLoss + profitLossData.summary.totalReturnsLoss)}
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Key Performance Indicators */}
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle className="text-lg flex items-center gap-2">
//                                             <BarChart3 className="h-5 w-5" />
//                                             Performance Summary
//                                         </CardTitle>
//                                         <CardDescription>What you earn vs. what you spend</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="grid gap-6 md:grid-cols-2">
//                                             {/* Income Side */}
//                                             <div className="space-y-4">
//                                                 <h3 className="font-medium text-green-700 flex items-center gap-2">
//                                                     <Circle className="h-3 w-3 fill-green-500" />
//                                                     Money Coming In
//                                                 </h3>
//                                                 <div className="space-y-3">
//                                                     <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
//                                                         <span className="text-sm">Total Sales</span>
//                                                         <span className="font-bold text-green-700">
//                                                             {formatCurrency(profitLossData.summary.totalRevenue)}
//                                                         </span>
//                                                     </div>
//                                                     <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
//                                                         <span className="text-sm">Gross Profit</span>
//                                                         <span className="font-bold text-emerald-700">
//                                                             {formatCurrency(profitLossData.summary.grossProfit)}
//                                                         </span>
//                                                     </div>
//                                                     <div className="text-sm text-muted-foreground pl-3">
//                                                         You keep <span className="font-medium">{profitLossData.summary.grossProfitMargin.toFixed(1)}%</span> of every sale
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Expenses Side */}
//                                             <div className="space-y-4">
//                                                 <h3 className="font-medium text-red-700 flex items-center gap-2">
//                                                     <Circle className="h-3 w-3 fill-red-500" />
//                                                     Money Going Out
//                                                 </h3>
//                                                 <div className="space-y-3">
//                                                     <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
//                                                         <span className="text-sm">Product Costs</span>
//                                                         <span className="font-bold text-red-700">
//                                                             {formatCurrency(profitLossData.summary.totalCostOfGoodsSold)}
//                                                         </span>
//                                                     </div>
//                                                     <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
//                                                         <span className="text-sm">Operating Costs</span>
//                                                         <span className="font-bold text-orange-700">
//                                                             {formatCurrency(profitLossData.summary.totalExpenses)}
//                                                         </span>
//                                                     </div>
//                                                     <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
//                                                         <span className="text-sm">Losses</span>
//                                                         <span className="font-bold text-rose-700">
//                                                             {formatCurrency(profitLossData.summary.totalRemovalsLoss + profitLossData.summary.totalReturnsLoss)}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {/* Bottom Line - Most Important */}
//                                         <div className="mt-6 pt-6 border-t">
//                                             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                                                 <div>
//                                                     <h3 className="font-medium">Bottom Line</h3>
//                                                     <p className="text-sm text-muted-foreground">
//                                                         After all costs, expenses, and losses
//                                                     </p>
//                                                 </div>
//                                                 <div className={`text-2xl md:text-3xl font-bold px-4 py-3 rounded-lg ${profitLossData.summary.netProfit >= 0 ?
//                                                     "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
//                                                     {profitLossData.summary.netProfit >= 0 ? "💰 " : "⚠ "}
//                                                     {formatCurrency(profitLossData.summary.netProfit)} Net Profit
//                                                 </div>
//                                             </div>
//                                             <div className="flex flex-wrap gap-4 mt-4 text-sm">
//                                                 <div className="flex items-center gap-2">
//                                                     <div className="h-3 w-3 rounded-full bg-green-500"></div>
//                                                     <span>You earn {profitLossData.summary.netProfitMargin.toFixed(1)}% on each sale</span>
//                                                 </div>
//                                                 {profitLossData.summary.netProfit < 0 && (
//                                                     <div className="flex items-center gap-2 text-amber-700">
//                                                         <AlertTriangle className="h-4 w-4" />
//                                                         <span>Revenue doesn't cover costs by {formatCurrency(Math.abs(profitLossData.summary.netProfit))}</span>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>

//                                 {/* Quick Insights */}
//                                 {profitLossData.summary.totalRevenue > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle className="text-lg flex items-center gap-2">
//                                                 <Lightbulb className="h-5 w-5" />
//                                                 Quick Insights
//                                             </CardTitle>
//                                             <CardDescription>Simple breakdown for better decisions</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                                                 <div className="p-4 bg-blue-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-blue-700">
//                                                         {profitLossData.summary.grossProfitMargin.toFixed(1)}%
//                                                     </div>
//                                                     <p className="text-sm mt-1">Gross Margin</p>
//                                                     <p className="text-xs text-muted-foreground mt-1">
//                                                         Your profit before expenses
//                                                     </p>
//                                                 </div>
//                                                 <div className="p-4 bg-emerald-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-emerald-700">
//                                                         {profitLossData.summary.netProfitMargin.toFixed(1)}%
//                                                     </div>
//                                                     <p className="text-sm mt-1">Net Margin</p>
//                                                     <p className="text-xs text-muted-foreground mt-1">
//                                                         Your actual profit percentage
//                                                     </p>
//                                                 </div>
//                                                 <div className="p-4 bg-orange-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-orange-700">
//                                                         {profitLossData.summary.totalRevenue > 0 ?
//                                                             (profitLossData.summary.totalExpenses / profitLossData.summary.totalRevenue * 100).toFixed(1) : 0}%
//                                                     </div>
//                                                     <p className="text-sm mt-1">Expense Ratio</p>
//                                                     <p className="text-xs text-muted-foreground mt-1">
//                                                         Operating costs vs revenue
//                                                     </p>
//                                                 </div>
//                                                 <div className="p-4 bg-rose-50 rounded-lg">
//                                                     <div className="text-2xl font-bold text-rose-700">
//                                                         {profitLossData.summary.totalRevenue > 0 ?
//                                                             ((profitLossData.summary.totalRemovalsLoss + profitLossData.summary.totalReturnsLoss) /
//                                                                 profitLossData.summary.totalRevenue * 100).toFixed(1) : 0}%
//                                                     </div>
//                                                     <p className="text-sm mt-1">Loss Ratio</p>
//                                                     <p className="text-xs text-muted-foreground mt-1">
//                                                         Money lost from issues
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 )}
//                             </div>

//                             {/* ==================== */}
//                             {/* PREVIOUS: Detailed Financial Cards */}
//                             {/* ==================== */}
//                             <div className="space-y-6 pt-6 border-t">
//                                 <h2 className="text-xl font-bold">Detailed Financial Analysis</h2>

//                                 {/* Financial Summary */}
//                                 <div className="grid gap-4 md:grid-cols-4">
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold text-green-600">
//                                                 {formatCurrency(profitLossData.summary.totalRevenue)}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-2xl font-bold text-emerald-600">
//                                                 {formatCurrency(profitLossData.summary.grossProfit)}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className={`text-2xl font-bold ${profitLossData.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
//                                                 }`}>
//                                                 {formatCurrency(profitLossData.summary.netProfit)}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className={`text-2xl font-bold ${profitLossData.summary.netProfitMargin >= 0 ? "text-green-600" : "text-red-600"
//                                                 }`}>
//                                                 {profitLossData.summary.netProfitMargin.toFixed(2)}%
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Cost & Expenses */}
//                                 <div className="grid gap-4 md:grid-cols-4">
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-red-600">
//                                                 {formatCurrency(profitLossData.summary.totalCostOfGoodsSold)}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-orange-600">
//                                                 {formatCurrency(profitLossData.summary.totalExpenses)}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-xl font-bold text-emerald-600">
//                                                 {profitLossData.summary.grossProfitMargin.toFixed(2)}%
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Operating Profit</CardTitle>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className={`text-xl font-bold ${profitLossData.summary.operatingProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
//                                                 {formatCurrency(profitLossData.summary.operatingProfit)}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Additional Losses */}
//                                 <div className="grid gap-4 md:grid-cols-2">
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Removals Loss</CardTitle>
//                                             <CardDescription className="text-xs">Loss from damaged/expired products</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-lg font-bold text-red-600">
//                                                 {formatCurrency(profitLossData.summary.totalRemovalsLoss)}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                     <Card>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-sm font-medium">Returns Loss</CardTitle>
//                                             <CardDescription className="text-xs">Loss from customer returns</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="text-lg font-bold text-red-600">
//                                                 {formatCurrency(profitLossData.summary.totalReturnsLoss)}
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </div>

//                                 {/* Monthly Trend Table */}
//                                 {profitLossData.monthlyTrend && profitLossData.monthlyTrend.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Monthly Financial Trend</CardTitle>
//                                             <CardDescription>Detailed monthly breakdown</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Month</TableHead>
//                                                         <TableHead>Revenue</TableHead>
//                                                         <TableHead>Cost</TableHead>
//                                                         <TableHead>Profit</TableHead>
//                                                         <TableHead>Margin</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {profitLossData.monthlyTrend.map((month) => (
//                                                         <TableRow key={month.month}>
//                                                             <TableCell className="font-medium">{month.month}</TableCell>
//                                                             <TableCell>{formatCurrency(month.revenue)}</TableCell>
//                                                             <TableCell className="text-red-600">{formatCurrency(month.cost)}</TableCell>
//                                                             <TableCell className={`font-medium ${month.profit >= 0 ? "text-green-600" : "text-red-600"
//                                                                 }`}>
//                                                                 {formatCurrency(month.profit)}
//                                                             </TableCell>
//                                                             <TableCell className={`${month.margin >= 0 ? "text-green-600" : "text-red-600"
//                                                                 }`}>
//                                                                 {month.margin.toFixed(2)}%
//                                                             </TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}




//                                 {/* Top Profitable Products */}
//                                 {profitLossData.topProfitableProducts && profitLossData.topProfitableProducts.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Top Profitable Products</CardTitle>
//                                             <CardDescription>Products with highest profit margin</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Product</TableHead>
//                                                         <TableHead>Revenue</TableHead>
//                                                         <TableHead>Profit</TableHead>
//                                                         <TableHead>Margin</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {profitLossData.topProfitableProducts.map((product) => (
//                                                         <TableRow key={product.productID}>
//                                                             <TableCell className="font-medium">{product.productName}</TableCell>
//                                                             <TableCell>{formatCurrency(product.revenue)}</TableCell>

//                                                             <TableCell className={`font-medium ${product.profit >= 0 ? "text-green-600" : "text-red-600"
//                                                                 }`}>
//                                                                 {formatCurrency(product.profit)}
//                                                             </TableCell>
//                                                             <TableCell className={`${product.margin >= 0 ? "text-green-600" : "text-red-600"
//                                                                 }`}>
//                                                                 {product.margin?.toFixed(2) || '0.00'}%
//                                                             </TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}

//                                 {/* Expense Breakdown */}
//                                 {profitLossData.expenseBreakdown && profitLossData.expenseBreakdown.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Expense Breakdown</CardTitle>
//                                             <CardDescription>Detailed view of expenses</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <Table>
//                                                 <TableHeader>
//                                                     <TableRow>
//                                                         <TableHead>Category</TableHead>
//                                                         <TableHead>Amount</TableHead>
//                                                         <TableHead>Percentage</TableHead>
//                                                     </TableRow>
//                                                 </TableHeader>
//                                                 <TableBody>
//                                                     {profitLossData.expenseBreakdown.map((expense) => (
//                                                         <TableRow key={expense.category}>
//                                                             <TableCell className="font-medium">{expense.category}</TableCell>
//                                                             <TableCell className="text-red-600">
//                                                                 {formatCurrency(expense.amount)}
//                                                             </TableCell>
//                                                             <TableCell>{expense.percentage?.toFixed(2) || '0.00'}%</TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </CardContent>
//                                     </Card>
//                                 )}

//                                 {/* Monthly Trend (Simplified View) */}
//                                 {profitLossData.monthlyTrend && profitLossData.monthlyTrend.length > 0 && (
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle className="text-lg flex items-center gap-2">
//                                                 <Calendar className="h-5 w-5" />
//                                                 Monthly Performance Summary
//                                             </CardTitle>
//                                             <CardDescription>Profit trend over time</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-4">
//                                                 {profitLossData.monthlyTrend.slice(-3).reverse().map((month) => (
//                                                     <div key={month.month} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
//                                                         <div>
//                                                             <div className="font-medium">{month.month}</div>
//                                                             <div className="text-sm text-muted-foreground">
//                                                                 Revenue: {formatCurrency(month.revenue)}
//                                                             </div>
//                                                         </div>
//                                                         <div className={`text-lg font-bold ${month.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
//                                                             {month.profit >= 0 ? "+" : ""}{formatCurrency(month.profit)}
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                             <div className="mt-4 text-sm text-muted-foreground">
//                                                 Last 3 months shown • {profitLossData.monthlyTrend.length} months total
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 )}
//                             </div>
//                         </>
//                     ) : (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-muted-foreground">
//                                     <TrendingUp className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">No profit & loss data available</h3>
//                                     <p className="text-sm mt-2">Select a different period to view financial data</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     )}
//                 </TabsContent>


//             </Tabs>
//         </div>
//     )
// }
// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Download, FileText, TrendingUp, TrendingDown, Package, DollarSign, Calendar, Users, ShoppingCart, AlertCircle } from "lucide-react"
// import { ReportPeriod, ReportFilters } from "@/types/dashboard"
// import { useSalesReport } from "@/hooks/use-sales-report"
// import { useInventoryReport } from "@/hooks/use-inventory-report"
// import { useProfitLossReport } from "@/hooks/use-profit-loss-report"
// import { formatCurrency, formatDate } from "@/lib/units"


// export default function Reports() {
//     const [activeTab, setActiveTab] = useState("overview")
//     const [dateFilter, setDateFilter] = useState<ReportPeriod>(ReportPeriod.THIS_MONTH)
//     const [filters, setFilters] = useState<ReportFilters>({
//         period: ReportPeriod.THIS_MONTH,
//     })
//     const [customDateRange, setCustomDateRange] = useState<{
//         from: Date | undefined;
//         to: Date | undefined;
//     }>({
//         from: undefined,
//         to: undefined,
//     })

//     // Handle date filter change
//     useEffect(() => {
//         if (dateFilter === ReportPeriod.CUSTOM) {
//             setFilters({
//                 ...filters,
//                 period: ReportPeriod.CUSTOM,
//                 startDate: customDateRange.from?.toISOString().split('T')[0],
//                 endDate: customDateRange.to?.toISOString().split('T')[0],
//             })
//         } else {
//             setFilters({
//                 ...filters,
//                 period: dateFilter,
//                 startDate: undefined,
//                 endDate: undefined,
//             })
//         }
//     }, [dateFilter, customDateRange])

//     // Sales Report
//     const {
//         salesReportData,
//         isLoading: salesLoading,
//         error: salesError,
//     } = useSalesReport(filters)

//     // Inventory Report
//     const {
//         inventoryReportData,
//         isLoading: inventoryLoading,
//         error: inventoryError,
//     } = useInventoryReport()

//     // Profit & Loss Report
//     const {
//         profitLossData,
//         isLoading: profitLossLoading,
//         error: profitLossError,
//     } = useProfitLossReport(filters)

//     // Export functions
//     const handleExportSalesCSV = async () => {
//         try {
//             const params = new URLSearchParams()
//             if (filters.period) params.append('period', filters.period)
//             if (filters.startDate) params.append('startDate', filters.startDate)
//             if (filters.endDate) params.append('endDate', filters.endDate)

//             const response = await fetch(`/api/dashboard/sales-report/export/csv?${params.toString()}`)
//             if (!response.ok) throw new Error('Failed to export')

//             const blob = await response.blob()
//             const url = window.URL.createObjectURL(blob)
//             const a = document.createElement('a')
//             a.href = url
//             a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`
//             document.body.appendChild(a)
//             a.click()
//             window.URL.revokeObjectURL(url)
//             document.body.removeChild(a)
//         } catch (error) {
//             console.error('Export failed:', error)
//             alert('Failed to export CSV')
//         }
//     }

//     const handleExportInventoryCSV = async () => {
//         try {
//             const response = await fetch('/api/dashboard/inventory-report/export/csv')
//             if (!response.ok) throw new Error('Failed to export')

//             const blob = await response.blob()
//             const url = window.URL.createObjectURL(blob)
//             const a = document.createElement('a')
//             a.href = url
//             a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`
//             document.body.appendChild(a)
//             a.click()
//             window.URL.revokeObjectURL(url)
//             document.body.removeChild(a)
//         } catch (error) {
//             console.error('Export failed:', error)
//             alert('Failed to export CSV')
//         }
//     }

//     // Format period label
//     const getPeriodLabel = (period: ReportPeriod) => {
//         const labels = {
//             [ReportPeriod.TODAY]: 'Today',
//             [ReportPeriod.YESTERDAY]: 'Yesterday',
//             [ReportPeriod.LAST_7_DAYS]: 'Last 7 Days',
//             [ReportPeriod.LAST_30_DAYS]: 'Last 30 Days',
//             [ReportPeriod.THIS_MONTH]: 'This Month',
//             [ReportPeriod.LAST_MONTH]: 'Last Month',
//             [ReportPeriod.THIS_QUARTER]: 'This Quarter',
//             [ReportPeriod.THIS_YEAR]: 'This Year',
//             [ReportPeriod.CUSTOM]: 'Custom Range',
//         }
//         return labels[period]
//     }

//     return (
//         <div className="p-6 space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold">Reports & Analytics</h1>
//                     <p className="text-muted-foreground mt-1">
//                         Comprehensive business insights and statistics
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     <div className="flex items-center gap-2">
//                         <Label>Period:</Label>
//                         <Select value={dateFilter} onValueChange={(value: ReportPeriod) => setDateFilter(value)}>
//                             <SelectTrigger className="w-48">
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {Object.values(ReportPeriod).map((period) => (
//                                     <SelectItem key={period} value={period}>
//                                         {getPeriodLabel(period)}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                     {/* {dateFilter === ReportPeriod.CUSTOM && (
//             <DateRangePicker
//               value={customDateRange}
//               onChange={setCustomDateRange}
//             />
//           )} */}
//                 </div>
//             </div>

//             <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//                 <TabsList>
//                     <TabsTrigger value="overview">Overview</TabsTrigger>
//                     <TabsTrigger value="sales">Sales Report</TabsTrigger>
//                     <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
//                     <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
//                 </TabsList>

//                 {/* Overview Tab */}
//                 <TabsContent value="overview" className="space-y-4">
//                     {/* Add overview content here if needed */}
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Dashboard Overview</CardTitle>
//                             <CardDescription>
//                                 Select a specific report tab to view detailed analytics
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <DollarSign className="h-4 w-4" />
//                                             Sales Report
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">Detailed</div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             View sales analytics
//                                         </p>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <Package className="h-4 w-4" />
//                                             Inventory Report
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">Detailed</div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             View inventory status
//                                         </p>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                                             <TrendingUp className="h-4 w-4" />
//                                             Profit & Loss
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">Detailed</div>
//                                         <p className="text-xs text-muted-foreground mt-1">
//                                             View financial performance
//                                         </p>
//                                     </CardContent>
//                                 </Card>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 {/* Sales Report Tab */}
//                 <TabsContent value="sales" className="space-y-4">
//                     {salesLoading ? (
//                         <div className="flex justify-center items-center h-64">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                         </div>
//                     ) : salesError ? (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-destructive">
//                                     <TrendingDown className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">Error loading sales report</h3>
//                                     <p className="text-sm mt-2">{salesError.message}</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ) : salesReportData ? (
//                         <>
//                             {/* Summary Cards */}
//                             <div className="grid gap-4 md:grid-cols-5">
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">{salesReportData.summary.totalSales}</div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">
//                                             {formatCurrency(salesReportData.summary.totalRevenue)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">
//                                             {salesReportData.summary.itemsSold.toFixed(2)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className={`text-2xl font-bold ${salesReportData.summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"
//                                             }`}>
//                                             {formatCurrency(salesReportData.summary.totalProfit)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">
//                                             {salesReportData.summary.profitMargin.toFixed(2)}%
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Additional Stats */}
//                             <div className="grid gap-4 md:grid-cols-3">
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-xl font-bold">
//                                             {formatCurrency(salesReportData.summary.averageOrderValue)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-xl font-bold text-orange-600">
//                                             {formatCurrency(salesReportData.summary.totalDiscount)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-xl font-bold">
//                                             {formatCurrency(salesReportData.summary.totalTax)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Sales Details Table */}
//                             <Card>
//                                 <CardHeader>
//                                     <div className="flex items-center justify-between">
//                                         <div>
//                                             <CardTitle>Sales Details</CardTitle>
//                                             <CardDescription>
//                                                 All sales for {getPeriodLabel(filters.period)} {filters.period === ReportPeriod.CUSTOM && filters.startDate ? `(${filters.startDate} to ${filters.endDate})` : ''}
//                                             </CardDescription>
//                                         </div>
//                                         <Button variant="outline" onClick={handleExportSalesCSV}>
//                                             <Download className="mr-2 h-4 w-4" />
//                                             Export CSV
//                                         </Button>
//                                     </div>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="overflow-x-auto">
//                                         <Table>
//                                             <TableHeader>
//                                                 <TableRow>
//                                                     <TableHead>Invoice</TableHead>
//                                                     <TableHead>Customer</TableHead>
//                                                     <TableHead>Phone</TableHead>
//                                                     <TableHead>Items</TableHead>
//                                                     <TableHead>Total</TableHead>
//                                                     <TableHead>Payment</TableHead>
//                                                     <TableHead>Status</TableHead>
//                                                     <TableHead>Date</TableHead>
//                                                 </TableRow>
//                                             </TableHeader>
//                                             <TableBody>
//                                                 {salesReportData.sales.length === 0 ? (
//                                                     <TableRow>
//                                                         <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                                                             No sales found for this period
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ) : (
//                                                     salesReportData.sales.map((sale) => (
//                                                         <TableRow key={sale.sellID}>
//                                                             <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
//                                                             <TableCell>{sale.customerName || "Walk-in"}</TableCell>
//                                                             <TableCell>{sale.customerPhone || "-"}</TableCell>
//                                                             <TableCell>{sale.itemsCount} items</TableCell>
//                                                             <TableCell className="font-medium">{formatCurrency(sale.total)}</TableCell>
//                                                             <TableCell>{sale.paymentMethod}</TableCell>
//                                                             <TableCell>
//                                                                 <span className={`px-2 py-1 rounded-full text-xs ${sale.paymentStatus === 'COMPLETED'
//                                                                     ? 'bg-green-100 text-green-800'
//                                                                     : 'bg-yellow-100 text-yellow-800'
//                                                                     }`}>
//                                                                     {sale.paymentStatus}
//                                                                 </span>
//                                                             </TableCell>
//                                                             <TableCell>{formatDate(sale.createdAt)}</TableCell>
//                                                         </TableRow>
//                                                     ))
//                                                 )}
//                                             </TableBody>
//                                         </Table>
//                                     </div>
//                                 </CardContent>
//                             </Card>

//                             {/* Top Products */}
//                             {salesReportData.topProducts && salesReportData.topProducts.length > 0 && (
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Top Selling Products</CardTitle>
//                                         <CardDescription>Best performing products by revenue</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <Table>
//                                             <TableHeader>
//                                                 <TableRow>
//                                                     <TableHead>Product</TableHead>
//                                                     <TableHead>Quantity Sold</TableHead>
//                                                     <TableHead>Revenue</TableHead>
//                                                 </TableRow>
//                                             </TableHeader>
//                                             <TableBody>
//                                                 {salesReportData.topProducts.map((product) => (
//                                                     <TableRow key={product.productID}>
//                                                         <TableCell className="font-medium">{product.productName}</TableCell>
//                                                         <TableCell>{product.quantity}</TableCell>
//                                                         <TableCell>{formatCurrency(product.revenue)}</TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                     </CardContent>
//                                 </Card>
//                             )}

//                             {/* Category Breakdown */}
//                             {salesReportData.categoryBreakdown && salesReportData.categoryBreakdown.length > 0 && (
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Category Performance</CardTitle>
//                                         <CardDescription>Sales breakdown by product category</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <Table>
//                                             <TableHeader>
//                                                 <TableRow>
//                                                     <TableHead>Category</TableHead>
//                                                     <TableHead>Revenue</TableHead>
//                                                     <TableHead>Percentage</TableHead>
//                                                 </TableRow>
//                                             </TableHeader>
//                                             <TableBody>
//                                                 {salesReportData.categoryBreakdown.map((category) => (
//                                                     <TableRow key={category.categoryID}>
//                                                         <TableCell className="font-medium">{category.categoryName}</TableCell>
//                                                         <TableCell>{formatCurrency(category.revenue)}</TableCell>
//                                                         <TableCell>{category.percentage.toFixed(2)}%</TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                     </CardContent>
//                                 </Card>
//                             )}
//                         </>
//                     ) : (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-muted-foreground">
//                                     <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">No sales data available</h3>
//                                     <p className="text-sm mt-2">Select a different period or check your data</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     )}
//                 </TabsContent>

//                 {/* Inventory Report Tab */}
//                 <TabsContent value="inventory" className="space-y-4">
//                     {inventoryLoading ? (
//                         <div className="flex justify-center items-center h-64">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                         </div>
//                     ) : inventoryError ? (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-destructive">
//                                     <Package className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">Error loading inventory report</h3>
//                                     <p className="text-sm mt-2">{inventoryError.message}</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ) : inventoryReportData ? (
//                         <>
//                             {/* Summary Cards */}
//                             <div className="grid gap-4 md:grid-cols-4">
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Total Products</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">{inventoryReportData.summary.totalProducts}</div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">
//                                             {formatCurrency(inventoryReportData.summary.inventoryValue)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold text-orange-600">
//                                             {inventoryReportData.summary.lowStockProducts}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold text-red-600">
//                                             {inventoryReportData.summary.outOfStockProducts}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Inventory Details Table */}
//                             <Card>
//                                 <CardHeader>
//                                     <div className="flex items-center justify-between">
//                                         <div>
//                                             <CardTitle>Inventory Details</CardTitle>
//                                             <CardDescription>All products with current stock levels</CardDescription>
//                                         </div>
//                                         <Button variant="outline" onClick={handleExportInventoryCSV}>
//                                             <Download className="mr-2 h-4 w-4" />
//                                             Export CSV
//                                         </Button>
//                                     </div>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="overflow-x-auto">
//                                         <Table>
//                                             <TableHeader>
//                                                 <TableRow>
//                                                     <TableHead>SKU</TableHead>
//                                                     <TableHead>Product</TableHead>
//                                                     <TableHead>Category</TableHead>
//                                                     <TableHead>Stock</TableHead>
//                                                     <TableHead>Threshold</TableHead>
//                                                     <TableHead>Purchase Price</TableHead>
//                                                     <TableHead>Selling Price</TableHead>
//                                                     <TableHead>Inventory Value</TableHead>
//                                                     <TableHead>Status</TableHead>
//                                                 </TableRow>
//                                             </TableHeader>
//                                             <TableBody>
//                                                 {inventoryReportData.products.length === 0 ? (
//                                                     <TableRow>
//                                                         <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
//                                                             No products found
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ) : (
//                                                     inventoryReportData.products.map((product) => (
//                                                         <TableRow key={product.productID}>
//                                                             <TableCell className="font-medium">{product.sku}</TableCell>
//                                                             <TableCell>{product.name}</TableCell>
//                                                             <TableCell>{product.categoryName}</TableCell>
//                                                             <TableCell className={
//                                                                 product.isOutOfStock ? "text-red-600" :
//                                                                     product.isLowStock ? "text-orange-600" : ""
//                                                             }>
//                                                                 {product.stockQuantity}
//                                                             </TableCell>
//                                                             <TableCell>{product.lowStockThreshold}</TableCell>
//                                                             <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
//                                                             <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
//                                                             <TableCell>{formatCurrency(product.inventoryValue)}</TableCell>
//                                                             <TableCell>
//                                                                 <span className={`px-2 py-1 rounded-full text-xs ${product.isOutOfStock
//                                                                     ? 'bg-red-100 text-red-800'
//                                                                     : product.isLowStock
//                                                                         ? 'bg-orange-100 text-orange-800'
//                                                                         : 'bg-green-100 text-green-800'
//                                                                     }`}>
//                                                                     {product.isOutOfStock ? 'Out of Stock' :
//                                                                         product.isLowStock ? 'Low Stock' : 'In Stock'}
//                                                                 </span>
//                                                             </TableCell>
//                                                         </TableRow>
//                                                     ))
//                                                 )}
//                                             </TableBody>
//                                         </Table>
//                                     </div>
//                                 </CardContent>
//                             </Card>

//                             {/* Low Stock Products */}
//                             {inventoryReportData.lowStockProducts && inventoryReportData.lowStockProducts.length > 0 && (
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Low Stock Alert</CardTitle>
//                                         <CardDescription>Products that need immediate restocking</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <Table>
//                                             <TableHeader>
//                                                 <TableRow>
//                                                     <TableHead>Product</TableHead>
//                                                     <TableHead>SKU</TableHead>
//                                                     <TableHead>Current Stock</TableHead>
//                                                     <TableHead>Threshold</TableHead>
//                                                     <TableHead>Difference</TableHead>
//                                                 </TableRow>
//                                             </TableHeader>
//                                             <TableBody>
//                                                 {inventoryReportData.lowStockProducts.map((product) => (
//                                                     <TableRow key={product.productID}>
//                                                         <TableCell className="font-medium">{product.name}</TableCell>
//                                                         <TableCell>{product.sku}</TableCell>
//                                                         <TableCell className="text-orange-600">{product.stockQuantity}</TableCell>
//                                                         <TableCell>{product.lowStockThreshold}</TableCell>
//                                                         <TableCell className="text-red-600">
//                                                             {product.lowStockThreshold - product.stockQuantity}
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                     </CardContent>
//                                 </Card>
//                             )}
//                         </>
//                     ) : (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-muted-foreground">
//                                     <Package className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">No inventory data available</h3>
//                                     <p className="text-sm mt-2">Check your product data</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     )}
//                 </TabsContent>

//                 {/* Profit & Loss Tab */}
//                 <TabsContent value="profit-loss" className="space-y-4">
//                     {profitLossLoading ? (
//                         <div className="flex justify-center items-center h-64">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                         </div>
//                     ) : profitLossError ? (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-destructive">
//                                     <TrendingDown className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">Error loading profit & loss report</h3>
//                                     <p className="text-sm mt-2">{profitLossError.message}</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ) : profitLossData ? (
//                         <>
//                             {/* Financial Summary */}
//                             <div className="grid gap-4 md:grid-cols-4">
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold text-green-600">
//                                             {formatCurrency(profitLossData.summary.totalRevenue)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold text-emerald-600">
//                                             {formatCurrency(profitLossData.summary.grossProfit)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className={`text-2xl font-bold ${profitLossData.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
//                                             }`}>
//                                             {formatCurrency(profitLossData.summary.netProfit)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className={`text-2xl font-bold ${profitLossData.summary.netProfitMargin >= 0 ? "text-green-600" : "text-red-600"
//                                             }`}>
//                                             {profitLossData.summary.netProfitMargin.toFixed(2)}%
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Cost & Expenses */}
//                             <div className="grid gap-4 md:grid-cols-3">
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-xl font-bold text-red-600">
//                                             {formatCurrency(profitLossData.summary.totalCostOfGoodsSold)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-xl font-bold text-orange-600">
//                                             {formatCurrency(profitLossData.summary.totalExpenses)}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardHeader className="pb-3">
//                                         <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-xl font-bold text-emerald-600">
//                                             {profitLossData.summary.grossProfitMargin.toFixed(2)}%
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Monthly Trend */}
//                             {profitLossData.monthlyTrend && profitLossData.monthlyTrend.length > 0 && (
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Monthly Trend</CardTitle>
//                                         <CardDescription>Profit and loss over time</CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <Table>
//                                             <TableHeader>
//                                                 <TableRow>
//                                                     <TableHead>Month</TableHead>
//                                                     <TableHead>Revenue</TableHead>
//                                                     <TableHead>Cost</TableHead>
//                                                     <TableHead>Profit</TableHead>
//                                                     <TableHead>Margin</TableHead>
//                                                 </TableRow>
//                                             </TableHeader>
//                                             <TableBody>
//                                                 {profitLossData.monthlyTrend.map((month) => (
//                                                     <TableRow key={month.month}>
//                                                         <TableCell className="font-medium">{month.month}</TableCell>
//                                                         <TableCell>{formatCurrency(month.revenue)}</TableCell>
//                                                         <TableCell className="text-red-600">{formatCurrency(month.cost)}</TableCell>
//                                                         <TableCell className={`font-medium ${month.profit >= 0 ? "text-green-600" : "text-red-600"
//                                                             }`}>
//                                                             {formatCurrency(month.profit)}
//                                                         </TableCell>
//                                                         <TableCell className={`${month.margin >= 0 ? "text-green-600" : "text-red-600"
//                                                             }`}>
//                                                             {month.margin.toFixed(2)}%
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                     </CardContent>
//                                 </Card>
//                             )}
//                         </>
//                     ) : (
//                         <Card>
//                             <CardContent className="pt-6">
//                                 <div className="text-center text-muted-foreground">
//                                     <TrendingUp className="h-12 w-12 mx-auto mb-4" />
//                                     <h3 className="text-lg font-semibold">No profit & loss data available</h3>
//                                     <p className="text-sm mt-2">Select a different period to view financial data</p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     )}
//                 </TabsContent>
//             </Tabs>
//         </div>
//     )
// }