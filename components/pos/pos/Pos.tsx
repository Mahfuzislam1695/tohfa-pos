"use client"

import { useState, useEffect, useRef } from "react"
import {
    Search,
    Filter,
    Maximize2,
    Minimize2,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    X,
    Receipt,
    Package,
} from "lucide-react"
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
import { cn } from "@/lib/utils"
import { PREDEFINED_UNITS, canConvertUnit, convertQuantity, getUnitByShortName } from "@/lib/units"
import Image from "next/image"
import { toast } from "react-toastify"
import { useGetAll } from "@/hooks/useGet"
import { usePost } from "@/hooks/usePost"

interface Product {
    productID: number
    productSid: string
    sku: string
    name: string
    description?: string
    barcode?: string
    purchasePrice: number
    sellingPrice: number
    taxRate?: number
    stockQuantity: number
    lowStockThreshold: number
    unit: string
    categoryID: number
    categoryName?: string
    brandName?: string
    brandID?: number
    reorderPoint?: number
    location?: string
    notes?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    profitMargin: number
    isLowStock: boolean
    availableQuantity: number
}

interface CartItem {
    productId: number
    productName: string
    sku: string
    quantity: number
    unitPrice: number
    subtotal: number
    saleUnit: string
    saleQuantity: number
    baseQuantity: number
}

