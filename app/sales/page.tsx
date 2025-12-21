"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { saleStorage, productStorage, categoryStorage, brandStorage, type Sale, type Product } from "@/lib/localStorage"
import { getDateRange, formatDateRange } from "@/lib/dateUtils"
import { exportSalesToCSV, exportSalesToPDF } from "@/lib/exportUtils"
import {
  Search,
  Download,
  FileText,
  TrendingUp,
  ShoppingCart,
  Banknote,
  Package,
  Calendar,
  Filter,
  Eye,
  X,
} from "lucide-react"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("today")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  useEffect(() => {
    setSales(saleStorage.getAll())
    setProducts(productStorage.getAll())
    setCategories(categoryStorage.getAll())
    setBrands(brandStorage.getAll())
  }, [])

  // Filter sales based on all criteria
  const filteredSales = useMemo(() => {
    let filtered = sales

    // Date filter
    const { startDate, endDate } = getDateRange(
      dateFilter,
      customStartDate ? new Date(customStartDate) : undefined,
      customEndDate ? new Date(customEndDate) : undefined,
    )
    filtered = filtered.filter((sale) => {
      const saleDate = new Date(sale.createdAt)
      return saleDate >= startDate && saleDate <= endDate
    })

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((sale) =>
        sale.items.some((item) => {
          const product = products.find((p) => p.id === item.productId)
          return product?.category === categoryFilter
        }),
      )
    }

    // Brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter((sale) =>
        sale.items.some((item) => {
          const product = products.find((p) => p.id === item.productId)
          return product?.brand === brandFilter
        }),
      )
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (sale) =>
          sale.invoiceNumber.toLowerCase().includes(query) ||
          sale.customerName?.toLowerCase().includes(query) ||
          sale.customerPhone?.includes(query),
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [sales, products, dateFilter, categoryFilter, brandFilter, searchQuery, customStartDate, customEndDate])

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSales = filteredSales.length
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
    const totalDiscount = filteredSales.reduce((sum, sale) => sum + sale.discount, 0)
    const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax, 0)
    const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items.reduce((s, i) => s + i.quantity, 0), 0)
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

    return {
      totalSales,
      totalRevenue,
      totalDiscount,
      totalTax,
      totalItems,
      avgSaleValue,
    }
  }, [filteredSales])

  const handleExportCSV = () => {
    exportSalesToCSV(filteredSales, "sales-report")
  }

  const handleExportPDF = () => {
    exportSalesToPDF(filteredSales, "sales-report", statistics)
  }

  const clearFilters = () => {
    setDateFilter("today")
    setCategoryFilter("all")
    setBrandFilter("all")
    setSearchQuery("")
    setCustomStartDate("")
    setCustomEndDate("")
  }

  const hasActiveFilters = dateFilter !== "today" || categoryFilter !== "all" || brandFilter !== "all" || searchQuery

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
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

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalSales}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dateFilter === "today"
                      ? "Today"
                      : dateFilter === "custom"
                        ? formatDateRange(new Date(customStartDate), new Date(customEndDate))
                        : dateFilter.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳{statistics.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: ৳{statistics.avgSaleValue.toFixed(2)} per sale
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalItems}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total products quantity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳{statistics.totalDiscount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Tax: ৳{statistics.totalTax.toFixed(2)}</p>
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brand</label>
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.name}>
                            {brand.name}
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
                        placeholder="Invoice, customer..."
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
                      <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sales Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sales History ({filteredSales.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            No sales found for the selected filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{new Date(sale.createdAt).toLocaleDateString()}</div>
                                <div className="text-muted-foreground">
                                  {new Date(sale.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{sale.customerName || "Walk-in Customer"}</div>
                                {sale.customerPhone && (
                                  <div className="text-muted-foreground">{sale.customerPhone}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{sale.items.length} items</Badge>
                            </TableCell>
                            <TableCell>৳{sale.subtotal.toFixed(2)}</TableCell>
                            <TableCell>৳{sale.discount.toFixed(2)}</TableCell>
                            <TableCell>৳{sale.tax.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">৳{sale.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  sale.paymentMethod === "cash"
                                    ? "default"
                                    : sale.paymentMethod === "card"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {sale.paymentMethod}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sale Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSale(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-semibold">{selectedSale.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">{new Date(selectedSale.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-semibold">{selectedSale.customerName || "Walk-in"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Phone</p>
                  <p className="font-semibold">{selectedSale.customerPhone || "-"}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Items Purchased</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>৳{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">৳{item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Payment Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>৳{selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-৳{selectedSale.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>৳{selectedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>৳{selectedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge>{selectedSale.paymentMethod}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Received</span>
                  <span>৳{selectedSale.receivedAmount.toFixed(2)}</span>
                </div>
                {selectedSale.changeAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Change</span>
                    <span>৳{selectedSale.changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
