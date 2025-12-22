"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  purchaseStorage,
  purchaseSpecificStorage,
  productStorage,
  supplierStorage,
  type Purchase,
  type Product,
  type Supplier,
  type PurchaseItem,
} from "@/lib/localStorage"
import { convertToBaseUnit, getUnitShortName } from "@/lib/units"
import { Search, Plus, Trash2, ShoppingBag, Package, DollarSign, TrendingUp, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("all")
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    supplierId: "",
    supplierName: "",
    paymentMethod: "Cash",
    discount: 0,
    tax: 0,
    notes: "",
  })

  const [cartItems, setCartItems] = useState<PurchaseItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setPurchases(purchaseStorage.getAll())
    setProducts(productStorage.getAll())
    setSuppliers(supplierStorage.getAll())
  }

  const addToCart = () => {
    if (!selectedProduct || !quantity || !unitPrice) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const qty = Number.parseFloat(quantity)
    const price = Number.parseFloat(unitPrice)
    const subtotal = qty * price

    const item: PurchaseItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      unit: product.unit,
      unitPrice: price,
      subtotal,
    }

    setCartItems([...cartItems, item])
    setSelectedProduct("")
    setQuantity("")
    setUnitPrice("")
  }

  const removeFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
    const discountAmount = (subtotal * formData.discount) / 100
    const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100
    const total = subtotal - discountAmount + taxAmount
    return { subtotal, discountAmount, taxAmount, total }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      toast({
        title: "Empty purchase",
        description: "Please add at least one product",
        variant: "destructive",
      })
      return
    }

    if (!formData.supplierId) {
      toast({
        title: "Missing supplier",
        description: "Please select a supplier",
        variant: "destructive",
      })
      return
    }

    const supplier = suppliers.find((s) => s.id === formData.supplierId)
    const { subtotal, discountAmount, taxAmount, total } = calculateTotals()

    const purchase: Omit<Purchase, "id" | "createdAt" | "updatedAt"> = {
      purchaseNumber: purchaseSpecificStorage.generatePurchaseNumber(),
      supplierId: formData.supplierId,
      supplierName: supplier?.name || "",
      items: cartItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      createdBy: "Current User",
    }

    purchaseStorage.add(purchase)

    // Update stock quantities
    cartItems.forEach((item) => {
      const product = productStorage.getById(item.productId)
      if (product) {
        const baseQuantity = convertToBaseUnit(item.quantity, item.unit)
        productStorage.update(product.id, {
          stockQuantity: product.stockQuantity + baseQuantity,
        })
      }
    })

    toast({
      title: "Purchase completed",
      description: `Purchase ${purchase.purchaseNumber} has been added successfully`,
    })

    resetForm()
    loadData()
  }

  const resetForm = () => {
    setFormData({
      supplierId: "",
      supplierName: "",
      paymentMethod: "Cash",
      discount: 0,
      tax: 0,
      notes: "",
    })
    setCartItems([])
  }

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals()

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSupplier = selectedSupplier === "all" || !selectedSupplier || purchase.supplierId === selectedSupplier
    return matchesSearch && matchesSupplier
  })

  const stats = {
    totalPurchases: purchases.length,
    totalAmount: purchases.reduce((sum, p) => sum + p.total, 0),
    todayPurchases: purchaseSpecificStorage.getTodayPurchases().length,
    todayAmount: purchaseSpecificStorage.getTodayPurchases().reduce((sum, p) => sum + p.total, 0),
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Purchase Management</h1>
                <p className="text-muted-foreground mt-1">Manage inventory purchases and suppliers</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Total Purchases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPurchases}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳{stats.totalAmount.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Today Purchases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayPurchases}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Today Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳{stats.todayAmount.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">All Purchases</TabsTrigger>
                <TabsTrigger value="add">New Purchase</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle>Purchase History</CardTitle>
                        <CardDescription>View all purchases and their details</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative w-64">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search purchases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Suppliers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Suppliers</SelectItem>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Purchase No.</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPurchases.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              No purchases found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPurchases.map((purchase) => (
                            <TableRow key={purchase.id}>
                              <TableCell className="font-medium">{purchase.purchaseNumber}</TableCell>
                              <TableCell>{purchase.supplierName}</TableCell>
                              <TableCell>{purchase.items.length} items</TableCell>
                              <TableCell className="font-medium">৳{purchase.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{purchase.paymentMethod}</Badge>
                              </TableCell>
                              <TableCell>{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => setViewingPurchase(purchase)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
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
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Add Products</CardTitle>
                      <CardDescription>Select products and quantities for purchase</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <Label>Product</Label>
                          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Unit Price (৳)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <Button onClick={addToCart} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Purchase
                      </Button>

                      <div className="border rounded-lg p-4 space-y-2">
                        <h3 className="font-medium">Purchase Items</h3>
                        {cartItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Subtotal</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cartItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {item.productName}
                                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                                  </TableCell>
                                  <TableCell>
                                    {item.quantity} {getUnitShortName(item.unit)}
                                  </TableCell>
                                  <TableCell>৳{item.unitPrice.toFixed(2)}</TableCell>
                                  <TableCell className="font-medium">৳{item.subtotal.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(index)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Purchase Details</CardTitle>
                      <CardDescription>Complete the purchase information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Supplier *</Label>
                          <Select
                            value={formData.supplierId}
                            onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Payment Method</Label>
                          <Select
                            value={formData.paymentMethod}
                            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Card">Card</SelectItem>
                              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                              <SelectItem value="Credit">Credit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Discount (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.discount}
                            onChange={(e) =>
                              setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tax (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.tax}
                            onChange={(e) => setFormData({ ...formData, tax: Number.parseFloat(e.target.value) || 0 })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes..."
                            rows={3}
                          />
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>৳{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount:</span>
                            <span>-৳{discountAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>৳{taxAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span>৳{total.toFixed(2)}</span>
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={cartItems.length === 0}>
                          Complete Purchase
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
          </DialogHeader>
          {viewingPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Purchase Number</p>
                  <p className="font-medium">{viewingPurchase.purchaseNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Supplier</p>
                  <p className="font-medium">{viewingPurchase.supplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(viewingPurchase.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{viewingPurchase.paymentMethod}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingPurchase.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.productName}
                          <div className="text-xs text-muted-foreground">{item.sku}</div>
                        </TableCell>
                        <TableCell>
                          {item.quantity} {getUnitShortName(item.unit)}
                        </TableCell>
                        <TableCell>৳{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>৳{item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{viewingPurchase.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-৳{viewingPurchase.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>৳{viewingPurchase.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>৳{viewingPurchase.total.toFixed(2)}</span>
                </div>
              </div>

              {viewingPurchase.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm">{viewingPurchase.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