export default function Pos() {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedBrand, setSelectedBrand] = useState("all")
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [showCheckout, setShowCheckout] = useState(false)
    const [showQuantityDialog, setShowQuantityDialog] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [customQuantity, setCustomQuantity] = useState("")
    const [customUnit, setCustomUnit] = useState("")
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [discount, setDiscount] = useState(0)
    const [tax, setTax] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
    const [receivedAmount, setReceivedAmount] = useState("")
    const [notes, setNotes] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)

    // Fetch POS products
    const { data: posProductsData, isLoading: isLoadingProducts } = useGetAll(
        "/products/pos",
        ["pos-products"]
    )

    // Fetch categories
    const { data: categoriesData } = useGetAll(
        "/categories",
        ["categories"]
    )

    // Fetch brands
    const { data: brandsData } = useGetAll(
        "/brands",
        ["brands"]
    )

    // Create sale mutation
    const { mutate: createSale, isPending: isCreatingSale } = usePost(
        "/sales",
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                // toast.success("Sale completed successfully!")
                printReceipt(data.data)

                // Reset form
                setCart([])
                setCustomerName("")
                setCustomerPhone("")
                setDiscount(0)
                setTax(0)
                setReceivedAmount("")
                setNotes("")
                setShowCheckout(false)

                // Refresh products
                // The useGet hook will auto-refresh due to invalidation
            } else {
                toast.error(data?.message || "Failed to complete sale")
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to complete sale")
        }
    )

    useEffect(() => {
        if (posProductsData?.data) {
            setProducts(posProductsData?.data)
        }
    }, [posProductsData])

    useEffect(() => {
        if (categoriesData?.data) {
            const categoryList = categoriesData?.data?.map((cat: any) => ({
                id: cat.categoryID.toString(),
                name: cat.name
            }))
            setCategories(categoryList)
        }
    }, [categoriesData])

    useEffect(() => {
        if (brandsData?.data) {
            const brandList = brandsData?.data?.map((brand: any) => ({
                id: brand.brandID.toString(),
                name: brand.name
            }))
            setBrands(brandList)
        }
    }, [brandsData])

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) || false
        const matchesCategory = selectedCategory === "all" || product.categoryID.toString() === selectedCategory
        const matchesBrand = selectedBrand === "all" || product.brandID?.toString() === selectedBrand
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
            toast.error("Please enter a valid quantity")
            return
        }

        // Convert to base unit for stock checking
        const baseQty = convertQuantity(qty, customUnit, selectedProduct.unit) || qty

        // Check stock
        if (baseQty > selectedProduct.stockQuantity) {
            toast.error("Insufficient stock!")
            return
        }

        const existingItem = cart.find((item) => item.productId === selectedProduct.productID && item.saleUnit === customUnit)
        const productUnit = getUnitByShortName(selectedProduct.unit)

        if (existingItem) {
            const newSaleQty = existingItem.saleQuantity + qty
            const newBaseQty = convertQuantity(newSaleQty, customUnit, selectedProduct.unit) || newSaleQty

            if (newBaseQty > selectedProduct.stockQuantity) {
                toast.error("Insufficient stock!")
                return
            }

            setCart(
                cart.map((item) =>
                    item.productId === selectedProduct.productID && item.saleUnit === customUnit
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
                    productId: selectedProduct.productID,
                    productName: selectedProduct.name,
                    sku: selectedProduct.sku,
                    quantity: baseQty,
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

    const updateQuantity = (productId: number, saleUnit: string, change: number) => {
        const product = products.find((p) => p.productID === productId)
        if (!product) return

        setCart(
            cart
                .map((item) => {
                    if (item.productId === productId && item.saleUnit === saleUnit) {
                        const newSaleQty = item.saleQuantity + change
                        if (newSaleQty <= 0) return null

                        const newBaseQty = convertQuantity(newSaleQty, saleUnit, product.unit) || newSaleQty
                        if (newBaseQty > product.stockQuantity) {
                            toast.error("Insufficient stock!")
                            return item
                        }

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
                .filter((item): item is CartItem => item !== null),
        )
    }

    const removeFromCart = (productId: number, saleUnit: string) => {
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
        if (cart.length === 0) {
            toast.error("Cart is empty!")
            return
        }

        if (paymentMethod === "cash" && receivedAmountNum < total) {
            toast.error("Received amount is less than total amount!")
            return
        }

        const saleData = {
            items: cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity, // Base unit quantity
                unitPrice: item.unitPrice
            })),
            customerName: customerName || "Walk-in Customer",
            customerPhone: customerPhone || "",
            discount: discountAmount,
            taxRate: tax,
            paymentMethod: paymentMethod.toUpperCase(),
            receivedAmount: paymentMethod === "cash" ? receivedAmountNum : total,
            notes: notes || ""
        }
        createSale(saleData)
    }

    const printReceipt = (sale: any) => {
        const receiptWindow = window.open("", "_blank")
        if (!receiptWindow) return

        const cartItems = sale.items || []
        const subtotal = sale.subtotal || 0
        const discountAmount = sale.discount || 0
        const taxAmount = sale.tax || 0
        const total = sale.total || 0
        const receivedAmountNum = sale.receivedAmount || 0
        const changeAmount = sale.changeAmount || 0
        const paymentMethod = sale.paymentMethod || "CASH"
        const notes = sale.notes || ""


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
          <h2>POS SYSTEM</h2>
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
                    (item: CartItem) => `
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
    // const printReceipt = (sale: any) => {
    //     const receiptWindow = window.open("", "_blank")
    //     if (!receiptWindow) {
    //         toast.error("Please allow popups to print receipt")
    //         return
    //     }

    //     // Use sale data from API response instead of local state
    //     const cartItems = sale.items || []
    //     const subtotal = sale.subtotal || 0
    //     const discountAmount = sale.discount || 0
    //     const taxAmount = sale.tax || 0
    //     const total = sale.total || 0
    //     const receivedAmountNum = sale.receivedAmount || 0
    //     const changeAmount = sale.changeAmount || 0
    //     const paymentMethod = sale.paymentMethod || "CASH"
    //     const notes = sale.notes || ""

    //     receiptWindow.document.write(`
    //   <!DOCTYPE html>
    //   <html>
    //     <head>
    //       <title>Receipt - ${sale.invoiceNumber || 'SALE'}</title>
    //       <style>
    //         * { 
    //           margin: 0; 
    //           padding: 0; 
    //           box-sizing: border-box; 
    //           color: #000 !important;
    //         }
    //         body { 
    //           font-family: 'Courier New', monospace !important; 
    //           font-size: 12px !important; 
    //           line-height: 1.3 !important;
    //           max-width: 300px; 
    //           margin: 0 auto !important; 
    //           padding: 15px 10px !important;
    //           color: #000 !important;
    //           background: #fff !important;
    //           -webkit-print-color-adjust: exact !important;
    //           print-color-adjust: exact !important;
    //         }

    //         h2 { 
    //           text-align: center !important; 
    //           margin: 10px 0 !important;
    //           font-size: 18px !important;
    //           font-weight: bold !important;
    //           text-transform: uppercase !important;
    //           color: #000 !important;
    //         }

    //         .center { 
    //           text-align: center !important; 
    //           margin: 8px 0 !important;
    //           font-weight: bold !important;
    //           color: #000 !important;
    //         }

    //         .line { 
    //           border-top: 2px solid #000 !important; 
    //           margin: 10px 0 !important; 
    //           height: 0 !important;
    //         }

    //         .row { 
    //           display: flex !important; 
    //           justify-content: space-between !important; 
    //           margin: 4px 0 !important;
    //           font-size: 11px !important;
    //           color: #000 !important;
    //         }

    //         .bold { 
    //           font-weight: bold !important; 
    //           color: #000 !important;
    //         }

    //         table { 
    //           width: 100% !important; 
    //           border-collapse: collapse !important; 
    //           margin: 10px 0 !important;
    //           color: #000 !important;
    //         }

    //         th, td { 
    //           text-align: left !important; 
    //           padding: 4px 0 !important;
    //           font-size: 11px !important;
    //           color: #000 !important;
    //           border-bottom: 1px dashed #000 !important;
    //         }

    //         th {
    //           font-weight: bold !important;
    //           border-bottom: 2px solid #000 !important;
    //         }

    //         .right { 
    //           text-align: right !important; 
    //           color: #000 !important;
    //         }

    //         /* Print optimizations */
    //         @media print {
    //           @page {
    //             margin: 5mm !important;
    //           }
    //           body {
    //             padding: 10px 5px !important;
    //             font-size: 11px !important;
    //             max-width: 100% !important;
    //             width: 300px !important;
    //             color: #000 !important;
    //           }
    //           h2 { font-size: 16px !important; }
    //           th, td { font-size: 10px !important; }

    //           * {
    //             -webkit-print-color-adjust: exact !important;
    //             print-color-adjust: exact !important;
    //             color: #000 !important;
    //             background-color: #fff !important;
    //           }
    //         }
    //       </style>
    //     </head>
    //     <body>
    //       <!-- SHOP HEADER -->
    //       <h2>AT-TOHFA</h2>
    //       <div class="center">Gift Shop & Stationery</div>
    //       <div class="center">Kamarpara, Road-1, House-1</div>
    //       <div class="center bold">Phone: 01750256844</div>

    //       <div class="line"></div>

    //       <!-- SALE DETAILS -->
    //       <div class="center bold">Sale Receipt</div>

    //       <div class="row">
    //         <span>Invoice:</span>
    //         <span class="bold">${sale.invoiceNumber || 'N/A'}</span>
    //       </div>
    //       <div class="row">
    //         <span>Date:</span>
    //         <span>${new Date(sale.createdAt || new Date()).toLocaleString('en-US', {
    //         year: 'numeric',
    //         month: '2-digit',
    //         day: '2-digit',
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: true
    //     }).replace(',', '')}</span>
    //       </div>
    //       <div class="row">
    //         <span>Customer:</span>
    //         <span>${sale.customerName || 'Walk-in Customer'}</span>
    //       </div>
    //       ${sale.customerPhone ? `
    //       <div class="row">
    //         <span>Phone:</span>
    //         <span>${sale.customerPhone}</span>
    //       </div>
    //       ` : ""}

    //       <div class="line"></div>

    //       <!-- ITEMS TABLE -->
    //       <table>
    //         <thead>
    //           <tr>
    //             <th>Item</th>
    //             <th class="right">Qty</th>
    //             <th class="right">Price</th>
    //             <th class="right">Total</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           ${cartItems
    //             .map(
    //                 (item: any) => `
    //             <tr>
    //               <td>${item.productName ? item.productName.substring(0, 25) : 'Product'}${item.productName && item.productName.length > 25 ? '...' : ''}</td>
    //               <td class="right">${item.quantity || 0}</td>
    //               <td class="right">${item.unitPrice ? item.unitPrice.toFixed(2) : '0.00'}</td>
    //               <td class="right bold">${item.subtotal ? item.subtotal.toFixed(2) : (item.quantity * item.unitPrice).toFixed(2)}</td>
    //             </tr>
    //           `,
    //             )
    //             .join("")}
    //         </tbody>
    //       </table>

    //       <div class="line"></div>

    //       <!-- AMOUNT CALCULATIONS -->
    //       <div class="row">
    //         <span>Subtotal:</span>
    //         <span>${subtotal.toFixed(2)}</span>
    //       </div>
    //       ${discountAmount > 0 ? `
    //       <div class="row">
    //         <span>Discount:</span>
    //         <span>-${discountAmount.toFixed(2)}</span>
    //       </div>
    //       ` : ""}
    //       ${taxAmount > 0 ? `
    //       <div class="row">
    //         <span>Tax:</span>
    //         <span>${taxAmount.toFixed(2)}</span>
    //       </div>
    //       ` : ""}

    //       <div class="line"></div>

    //       <div class="row bold">
    //         <span>TOTAL:</span>
    //         <span>${total.toFixed(2)}</span>
    //       </div>

    //       <!-- PAYMENT DETAILS -->
    //       ${paymentMethod === "CASH"
    //             ? `
    //       <div class="row">
    //         <span>Received:</span>
    //         <span>${receivedAmountNum.toFixed(2)}</span>
    //       </div>
    //       <div class="row">
    //         <span>Change:</span>
    //         <span>${changeAmount.toFixed(2)}</span>
    //       </div>
    //       `
    //             : ""
    //         }
    //       <div class="row">
    //         <span>Payment:</span>
    //         <span class="bold">${paymentMethod.toUpperCase()}</span>
    //       </div>

    //       <!-- NOTES -->
    //       ${notes ? `
    //       <div class="line"></div>
    //       <div class="row">
    //         <span>Notes:</span>
    //         <span>${notes.substring(0, 30)}${notes.length > 30 ? '...' : ''}</span>
    //       </div>
    //       ` : ""}

    //       <div class="line"></div>

    //       <!-- FOOTER -->
    //       <div class="center bold">Thanks for shopping—see you again!</div>
    //       <div class="center">Built: aethrasoft.com, 01750256844</div>

    //       <!-- PRINT SCRIPT -->
    //       <script>
    //         window.onload = function() {
    //           // Focus and print
    //           window.focus();
    //           setTimeout(function() {
    //             window.print();
    //           }, 250);

    //           // Close after print
    //           setTimeout(function() {
    //             window.close();
    //           }, 1000);
    //         };
    //       </script>
    //     </body>
    //   </html>
    // `)
    //     receiptWindow.document.close()
    // }


    // const printReceipt = (sale: any) => {
    //     const receiptWindow = window.open("", "_blank")
    //     if (!receiptWindow) {
    //         toast.error("Please allow popups to print receipt")
    //         return
    //     }

    //     receiptWindow.document.write(`
    //   <!DOCTYPE html>
    //   <html>
    //     <head>
    //       <title>Receipt - ${sale.invoiceNumber || 'SALE'}</title>
    //       <style>
    //         * { 
    //           margin: 0; 
    //           padding: 0; 
    //           box-sizing: border-box; 
    //         }
    //         body { 
    //           font-family: 'Courier New', monospace; 
    //           font-size: 14px; 
    //           line-height: 1.3;
    //           max-width: 80mm; 
    //           margin: 0 auto; 
    //           padding: 10px 5px;
    //         }

    //         /* Header Styles */
    //         .shop-header { 
    //           text-align: center; 
    //           margin-bottom: 10px;
    //         }
    //         .shop-name { 
    //           font-size: 20px; 
    //           font-weight: bold;
    //           letter-spacing: 1px;
    //           margin-bottom: 3px;
    //         }
    //         .shop-tagline { 
    //           font-size: 12px;
    //           font-weight: semi-bold; 
    //           margin-bottom: 5px;
    //         }
    //         .shop-address { 
    //           font-size: 11px; 
    //           line-height: 1.2;
    //           margin-bottom: 8px;
    //         }
    //         .shop-phone { 
    //           font-size: 11px; 
    //           font-weight: bold;
    //           margin-bottom: 10px;
    //         }

    //         /* Divider Lines */
    //         .divider {
    //           border-top: 1px dashed #333;
    //           margin: 8px 0;
    //         }
    //         .divider-thick {
    //           border-top: 2px solid #333;
    //           margin: 10px 0;
    //         }
    //         .divider-double {
    //           border-top: 1px dashed #333;
    //           border-bottom: 1px dashed #333;
    //           height: 3px;
    //           margin: 10px 0;
    //         }

    //         /* Receipt Title */
    //         .receipt-title {
    //           text-align: center;
    //           font-weight: bold;
    //           font-size: 16px;
    //           margin: 12px 0 10px 0;
    //           text-transform: uppercase;
    //           letter-spacing: 1px;
    //         }

    //         /* Row Styles */
    //         .row {
    //           display: flex;
    //           justify-content: space-between;
    //           margin: 4px 0;
    //           padding: 0 2px;
    //         }
    //         .row-label {
    //           font-weight: bold;
    //         }
    //         .row-value {
    //           font-weight: medium;
    //           text-align: right;
    //         }
    //         .row-total {
    //           font-weight: bold;
    //           font-size: 15px;
    //           margin: 6px 0;
    //           padding: 2px;
    //         }

    //         /* Table Styles */
    //         .items-table {
    //           width: 100%;
    //           border-collapse: collapse;
    //           margin: 10px 0;
    //         }
    //         .items-table thead th {
    //           padding: 4px 2px;
    //           border-bottom: 1px solid #333;
    //           text-align: left;
    //           font-size: 13px;
    //         }
    //         .items-table tbody td {
    //           padding: 3px 2px;
    //           border-bottom: 1px dotted #ddd;
    //           vertical-align: top;
    //           font-size: 13px;
    //         }
    //         .col-item {
    //           width: 40%;
    //           word-break: break-word;
    //           max-width: 35mm;
    //         }
    //         .col-qty {
    //           width: 15%;
    //           text-align: center;
    //         }
    //         .col-price {
    //           width: 20%;
    //           text-align: right;
    //         }
    //         .col-total {
    //           width: 25%;
    //           text-align: right;
    //           font-weight: bold;
    //         }

    //         /* Amount Section */
    //         .amount-section {
    //           margin: 12px 0;
    //         }
    //         .amount-row {
    //           display: flex;
    //           justify-content: space-between;
    //           margin: 4px 0;
    //           padding: 0 2px;
    //         }
    //         .amount-label {
    //           font-size: 13px;
    //         }
    //         .amount-value {
    //           font-size: 13px;
    //           font-weight: bold;
    //         }
    //         .grand-total {
    //           font-size: 16px;
    //           font-weight: bold;
    //           margin-top: 8px;
    //           padding-top: 8px;
    //           border-top: 2px solid #333;
    //         }

    //         /* Payment Section */
    //         .payment-section {
    //           margin: 15px 0 10px 0;
    //         }

    //         /* Footer */
    //         .thankyou {
    //           text-align: center;
    //           font-size: 12px;
    //           margin: 10px 0 5px 0;
    //           font-weight: medium;
    //         }
    //         .come-again {
    //           text-align: center;
    //           font-size: 13px;
    //           margin-bottom: 8px;
    //           font-style: italic;
    //         }
    //         .powered-by {
    //           text-align: center;
    //           font-size: 12px;
    //           font-weight: 500;
    //           margin-top: 5px;
    //           line-height: 1.1;
    //         }

    //         /* Alignment Classes */
    //         .text-left { text-align: left; }
    //         .text-center { text-align: center; }
    //         .text-right { text-align: right; }
    //         .bold { font-weight: bold; }

    //         /* Print Optimizations */
    //         @media print {
    //           body { 
    //             padding: 5px 3px;
    //             font-size: 13px;
    //           }
    //           .shop-name { font-size: 18px; }
    //           .receipt-title { font-size: 15px; }
    //         }
    //       </style>
    //     </head>
    //     <body>
    //       <!-- SHOP HEADER -->
    //       <div class="shop-header">
    //         <div class="shop-name">AT-TOHFA</div>
    //         <div class="shop-tagline">Gift Shop & Stationery</div>
    //         <div class="shop-address">Kamarpara, Road-1, House-1</div>
    //         <div class="shop-phone">Phone: 01750256844</div>
    //       </div>

    //       <div class="divider-double"></div>


    //       <!-- INVOICE DETAILS -->
    //       <div class="row">
    //         <span class="row-label">Invoice:</span>
    //         <span class="row-value">${sale.invoiceNumber || 'N/A'}</span>
    //       </div>
    //       <div class="row">
    //         <span class="row-label">Date:</span>
    //         <span class="row-value">${new Date(sale.createdAt || new Date()).toLocaleString('en-US', {
    //         year: 'numeric',
    //         month: '2-digit',
    //         day: '2-digit',
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: true
    //     }).replace(',', '')}</span>
    //       </div>
    //       <div class="row">
    //         <span class="row-label">Customer:</span>
    //         <span class="row-value">${sale.customerName || 'Walk-in Customer'}</span>
    //       </div>
    //       ${sale.customerPhone ? `
    //       <div class="row">
    //         <span class="row-label">Phone:</span>
    //         <span class="row-value">${sale.customerPhone}</span>
    //       </div>
    //       ` : ""}

    //       <div class="divider"></div>

    //       <!-- ITEMS TABLE -->
    //       <table class="items-table">
    //         <thead>
    //           <tr>
    //             <th class="col-item text-left">Item</th>
    //             <th class="col-qty text-center">Qty</th>
    //             <th class="col-price text-right">Price</th>
    //             <th class="col-total text-right">Total</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           ${cart
    //             .map(
    //                 (item: CartItem) => `
    //             <tr>
    //               <td class="col-item text-left">${item.productName.substring(0, 20)}${item.productName.length > 20 ? '...' : ''}</td>
    //               <td class="col-qty text-center">${item.saleQuantity}</td>
    //               <td class="col-price text-right">${item.unitPrice.toFixed(2)}</td>
    //               <td class="col-total text-right">${item.subtotal.toFixed(2)}</td>
    //             </tr>
    //           `,
    //             )
    //             .join("")}
    //         </tbody>
    //       </table>

    //       <div class="divider"></div>

    //       <!-- AMOUNT CALCULATIONS -->
    //       <div class="amount-section">
    //         <div class="amount-row">
    //           <span class="amount-label">Subtotal:</span>
    //           <span class="amount-value">${subtotal.toFixed(2)}</span>
    //         </div>
    //         ${discountAmount > 0 ? `
    //         <div class="amount-row">
    //           <span class="amount-label">Discount:</span>
    //           <span class="amount-value">-${discountAmount.toFixed(2)}</span>
    //         </div>
    //         ` : ""}
    //         ${taxAmount > 0 ? `
    //         <div class="amount-row">
    //           <span class="amount-label">Tax:</span>
    //           <span class="amount-value">${taxAmount.toFixed(2)}</span>
    //         </div>
    //         ` : ""}
    //         <div class="amount-row grand-total">
    //           <span>TOTAL:</span>
    //           <span>${total.toFixed(2)}</span>
    //         </div>
    //       </div>

    //       <!-- PAYMENT DETAILS -->
    //       <div class="payment-section">
    //         ${paymentMethod === "cash"
    //             ? `
    //         <div class="row">
    //           <span class="row-label">Received:</span>
    //           <span class="row-value">${receivedAmountNum.toFixed(2)}</span>
    //         </div>
    //         <div class="row">
    //           <span class="row-label">Change:</span>
    //           <span class="row-value">${changeAmount.toFixed(2)}</span>
    //         </div>
    //         `
    //             : ""
    //         }
    //         <div class="row">
    //           <span class="row-label">Payment:</span>
    //           <span class="row-value">${paymentMethod.toUpperCase()}</span>
    //         </div>
    //       </div>

    //       <!-- NOTES -->
    //       ${notes ? `
    //       <div class="divider"></div>
    //       <div class="row">
    //         <span class="row-label">Notes:</span>
    //         <span class="row-value">${notes.substring(0, 30)}${notes.length > 30 ? '...' : ''}</span>
    //       </div>
    //       ` : ""}

    //       <div class="divider-thick"></div>

    //       <!-- FOOTER -->
    //       <div class="thankyou">Thanks for shopping—see you again!</div>
    //       <div class="powered-by">
    //         Powered by: aethrasoft, 01750256844
    //       </div>

    //       <!-- PRINT SCRIPT -->
    //       <script>
    //         window.onload = function() {
    //           // Focus and print
    //           window.focus();
    //           setTimeout(function() {
    //             window.print();
    //           }, 250);

    //           // Close after print (with delay for print dialog)
    //           setTimeout(function() {
    //             window.close();
    //           }, 1500);
    //         };
    //       </script>
    //     </body>
    //   </html>
    // `)
    //     receiptWindow.document.close()
    // }

    // const printReceipt = (sale: any) => {
    //     const receiptWindow = window.open("", "_blank")
    //     if (!receiptWindow) {
    //         toast.error("Please allow popups to print receipt")
    //         return
    //     }

    //     receiptWindow.document.write(`
    //   <!DOCTYPE html>
    //   <html>
    //     <head>
    //       <title>Receipt - ${sale.invoiceNumber || 'SALE'}</title>
    //       <style>
    //         body { font-family: monospace; padding: 2px; max-width: 300px; margin: 0 auto; }
    //         h2 { text-align: center; margin: 10px 0; }
    //         .line { border-top: 1px dashed #000; margin: 10px 0; }
    //         .row { display: flex; justify-content: space-between; margin: 5px 0; }
    //         .bold { font-weight: bold; }
    //         .center { text-align: center; }
    //         table { width: 100%; border-collapse: collapse; }
    //         th, td { text-align: left; padding: 5px 0; }
    //         .right { text-align: right; }
    //       </style>
    //     </head>
    //     <body>
    //       <h2>AT-TOHFA</h2>
    //       <div class="center">Sale Receipt</div>
    //       <div class="line"></div>
    //       <div class="row"><span>Invoice:</span><span>${sale.invoiceNumber || 'N/A'}</span></div>
    //       <div class="row"><span>Date:</span><span>${new Date(sale.createdAt || new Date()).toLocaleString()}</span></div>
    //       <div class="row"><span>Customer:</span><span>${sale.customerName}</span></div>
    //       ${sale.customerPhone ? `<div class="row"><span>Phone:</span><span>${sale.customerPhone}</span></div>` : ""}
    //       <div class="line"></div>
    //       <table>
    //         <thead>
    //           <tr>
    //             <th>Item</th>
    //             <th class="right">Qty</th>
    //             <th class="right">Price</th>
    //             <th class="right">Total</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           ${cart
    //             .map(
    //                 (item: CartItem) => `
    //             <tr>
    //               <td>${item.productName}</td>
    //               <td class="right">${item.saleQuantity} ${item.saleUnit}</td>
    //               <td class="right">৳${item.unitPrice.toFixed(2)}</td>
    //               <td class="right">৳${item.subtotal.toFixed(2)}</td>
    //             </tr>
    //           `,
    //             )
    //             .join("")}
    //         </tbody>
    //       </table>
    //       <div class="line"></div>
    //       <div class="row"><span>Subtotal:</span><span>৳${subtotal.toFixed(2)}</span></div>
    //       ${discountAmount > 0 ? `<div class="row"><span>Discount:</span><span>-৳${discountAmount.toFixed(2)}</span></div>` : ""}
    //       ${taxAmount > 0 ? `<div class="row"><span>Tax:</span><span>৳${taxAmount.toFixed(2)}</span></div>` : ""}
    //       <div class="line"></div>
    //       <div class="row bold"><span>TOTAL:</span><span>৳${total.toFixed(2)}</span></div>
    //       ${paymentMethod === "cash"
    //             ? `
    //         <div class="row"><span>Received:</span><span>৳${receivedAmountNum.toFixed(2)}</span></div>
    //         <div class="row"><span>Change:</span><span>৳${changeAmount.toFixed(2)}</span></div>
    //       `
    //             : ""
    //         }
    //       <div class="row"><span>Payment:</span><span>${paymentMethod.toUpperCase()}</span></div>
    //       ${notes ? `<div class="line"></div><div class="row"><span>Notes:</span><span>${notes}</span></div>` : ""}
    //       <div class="line"></div>
    //       <div class="center">Thank you for shopping with us!</div>
    //       <script>window.print(); setTimeout(() => window.close(), 1000);</script>
    //     </body>
    //   </html>
    // `)
    //     receiptWindow.document.close()
    // }

    const getCompatibleUnits = (productUnit: string) => {
        const productUnitDef = getUnitByShortName(productUnit)
        if (!productUnitDef) return []

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
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Brands</SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-auto p-6">
                        {isLoadingProducts ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading products...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filteredProducts.map((product) => {
                                        const productUnitDef = getUnitByShortName(product.unit)
                                        return (
                                            <Card
                                                key={product.productID}
                                                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                                                onClick={() => addToCart(product)}
                                            >
                                                <div className="space-y-2 content-center">
                                                    <div className="relative h-40 w-40 mx-auto rounded-xl overflow-hidden bg-muted group">
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Package className="h-12 w-12 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                                                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-bold text-primary">৳{product.sellingPrice}</span>
                                                        <Badge
                                                            variant={product.isLowStock ? "destructive" : "secondary"}
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
                            </>
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
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => setShowCheckout(true)}
                                disabled={isCreatingSale}
                            >
                                <Receipt className="h-5 w-5 mr-2" />
                                {isCreatingSale ? "Processing..." : "Proceed to Checkout"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Quantity Dialog */}
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
                        {/* <div className="space-y-2">
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
                        </div> */}
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
                            {/* <div className="space-y-2">
                                <Label htmlFor="tax">Tax (%)</Label>
                                <Input
                                    id="tax"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={tax}
                                    onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
                                />
                            </div> */}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method *</Label>
                            <Select value={paymentMethod} defaultValue="CASH" onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {paymentMethod === "CASH" && (
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
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                                id="notes"
                                placeholder="Any additional notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
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
                        <Button onClick={handleCheckout} disabled={isCreatingSale}>
                            {isCreatingSale ? "Processing..." : "Complete Sale"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}