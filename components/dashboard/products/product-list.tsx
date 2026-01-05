"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Package, AlertTriangle, DollarSign, TrendingUp, Loader2, Eye, ChevronLeft, ChevronRight, Printer } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { useDelete } from "@/hooks/useDelete"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { BarcodePrint } from "./barcode-print"

interface ProductListProps {
  onEdit?: (item: any) => void
  onView?: (item: any) => void
  refresh?: number
}

export function ProductList({ onEdit, onView, refresh }: ProductListProps) {
  // const [searchTerm, setSearchTerm] = useState("")
  // const [currentPage, setCurrentPage] = useState(1)
  // const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // State for barcode printing
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // Use products hook with debounced search and pagination
  const { products, meta, isLoading, refetch, setSearchTerm, searchTerm, itemsPerPage, setItemsPerPage, currentPage, setCurrentPage } = useProducts()

  // Delete mutation
  const { mutate: deleteProduct, isPending: isDeleting } = useDelete(
    "/products",
    ["products", currentPage, itemsPerPage, debouncedSearch],
    {
      successMessage: "Product deleted successfully!",
      errorMessage: "Failed to delete product",
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

  // Use statistics from meta or calculate locally
  const statistics = meta?.statistics
  const totalProducts = statistics?.totalProducts || meta?.totalItems || 0
  const lowStockProducts = statistics?.lowStockProducts || products.filter((p) => p.isLowStock).length
  const inventoryValue = statistics?.inventoryValue || products.reduce((sum, p) => sum + (p.purchasePrice * p.stockQuantity), 0)
  const potentialRevenue = statistics?.potentialRevenue || products.reduce((sum, p) => sum + (p.sellingPrice * p.stockQuantity), 0)

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
    if (!confirm("Are you sure you want to delete this product?")) return
    deleteProduct(id)
  }

  // Handle print barcode
  const handlePrintBarcode = (product: any) => {
    if (!product.barcode) {
      toast.error("No barcode available for this product")
      return
    }
    setSelectedProduct(product)
    setShowPrintDialog(true)
  }

  // Calculate serial number based on page and index
  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * itemsPerPage + index + 1
  }

  // Format profit margin with color
  const formatProfitMargin = (margin: number) => {
    if (margin < 0) {
      return <span className="text-red-600 font-medium">{margin.toFixed(2)}%</span>
    } else if (margin < 10) {
      return <span className="text-orange-500 font-medium">{margin.toFixed(2)}%</span>
    } else if (margin < 20) {
      return <span className="text-yellow-600 font-medium">{margin.toFixed(2)}%</span>
    } else {
      return <span className="text-green-600 font-medium">{margin.toFixed(2)}%</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {statistics?.activeProducts ? `${statistics.activeProducts} active` : 'Active in inventory'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Products below threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Total purchase value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">৳{potentialRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Total selling value</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>All Products</CardTitle>
                <CardDescription>Manage your product inventory</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
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
          {isLoading && products.length === 0 ? (
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
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Purchase</TableHead>
                      <TableHead className="text-right">Selling</TableHead>
                      <TableHead className="text-center">Profit Margin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground h-32">
                          {searchTerm ? `No products found matching "${searchTerm}"` : `No products found`}
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product, index) => (
                        <TableRow key={product.productID}>
                          <TableCell className="font-medium text-center">
                            {getSerialNumber(index)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.sku}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{product.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {product.unit} • {product.barcode || "No barcode"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {product?.categoryName || "-"}
                          </TableCell>
                          <TableCell>
                            {product?.brandName || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-medium">{product.stockQuantity}</span>
                              <span className="text-xs text-muted-foreground">
                                Low: {product.lowStockThreshold}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-medium">৳{product.purchasePrice.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground">
                                Value: ৳{(product.purchasePrice * product.stockQuantity).toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-medium">৳{product.sellingPrice.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground">
                                Value: ৳{(product.sellingPrice * product.stockQuantity).toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {product.profitMargin !== undefined ? formatProfitMargin(product.profitMargin) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={product.isLowStock ? "destructive" : "default"}
                              className={`${product.isLowStock ? "" : product.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "bg-gray-500 hover:bg-gray-600"}`}
                            >
                              {product.isLowStock ? "Low Stock" : product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              {onView && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onView(product)}
                                  disabled={isDeleting || isLoading}
                                  className="h-8 w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              {/* Print Barcode Button */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePrintBarcode(product)}
                                disabled={!product.barcode || isDeleting || isLoading}
                                className="h-8 w-8 p-0"
                                title="Print Barcode"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              {onEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onEdit(product)}
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
                                onClick={() => handleDelete(product.productID)}
                                disabled={isDeleting || isLoading}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                title="Delete"
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

      {/* Barcode Print Dialog */}
      {selectedProduct && (
        <BarcodePrint
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
          productName={selectedProduct.name}
          productSku={selectedProduct.sku}
          barcode={selectedProduct.barcode}
          productPrice={selectedProduct.sellingPrice.toString()}
          onPrintComplete={() => {
            console.log("Barcode print completed for:", selectedProduct.name)
          }}
        />
      )}
    </div>
  )
}