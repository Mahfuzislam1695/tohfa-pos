"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Filter, Maximize2, Minimize2, ShoppingCart, Trash2, Plus, Minus, X, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  type Product,
  productStorage,
  categoryStorage,
  brandStorage,
  saleStorage,
  saleSpecificStorage,
  productSpecificStorage,
  type SaleItem,
} from "@/lib/localStorage"
import { cn } from "@/lib/utils"
import { PREDEFINED_UNITS, canConvertUnit, convertQuantity, getUnitByShortName } from "@/lib/units"

interface ExtendedSaleItem extends SaleItem {
  saleUnit: string // The unit being sold (e.g., "ml" when selling from "l")
  saleQuantity: number // The quantity in sale unit (e.g., 200 ml)
  baseQuantity: number // The quantity in product's base unit (e.g., 0.2 l)
}

export default function POSPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [cart, setCart] = useState<ExtendedSaleItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [showQuantityDialog, setShowQuantityDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [customQuantity, setCustomQuantity] = useState("")
  const [customUnit, setCustomUnit] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [receivedAmount, setReceivedAmount] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setProducts(productStorage.getAll())
    setCategories(categoryStorage.getAll())
    setBrands(brandStorage.getAll())
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesBrand = selectedBrand === "all" || product.brand === selectedBrand
    return matchesSearch && matchesCategory && matchesBrand && product.stockQuantity > 0
  })

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const addToCart = (product: Product) => {
    setSelectedProduct(product)
    setCustomUnit(product.unit) // Default to product's unit
    setCustomQuantity("1")
    setShowQuantityDialog(true)
  }

  const confirmAddToCart = () => {
    if (!selectedProduct) return

    const qty = Number.parseFloat(customQuantity)
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid quantity")
      return
    }

    // Convert to base unit for stock checking
    const baseQty = convertQuantity(qty, customUnit, selectedProduct.unit) || qty

    // Check stock
    if (baseQty > selectedProduct.stockQuantity) {
      alert("Insufficient stock!")
      return
    }

    const existingItem = cart.find((item) => item.productId === selectedProduct.id && item.saleUnit === customUnit)
    const productUnit = getUnitByShortName(selectedProduct.unit)

    if (existingItem) {
      const newSaleQty = existingItem.saleQuantity + qty
      const newBaseQty = convertQuantity(newSaleQty, customUnit, selectedProduct.unit) || newSaleQty

      if (newBaseQty > selectedProduct.stockQuantity) {
        alert("Insufficient stock!")
        return
      }

      setCart(
        cart.map((item) =>
          item.productId === selectedProduct.id && item.saleUnit === customUnit
            ? {
              ...item,
              saleQuantity: newSaleQty,
              baseQuantity: newBaseQty,
              quantity: newBaseQty,
              subtotal: newBaseQty * item.unitPrice,
            }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          sku: selectedProduct.sku,
          quantity: baseQty, // Base unit quantity for backend
          unitPrice: selectedProduct.sellingPrice,
          subtotal: baseQty * selectedProduct.sellingPrice,
          saleUnit: customUnit,
          saleQuantity: qty,
          baseQuantity: baseQty,
        },
      ])
    }

    setShowQuantityDialog(false)
    setSelectedProduct(null)
    setCustomQuantity("")
  }

  const updateQuantity = (productId: string, saleUnit: string, change: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setCart(
      cart
        .map((item) => {
          if (item.productId === productId && item.saleUnit === saleUnit) {
            const newSaleQty = item.saleQuantity + change
            if (newSaleQty <= 0) return null

            const newBaseQty = convertQuantity(newSaleQty, saleUnit, product.unit) || newSaleQty
            if (newBaseQty > product.stockQuantity) return item

            return {
              ...item,
              saleQuantity: newSaleQty,
              baseQuantity: newBaseQty,
              quantity: newBaseQty,
              subtotal: newBaseQty * item.unitPrice,
            }
          }
          return item
        })
        .filter((item): item is ExtendedSaleItem => item !== null),
    )
  }

  const removeFromCart = (productId: string, saleUnit: string) => {
    setCart(cart.filter((item) => !(item.productId === productId && item.saleUnit === saleUnit)))
  }

  const clearCart = () => {
    setCart([])
  }

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const total = subtotal - discountAmount + taxAmount
  const receivedAmountNum = Number.parseFloat(receivedAmount) || 0
  const changeAmount = Math.max(0, receivedAmountNum - total)

  const handleCheckout = () => {
    if (cart.length === 0) return
    if (paymentMethod === "cash" && receivedAmountNum < total) {
      alert("Received amount is less than total amount!")
      return
    }

    // Create sale with base quantities
    const sale = saleStorage.add({
      invoiceNumber: saleSpecificStorage.generateInvoiceNumber(),
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "",
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.baseQuantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod,
      receivedAmount: paymentMethod === "cash" ? receivedAmountNum : total,
      changeAmount: paymentMethod === "cash" ? changeAmount : 0,
      createdBy: "Admin",
    })

    // Update stock with base quantities
    cart.forEach((item) => {
      productSpecificStorage.updateStock(item.productId, item.baseQuantity)
    })

    printReceipt(sale, cart)

    // Reset
    setCart([])
    setCustomerName("")
    setCustomerPhone("")
    setDiscount(0)
    setTax(0)
    setReceivedAmount("")
    setShowCheckout(false)
    loadData()
  }

  const printReceipt = (sale: any, cartItems: ExtendedSaleItem[]) => {
    const receiptWindow = window.open("", "_blank")
    if (!receiptWindow) return

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.invoiceNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            h2 { text-align: center; margin: 10px 0; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .bold { font-weight: bold; }
            .center { text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 5px 0; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <h2>TOHFA POS SYSTEM</h2>
          <div class="center">Sale Receipt</div>
          <div class="line"></div>
          <div class="row"><span>Invoice:</span><span>${sale.invoiceNumber}</span></div>
          <div class="row"><span>Date:</span><span>${new Date(sale.createdAt).toLocaleString()}</span></div>
          <div class="row"><span>Customer:</span><span>${sale.customerName}</span></div>
          ${sale.customerPhone ? `<div class="row"><span>Phone:</span><span>${sale.customerPhone}</span></div>` : ""}
          <div class="line"></div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="right">Qty</th>
                <th class="right">Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cartItems
        .map(
          (item: ExtendedSaleItem) => `
                <tr>
                  <td>${item.productName}</td>
                  <td class="right">${item.saleQuantity} ${item.saleUnit}</td>
                  <td class="right">৳${item.unitPrice.toFixed(2)}</td>
                  <td class="right">৳${item.subtotal.toFixed(2)}</td>
                </tr>
              `,
        )
        .join("")}
            </tbody>
          </table>
          <div class="line"></div>
          <div class="row"><span>Subtotal:</span><span>৳${sale.subtotal.toFixed(2)}</span></div>
          ${sale.discount > 0 ? `<div class="row"><span>Discount:</span><span>-৳${sale.discount.toFixed(2)}</span></div>` : ""}
          ${sale.tax > 0 ? `<div class="row"><span>Tax:</span><span>৳${sale.tax.toFixed(2)}</span></div>` : ""}
          <div class="line"></div>
          <div class="row bold"><span>TOTAL:</span><span>৳${sale.total.toFixed(2)}</span></div>
          ${sale.paymentMethod === "cash"
        ? `
            <div class="row"><span>Received:</span><span>৳${sale.receivedAmount.toFixed(2)}</span></div>
            <div class="row"><span>Change:</span><span>৳${sale.changeAmount.toFixed(2)}</span></div>
          `
        : ""
      }
          <div class="row"><span>Payment:</span><span>${sale.paymentMethod.toUpperCase()}</span></div>
          <div class="line"></div>
          <div class="center">Thank you for your business!</div>
          <script>window.print(); window.onafterprint = () => window.close();</script>
        </body>
      </html>
    `)
    receiptWindow.document.close()
  }

  const getCompatibleUnits = (productUnit: string) => {
    const productUnitDef = getUnitByShortName(productUnit)
    if (!productUnitDef) return [productUnitDef]

    return PREDEFINED_UNITS.filter((u) => canConvertUnit(productUnit, u.shortName))
  }

  return (

    <div ref={containerRef} className={cn("h-screen flex flex-col bg-background", isFullscreen && "p-4")}>
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="border-b border-border bg-card px-6 py-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
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
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => {
                const productUnitDef = getUnitByShortName(product.unit)
                return (
                  <Card
                    key={product.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => addToCart(product)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">৳{product.sellingPrice}</span>
                        <Badge
                          variant={product.stockQuantity <= product.lowStockThreshold ? "destructive" : "secondary"}
                        >
                          {product.stockQuantity} {productUnitDef?.shortName || product.unit}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p>No products found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-[400px] border-l border-border bg-card flex flex-col">
          {/* Cart Header */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </h2>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                <div>
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to get started</p>
                </div>
              </div>
            ) : (
              cart.map((item, index) => (
                <Card key={`${item.productId}-${item.saleUnit}-${index}`} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.productName}</h4>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                      <p className="text-sm font-medium text-primary mt-1">৳{item.unitPrice} / unit</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFromCart(item.productId, item.saleUnit)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateQuantity(item.productId, item.saleUnit, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-16 text-center font-medium text-sm">
                        {item.saleQuantity} {item.saleUnit}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateQuantity(item.productId, item.saleUnit, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-bold">৳{item.subtotal.toFixed(2)}</span>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="border-t border-border px-6 py-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount ({discount}%)</span>
                    <span className="font-medium text-destructive">-৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({tax}%)</span>
                    <span className="font-medium">৳{taxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">৳{total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={() => setShowCheckout(true)}>
                <Receipt className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Cart</DialogTitle>
            <DialogDescription>{selectedProduct?.name} - Select quantity and unit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                placeholder="Enter quantity"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={customUnit} onValueChange={setCustomUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct &&
                    getCompatibleUnits(selectedProduct.unit).map((unit) => (
                      <SelectItem key={unit.shortName} value={unit.shortName}>
                        {unit.name} ({unit.shortName})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProduct && customQuantity && customUnit !== selectedProduct.unit && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {customQuantity} {customUnit} ={" "}
                {(convertQuantity(Number.parseFloat(customQuantity), customUnit, selectedProduct.unit) || 0).toFixed(4)}{" "}
                {selectedProduct.unit}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuantityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddToCart}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
            <DialogDescription>Enter customer details and payment information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name (Optional)</Label>
              <Input
                id="customerName"
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
              <Input
                id="customerPhone"
                placeholder="01XXXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  max="100"
                  value={tax}
                  onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <Label htmlFor="receivedAmount">Received Amount (৳) *</Label>
                <Input
                  id="receivedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder="0.00"
                />
                {receivedAmountNum >= total && (
                  <p className="text-sm text-muted-foreground">Change: ৳{changeAmount.toFixed(2)}</p>
                )}
              </div>
            )}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-৳{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>৳{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">৳{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout}>Complete Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
