"use client"

import { useState, useEffect } from "react"
import { type Product, productStorage } from "@/lib/localStorage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Package, FileDown, FileText, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"
import { ProductForm } from "@/components/product-form"
import { exportToCSV, exportToPDF } from "@/lib/exportUtils"

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const loadProducts = () => {
    const allProducts = productStorage.getAll()
    setProducts(allProducts)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products

  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length
  const totalInventoryValue = products.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0)
  const totalSellingValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0)

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      productStorage.delete(id)
      loadProducts()
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleSuccess = () => {
    loadProducts()
    setEditingProduct(null)
  }

  const handleExportCSV = () => {
    exportToCSV(filteredProducts, `products-${new Date().toISOString().split("T")[0]}.csv`)
  }

  const handleExportPDF = () => {
    exportToPDF(filteredProducts, `products-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  if (editingProduct) {
    return (
      <ProductForm editProduct={editingProduct} onSuccess={handleSuccess} onCancel={() => setEditingProduct(null)} />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active in inventory</p>
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
            <div className="text-2xl font-bold">৳{totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total purchase value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">৳{totalSellingValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total selling value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Manage your product inventory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, category, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2 bg-transparent">
                <FileDown className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No products found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search query" : "Add your first product to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Purchase Price</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const isLowStock = product.stockQuantity <= product.lowStockThreshold
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.sku}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell className="text-right">৳{product.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">৳{product.sellingPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.stockQuantity}</TableCell>
                        <TableCell>
                          <Badge
                            variant={isLowStock ? "destructive" : "default"}
                            className={isLowStock ? "" : "bg-emerald-500 hover:bg-emerald-600"}
                          >
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
