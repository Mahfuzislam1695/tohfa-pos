"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { PREDEFINED_UNITS, canConvertUnit, convertQuantity, getUnitByShortName } from "@/lib/units"
import { toast } from "react-toastify"
import { useGetAll } from "@/hooks/useGet"
import { usePost } from "@/hooks/usePost"
import { CartItem, Product } from "./types"
import { printReceipt } from "./receiptUtils"
import { Header } from "./Header"
import { ProductGrid } from "./ProductGrid"
import { CartSection } from "./CartSection"
import { QuantityDialog } from "./QuantityDialog"
import { CheckoutDialog } from "./CheckoutDialog"


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
    const { data: posProductsData, isLoading: isLoadingProducts } = useGetAll("/products/pos", ["pos-products"])

    // Fetch categories
    const { data: categoriesData } = useGetAll("/categories", ["categories"])

    // Fetch brands
    const { data: brandsData } = useGetAll("/brands", ["brands"])

    // Create sale mutation
    const { mutate: createSale, isPending: isCreatingSale } = usePost(
        "/sales",
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
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
            setProducts(posProductsData.data)
        }
    }, [posProductsData])

    useEffect(() => {
        if (categoriesData?.data) {
            const categoryList = categoriesData.data.map((cat: any) => ({
                id: cat.categoryID.toString(),
                name: cat.name
            }))
            setCategories(categoryList)
        }
    }, [categoriesData])

    useEffect(() => {
        if (brandsData?.data) {
            const brandList = brandsData.data.map((brand: any) => ({
                id: brand.brandID.toString(),
                name: brand.name
            }))
            setBrands(brandList)
        }
    }, [brandsData])

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

        // Always use the product's original unit
        setCustomUnit(product.unit)

        // Set default quantity to 1 (or 1.00 for decimal units)
        const unitDef = getUnitByShortName(product.unit)
        if (unitDef?.allowsDecimal) {
            setCustomQuantity("1.00")
        } else {
            setCustomQuantity("1")
        }

        setShowQuantityDialog(true)
    }
    const confirmAddToCart = () => {
        if (!selectedProduct) return

        const qty = parseFloat(customQuantity)
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity")
            return
        }

        // Check if unit allows decimal
        const unitDef = getUnitByShortName(customUnit)
        if (!unitDef?.allowsDecimal && !Number.isInteger(qty)) {
            toast.error("Quantity must be a whole number for this unit")
            return
        }

        // Since we're using product's unit, no conversion needed
        const baseQty = qty

        if (baseQty > selectedProduct.stockQuantity) {
            toast.error("Insufficient stock!")
            return
        }

        const existingItem = cart.find(
            (item) => item.productId === selectedProduct.productID && item.saleUnit === customUnit
        )

        if (existingItem) {
            const newSaleQty = existingItem.saleQuantity + qty
            const newBaseQty = newSaleQty // No conversion since same unit

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
                        : item
                )
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

    // Update the updateQuantity function
    const updateQuantity = (productId: number, saleUnit: string, change: number) => {
        const product = products.find((p) => p.productID === productId)
        if (!product) return

        // Get the unit definition to check if it allows decimal
        const unitDef = getUnitByShortName(saleUnit)
        const allowsDecimal = unitDef?.allowsDecimal || false

        setCart(
            cart
                .map((item) => {
                    if (item.productId === productId && item.saleUnit === saleUnit) {
                        let newSaleQty = item.saleQuantity + change

                        // Ensure whole numbers for non-decimal units
                        if (!allowsDecimal) {
                            newSaleQty = Math.round(newSaleQty)
                            if (newSaleQty < 1) newSaleQty = 1 // Minimum 1 for non-decimal units
                        } else {
                            // For decimal units, ensure minimum of 0.01
                            if (newSaleQty < 0.01) newSaleQty = 0.01
                        }

                        if (newSaleQty <= 0) return null

                        // Since same unit, no conversion needed
                        const newBaseQty = newSaleQty

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
                .filter((item): item is CartItem => item !== null)
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
                quantity: item.quantity,
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

    const getCompatibleUnits = (productUnit: string) => {
        const productUnitDef = getUnitByShortName(productUnit)
        if (!productUnitDef) return []

        return PREDEFINED_UNITS.filter((u) => canConvertUnit(productUnit, u.shortName))
    }

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
        const matchesCategory = selectedCategory === "all" || product.categoryID.toString() === selectedCategory
        const matchesBrand = selectedBrand === "all" || product.brandID?.toString() === selectedBrand
        return matchesSearch && matchesCategory && matchesBrand && product.stockQuantity > 0
    })

    return (
        <div ref={containerRef} className={cn("h-screen flex flex-col bg-background", isFullscreen && "p-4 z-40")}>
            <Header isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />

            <div className="flex flex-1 overflow-hidden">
                <ProductGrid
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    categories={categories}
                    brands={brands}
                    filteredProducts={filteredProducts}
                    isLoadingProducts={isLoadingProducts}
                    addToCart={addToCart}
                />

                <CartSection
                    cart={cart}
                    clearCart={clearCart}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    subtotal={subtotal}
                    discount={discount}
                    tax={tax}
                    discountAmount={discountAmount}
                    taxAmount={taxAmount}
                    total={total}
                    setShowCheckout={setShowCheckout}
                    isCreatingSale={isCreatingSale}
                />
            </div>

            <QuantityDialog
                showQuantityDialog={showQuantityDialog}
                setShowQuantityDialog={setShowQuantityDialog}
                selectedProduct={selectedProduct}
                customQuantity={customQuantity}
                setCustomQuantity={setCustomQuantity}
                customUnit={customUnit}
                setCustomUnit={setCustomUnit}
                confirmAddToCart={confirmAddToCart}
                getCompatibleUnits={getCompatibleUnits}
            />

            <CheckoutDialog
                showCheckout={showCheckout}
                setShowCheckout={setShowCheckout}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                discount={discount}
                setDiscount={setDiscount}
                tax={tax}
                setTax={setTax}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                receivedAmount={receivedAmount}
                setReceivedAmount={setReceivedAmount}
                notes={notes}
                setNotes={setNotes}
                subtotal={subtotal}
                discountAmount={discountAmount}
                taxAmount={taxAmount}
                total={total}
                receivedAmountNum={receivedAmountNum}
                changeAmount={changeAmount}
                handleCheckout={handleCheckout}
                isCreatingSale={isCreatingSale}
            />
        </div>
    )
}
// "use client"

// import { useState, useEffect, useRef } from "react"
// import {
//     Search,
//     Filter,
//     Maximize2,
//     Minimize2,
//     ShoppingCart,
//     Trash2,
//     Plus,
//     Minus,
//     X,
//     Receipt,
//     Package,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog"
// import { cn } from "@/lib/utils"
// import { PREDEFINED_UNITS, canConvertUnit, convertQuantity, getUnitByShortName } from "@/lib/units"
// import Image from "next/image"
// import { toast } from "react-toastify"
// import { useGetAll } from "@/hooks/useGet"
// import { usePost } from "@/hooks/usePost"

// interface Product {
//     productID: number
//     productSid: string
//     sku: string
//     name: string
//     description?: string
//     barcode?: string
//     purchasePrice: number
//     sellingPrice: number
//     taxRate?: number
//     stockQuantity: number
//     lowStockThreshold: number
//     unit: string
//     categoryID: number
//     categoryName?: string
//     brandName?: string
//     brandID?: number
//     reorderPoint?: number
//     location?: string
//     notes?: string
//     isActive: boolean
//     createdAt: string
//     updatedAt: string
//     profitMargin: number
//     isLowStock: boolean
//     availableQuantity: number
// }

// interface CartItem {
//     productId: number
//     productName: string
//     sku: string
//     quantity: number
//     unitPrice: number
//     subtotal: number
//     saleUnit: string
//     saleQuantity: number
//     baseQuantity: number
// }

// export default function Pos() {
//     const [isFullscreen, setIsFullscreen] = useState(false)
//     const [searchQuery, setSearchQuery] = useState("")
//     const [selectedCategory, setSelectedCategory] = useState("all")
//     const [selectedBrand, setSelectedBrand] = useState("all")
//     const [products, setProducts] = useState<Product[]>([])
//     const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
//     const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
//     const [cart, setCart] = useState<CartItem[]>([])
//     const [showCheckout, setShowCheckout] = useState(false)
//     const [showQuantityDialog, setShowQuantityDialog] = useState(false)
//     const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
//     const [customQuantity, setCustomQuantity] = useState("")
//     const [customUnit, setCustomUnit] = useState("")
//     const [customerName, setCustomerName] = useState("")
//     const [customerPhone, setCustomerPhone] = useState("")
//     const [discount, setDiscount] = useState(0)
//     const [tax, setTax] = useState(0)
//     const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
//     const [receivedAmount, setReceivedAmount] = useState("")
//     const [notes, setNotes] = useState("")
//     const containerRef = useRef<HTMLDivElement>(null)

//     // Fetch POS products
//     const { data: posProductsData, isLoading: isLoadingProducts } = useGetAll(
//         "/products/pos",
//         ["pos-products"]
//     )

//     // Fetch categories
//     const { data: categoriesData } = useGetAll(
//         "/categories",
//         ["categories"]
//     )

//     // Fetch brands
//     const { data: brandsData } = useGetAll(
//         "/brands",
//         ["brands"]
//     )

//     // Create sale mutation
//     const { mutate: createSale, isPending: isCreatingSale } = usePost(
//         "/sales",
//         (data: any) => {
//             if (data?.statusCode >= 200 && data?.statusCode < 300) {
//                 // toast.success("Sale completed successfully!")
//                 printReceipt(data.data)

//                 // Reset form
//                 setCart([])
//                 setCustomerName("")
//                 setCustomerPhone("")
//                 setDiscount(0)
//                 setTax(0)
//                 setReceivedAmount("")
//                 setNotes("")
//                 setShowCheckout(false)

//                 // Refresh products
//                 // The useGet hook will auto-refresh due to invalidation
//             } else {
//                 toast.error(data?.message || "Failed to complete sale")
//             }
//         },
//         (error: any) => {
//             toast.error(error?.message || "Failed to complete sale")
//         }
//     )

//     useEffect(() => {
//         if (posProductsData?.data) {
//             setProducts(posProductsData?.data)
//         }
//     }, [posProductsData])

//     useEffect(() => {
//         if (categoriesData?.data) {
//             const categoryList = categoriesData?.data?.map((cat: any) => ({
//                 id: cat.categoryID.toString(),
//                 name: cat.name
//             }))
//             setCategories(categoryList)
//         }
//     }, [categoriesData])

//     useEffect(() => {
//         if (brandsData?.data) {
//             const brandList = brandsData?.data?.map((brand: any) => ({
//                 id: brand.brandID.toString(),
//                 name: brand.name
//             }))
//             setBrands(brandList)
//         }
//     }, [brandsData])

//     const filteredProducts = products.filter((product) => {
//         const matchesSearch =
//             product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) || false
//         const matchesCategory = selectedCategory === "all" || product.categoryID.toString() === selectedCategory
//         const matchesBrand = selectedBrand === "all" || product.brandID?.toString() === selectedBrand
//         return matchesSearch && matchesCategory && matchesBrand && product.stockQuantity > 0
//     })

//     const toggleFullscreen = () => {
//         if (!document.fullscreenElement) {
//             containerRef.current?.requestFullscreen()
//             setIsFullscreen(true)
//         } else {
//             document.exitFullscreen()
//             setIsFullscreen(false)
//         }
//     }

//     const addToCart = (product: Product) => {
//         setSelectedProduct(product)
//         setCustomUnit(product.unit) // Default to product's unit
//         setCustomQuantity("1")
//         setShowQuantityDialog(true)
//     }

//     const confirmAddToCart = () => {
//         if (!selectedProduct) return

//         const qty = Number.parseFloat(customQuantity)
//         if (isNaN(qty) || qty <= 0) {
//             toast.error("Please enter a valid quantity")
//             return
//         }

//         // Convert to base unit for stock checking
//         const baseQty = convertQuantity(qty, customUnit, selectedProduct.unit) || qty

//         // Check stock
//         if (baseQty > selectedProduct.stockQuantity) {
//             toast.error("Insufficient stock!")
//             return
//         }

//         const existingItem = cart.find((item) => item.productId === selectedProduct.productID && item.saleUnit === customUnit)
//         const productUnit = getUnitByShortName(selectedProduct.unit)

//         if (existingItem) {
//             const newSaleQty = existingItem.saleQuantity + qty
//             const newBaseQty = convertQuantity(newSaleQty, customUnit, selectedProduct.unit) || newSaleQty

//             if (newBaseQty > selectedProduct.stockQuantity) {
//                 toast.error("Insufficient stock!")
//                 return
//             }

//             setCart(
//                 cart.map((item) =>
//                     item.productId === selectedProduct.productID && item.saleUnit === customUnit
//                         ? {
//                             ...item,
//                             saleQuantity: newSaleQty,
//                             baseQuantity: newBaseQty,
//                             quantity: newBaseQty,
//                             subtotal: newBaseQty * item.unitPrice,
//                         }
//                         : item,
//                 ),
//             )
//         } else {
//             setCart([
//                 ...cart,
//                 {
//                     productId: selectedProduct.productID,
//                     productName: selectedProduct.name,
//                     sku: selectedProduct.sku,
//                     quantity: baseQty,
//                     unitPrice: selectedProduct.sellingPrice,
//                     subtotal: baseQty * selectedProduct.sellingPrice,
//                     saleUnit: customUnit,
//                     saleQuantity: qty,
//                     baseQuantity: baseQty,
//                 },
//             ])
//         }

//         setShowQuantityDialog(false)
//         setSelectedProduct(null)
//         setCustomQuantity("")
//     }

//     const updateQuantity = (productId: number, saleUnit: string, change: number) => {
//         const product = products.find((p) => p.productID === productId)
//         if (!product) return

//         setCart(
//             cart
//                 .map((item) => {
//                     if (item.productId === productId && item.saleUnit === saleUnit) {
//                         const newSaleQty = item.saleQuantity + change
//                         if (newSaleQty <= 0) return null

//                         const newBaseQty = convertQuantity(newSaleQty, saleUnit, product.unit) || newSaleQty
//                         if (newBaseQty > product.stockQuantity) {
//                             toast.error("Insufficient stock!")
//                             return item
//                         }

//                         return {
//                             ...item,
//                             saleQuantity: newSaleQty,
//                             baseQuantity: newBaseQty,
//                             quantity: newBaseQty,
//                             subtotal: newBaseQty * item.unitPrice,
//                         }
//                     }
//                     return item
//                 })
//                 .filter((item): item is CartItem => item !== null),
//         )
//     }

//     const removeFromCart = (productId: number, saleUnit: string) => {
//         setCart(cart.filter((item) => !(item.productId === productId && item.saleUnit === saleUnit)))
//     }

//     const clearCart = () => {
//         setCart([])
//     }

//     const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
//     const discountAmount = (subtotal * discount) / 100
//     const taxAmount = ((subtotal - discountAmount) * tax) / 100
//     const total = subtotal - discountAmount + taxAmount
//     const receivedAmountNum = Number.parseFloat(receivedAmount) || 0
//     const changeAmount = Math.max(0, receivedAmountNum - total)

//     const handleCheckout = () => {
//         if (cart.length === 0) {
//             toast.error("Cart is empty!")
//             return
//         }

//         if (paymentMethod === "cash" && receivedAmountNum < total) {
//             toast.error("Received amount is less than total amount!")
//             return
//         }

//         const saleData = {
//             items: cart.map((item) => ({
//                 productId: item.productId,
//                 quantity: item.quantity, // Base unit quantity
//                 unitPrice: item.unitPrice
//             })),
//             customerName: customerName || "Walk-in Customer",
//             customerPhone: customerPhone || "",
//             discount: discountAmount,
//             taxRate: tax,
//             paymentMethod: paymentMethod.toUpperCase(),
//             receivedAmount: paymentMethod === "cash" ? receivedAmountNum : total,
//             notes: notes || ""
//         }

//         console.log("Submitting sale:", saleData)
//         createSale(saleData)
//     }

//     const printReceipt = (sale: any) => {
//         const receiptWindow = window.open("", "_blank")
//         if (!receiptWindow) return

//         console.log("ok", sale);


//         const cartItems = sale?.sellItems || []
//         const subtotal = sale.subtotal || 0
//         const discountAmount = sale.discount || 0
//         const taxAmount = sale.tax || 0
//         const total = sale.total || 0
//         const receivedAmountNum = sale.receivedAmount || 0
//         const changeAmount = sale.changeAmount || 0
//         const paymentMethod = sale.paymentMethod || "CASH"
//         const notes = sale.notes || ""



//         receiptWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Receipt - ${sale.invoiceNumber}</title>
//           <style>
//             body { font-family: monospace; padding: 5px; max-width: 300px; margin: 0 auto; }
//             h2 { text-align: center; margin: 10px 0; }
//             .line { border-top: 1px dashed #000; margin: 10px 0; }
//             .row { display: flex; justify-content: space-between; margin: 5px 0; }
//             .bold { font-weight: bold; }
//             .center { text-align: center; }
//             table { width: 100%; border-collapse: collapse; }
//             th, td { text-align: left; padding: 5px 0; }
//             .right { text-align: right; }
//             .receipt-table {
//   width: 100%;
//   border-collapse: collapse;
//   table-layout: fixed; /* 🔥 VERY IMPORTANT */
// }

// .receipt-table th,
// .receipt-table td {
//   padding: 4px 3px;
//   font-size: 12px;
//   line-height: 1.2;
// }

// .receipt-table thead th {
//   border-bottom: 1px dashed #000;
//   padding-bottom: 6px;
// }

// .receipt-table .left {
//   text-align: left;
// }

// .receipt-table .right {
//   text-align: right;
//   white-space: nowrap;
// }

// /* Item column */
// .receipt-table .item {
//   word-break: break-word;
//   padding-right: 6px;
// }

//           </style>
//         </head>
//         <body>
//           <h2>AT-TOHFA</h2>
//           <div class="center">Gift Shop & Stationery</div>
//           <div class="center">Kamarpara, Road-1, House-1</div>
//           <div class="center">Phone: 01752372837</div>
//           <div class="line"></div>
//           <div class="row"><span>Invoice:</span><span>${sale.invoiceNumber}</span></div>
//           <div class="row"><span>Date:</span><span>${new Date(sale.createdAt).toLocaleString()}</span></div>
//           <div class="row"><span>Customer:</span><span>${sale.customerName}</span></div>
//           ${sale.customerPhone ? `<div class="row"><span>Phone:</span><span>${sale.customerPhone}</span></div>` : ""}
//           <div class="line"></div>
// <table class="receipt-table">
//   <colgroup>
//     <col style="width: 46%">
//     <col style="width: 14%">
//     <col style="width: 20%">
//     <col style="width: 20%">
//   </colgroup>

//   <thead>
//     <tr>
//       <th class="left">Item</th>
//       <th class="right">Qty</th>
//       <th class="right">Price</th>
//       <th class="right">Total</th>
//     </tr>
//   </thead>

//   <tbody>
//     ${cartItems
//                 .map(
//                     (item: CartItem) => `
//       <tr>
//         <td class="item">${item.productName}</td>
//         <td class="right">${item.quantity}</td>
//         <td class="right">${item.unitPrice.toFixed(2)}</td>
//         <td class="right">${item.subtotal.toFixed(2)}</td>
//       </tr>
//     `,
//                 )
//                 .join("")}
//   </tbody>
// </table>
//           <div class="line"></div>
//           <div class="row"><span>Subtotal:</span><span>৳${sale.subtotal.toFixed(2)}</span></div>
//           ${sale.discount > 0 ? `<div class="row"><span>Discount:</span><span>-৳${sale.discount.toFixed(2)}</span></div>` : ""}
//           ${sale.tax > 0 ? `<div class="row"><span>Tax:</span><span>৳${sale.tax.toFixed(2)}</span></div>` : ""}
//           <div class="line"></div>
//           <div class="row bold"><span>TOTAL:</span><span>৳${sale.total.toFixed(2)}</span></div>
//           ${sale.paymentMethod === "cash"
//                 ? `
//             <div class="row"><span>Received:</span><span>৳${sale.receivedAmount.toFixed(2)}</span></div>
//             <div class="row"><span>Change:</span><span>৳${sale.changeAmount.toFixed(2)}</span></div>
//           `
//                 : ""
//             }
//           <div class="row"><span>Payment:</span><span>${sale.paymentMethod.toUpperCase()}</span></div>
//           <div class="line"></div>
//           <div class="center">Thanks for shopping—see you again!</div>
//         <div class="center">Built:aethrasoft.com | 01750-256844</div>
//           <script>window.print(); window.onafterprint = () => window.close();</script>
//         </body>
//       </html>
//     `)
//         receiptWindow.document.close()
//     }


//     const getCompatibleUnits = (productUnit: string) => {
//         const productUnitDef = getUnitByShortName(productUnit)
//         if (!productUnitDef) return []

//         return PREDEFINED_UNITS.filter((u) => canConvertUnit(productUnit, u.shortName))
//     }

//     return (
//         <div ref={containerRef} className={cn("h-screen flex flex-col bg-background", isFullscreen && "p-4")}>
//             {/* Header */}
//             <div className="border-b border-border bg-card px-6 py-4">
//                 <div className="flex items-center justify-between">
//                     <h1 className="text-2xl font-bold">Point of Sale</h1>
//                     <div className="flex items-center gap-4">
//                         <div className="text-sm text-muted-foreground">
//                             {new Date().toLocaleDateString("en-US", {
//                                 weekday: "short",
//                                 year: "numeric",
//                                 month: "short",
//                                 day: "numeric",
//                             })}
//                         </div>
//                         <Button variant="outline" size="sm" onClick={toggleFullscreen}>
//                             {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
//                         </Button>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="flex flex-1 overflow-hidden">
//                 {/* Products Section */}
//                 <div className="flex-1 flex flex-col overflow-hidden">
//                     {/* Search & Filters */}
//                     <div className="border-b border-border bg-card px-6 py-4">
//                         <div className="flex gap-4">
//                             <div className="flex-1 relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                                 <Input
//                                     placeholder="Search products by name, SKU, or barcode..."
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     className="pl-10"
//                                 />
//                             </div>
//                             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                                 <SelectTrigger className="w-[180px]">
//                                     <Filter className="h-4 w-4 mr-2" />
//                                     <SelectValue placeholder="Category" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">All Categories</SelectItem>
//                                     {categories.map((category) => (
//                                         <SelectItem key={category.id} value={category.id}>
//                                             {category.name}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                             <Select value={selectedBrand} onValueChange={setSelectedBrand}>
//                                 <SelectTrigger className="w-[180px]">
//                                     <Filter className="h-4 w-4 mr-2" />
//                                     <SelectValue placeholder="Brand" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">All Brands</SelectItem>
//                                     {brands.map((brand) => (
//                                         <SelectItem key={brand.id} value={brand.id}>
//                                             {brand.name}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     {/* Products Grid */}
//                     <div className="flex-1 overflow-auto p-6">
//                         {isLoadingProducts ? (
//                             <div className="flex items-center justify-center h-full">
//                                 <div className="text-center">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//                                     <p className="text-muted-foreground">Loading products...</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//                                     {filteredProducts.map((product) => {
//                                         const productUnitDef = getUnitByShortName(product.unit)
//                                         return (
//                                             <Card
//                                                 key={product.productID}
//                                                 className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
//                                                 onClick={() => addToCart(product)}
//                                             >
//                                                 <div className="space-y-2 content-center">
//                                                     <div className="relative h-40 w-40 mx-auto rounded-xl overflow-hidden bg-muted group">
//                                                         <div className="flex h-full w-full items-center justify-center">
//                                                             <Package className="h-12 w-12 text-muted-foreground" />
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex items-start justify-between">
//                                                         <div className="flex-1">
//                                                             <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
//                                                             <p className="text-xs text-muted-foreground">{product.sku}</p>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex items-center justify-between">
//                                                         <span className="text-lg font-bold text-primary">৳{product.sellingPrice}</span>
//                                                         <Badge
//                                                             variant={product.isLowStock ? "destructive" : "secondary"}
//                                                         >
//                                                             {product.stockQuantity} {productUnitDef?.shortName || product.unit}
//                                                         </Badge>
//                                                     </div>
//                                                 </div>
//                                             </Card>
//                                         )
//                                     })}
//                                 </div>
//                                 {filteredProducts.length === 0 && (
//                                     <div className="flex items-center justify-center h-full">
//                                         <div className="text-center text-muted-foreground">
//                                             <p>No products found</p>
//                                             <p className="text-sm">Try adjusting your search or filters</p>
//                                         </div>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </div>

//                 {/* Cart Section */}
//                 <div className="w-[400px] border-l border-border bg-card flex flex-col">
//                     {/* Cart Header */}
//                     <div className="border-b border-border px-6 py-4">
//                         <div className="flex items-center justify-between">
//                             <h2 className="text-lg font-bold flex items-center gap-2">
//                                 <ShoppingCart className="h-5 w-5" />
//                                 Cart ({cart.length})
//                             </h2>
//                             {cart.length > 0 && (
//                                 <Button variant="ghost" size="sm" onClick={clearCart}>
//                                     <Trash2 className="h-4 w-4" />
//                                 </Button>
//                             )}
//                         </div>
//                     </div>

//                     {/* Cart Items */}
//                     <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
//                         {cart.length === 0 ? (
//                             <div className="flex items-center justify-center h-full text-muted-foreground text-center">
//                                 <div>
//                                     <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
//                                     <p>Cart is empty</p>
//                                     <p className="text-sm">Add products to get started</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             cart.map((item, index) => (
//                                 <Card key={`${item.productId}-${item.saleUnit}-${index}`} className="p-3">
//                                     <div className="flex items-start gap-3">
//                                         <div className="flex-1">
//                                             <h4 className="font-medium text-sm">{item.productName}</h4>
//                                             <p className="text-xs text-muted-foreground">{item.sku}</p>
//                                             <p className="text-sm font-medium text-primary mt-1">৳{item.unitPrice} / unit</p>
//                                         </div>
//                                         <Button
//                                             variant="ghost"
//                                             size="icon"
//                                             className="h-7 w-7"
//                                             onClick={() => removeFromCart(item.productId, item.saleUnit)}
//                                         >
//                                             <X className="h-4 w-4" />
//                                         </Button>
//                                     </div>
//                                     <div className="flex items-center justify-between mt-3">
//                                         <div className="flex items-center gap-2">
//                                             <Button
//                                                 variant="outline"
//                                                 size="icon"
//                                                 className="h-7 w-7 bg-transparent"
//                                                 onClick={() => updateQuantity(item.productId, item.saleUnit, -1)}
//                                             >
//                                                 <Minus className="h-3 w-3" />
//                                             </Button>
//                                             <span className="w-16 text-center font-medium text-sm">
//                                                 {item.saleQuantity} {item.saleUnit}
//                                             </span>
//                                             <Button
//                                                 variant="outline"
//                                                 size="icon"
//                                                 className="h-7 w-7 bg-transparent"
//                                                 onClick={() => updateQuantity(item.productId, item.saleUnit, 1)}
//                                             >
//                                                 <Plus className="h-3 w-3" />
//                                             </Button>
//                                         </div>
//                                         <span className="font-bold">৳{item.subtotal.toFixed(2)}</span>
//                                     </div>
//                                 </Card>
//                             ))
//                         )}
//                     </div>

//                     {/* Cart Summary */}
//                     {cart.length > 0 && (
//                         <div className="border-t border-border px-6 py-4 space-y-4">
//                             <div className="space-y-2">
//                                 <div className="flex items-center justify-between text-sm">
//                                     <span className="text-muted-foreground">Subtotal</span>
//                                     <span className="font-medium">৳{subtotal.toFixed(2)}</span>
//                                 </div>
//                                 {discount > 0 && (
//                                     <div className="flex items-center justify-between text-sm">
//                                         <span className="text-muted-foreground">Discount ({discount}%)</span>
//                                         <span className="font-medium text-destructive">-৳{discountAmount.toFixed(2)}</span>
//                                     </div>
//                                 )}
//                                 {tax > 0 && (
//                                     <div className="flex items-center justify-between text-sm">
//                                         <span className="text-muted-foreground">Tax ({tax}%)</span>
//                                         <span className="font-medium">৳{taxAmount.toFixed(2)}</span>
//                                     </div>
//                                 )}
//                             </div>
//                             <div className="pt-2 border-t border-border">
//                                 <div className="flex items-center justify-between">
//                                     <span className="text-lg font-bold">Total</span>
//                                     <span className="text-2xl font-bold text-primary">৳{total.toFixed(2)}</span>
//                                 </div>
//                             </div>
//                             <Button
//                                 className="w-full"
//                                 size="lg"
//                                 onClick={() => setShowCheckout(true)}
//                                 disabled={isCreatingSale}
//                             >
//                                 <Receipt className="h-5 w-5 mr-2" />
//                                 {isCreatingSale ? "Processing..." : "Proceed to Checkout"}
//                             </Button>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Quantity Dialog */}
//             <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
//                 <DialogContent className="max-w-md">
//                     <DialogHeader>
//                         <DialogTitle>Add to Cart</DialogTitle>
//                         <DialogDescription>{selectedProduct?.name} - Select quantity and unit</DialogDescription>
//                     </DialogHeader>
//                     <div className="space-y-4 py-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="quantity">Quantity *</Label>
//                             <Input
//                                 id="quantity"
//                                 type="number"
//                                 step="0.01"
//                                 min="0.01"
//                                 value={customQuantity}
//                                 onChange={(e) => setCustomQuantity(e.target.value)}
//                                 placeholder="Enter quantity"
//                                 autoFocus
//                             />
//                         </div>

//                         {selectedProduct && customQuantity && customUnit !== selectedProduct.unit && (
//                             <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
//                                 {customQuantity} {customUnit} ={" "}
//                                 {(convertQuantity(Number.parseFloat(customQuantity), customUnit, selectedProduct.unit) || 0).toFixed(4)}{" "}
//                                 {selectedProduct.unit}
//                             </div>
//                         )}
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => setShowQuantityDialog(false)}>
//                             Cancel
//                         </Button>
//                         <Button onClick={confirmAddToCart}>Add to Cart</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>

//             {/* Checkout Dialog */}
//             <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
//                 <DialogContent className="max-w-lg">
//                     <DialogHeader>
//                         <DialogTitle>Complete Sale</DialogTitle>
//                         <DialogDescription>Enter customer details and payment information</DialogDescription>
//                     </DialogHeader>
//                     <div className="space-y-4 py-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="customerName">Customer Name (Optional)</Label>
//                             <Input
//                                 id="customerName"
//                                 placeholder="Walk-in Customer"
//                                 value={customerName}
//                                 onChange={(e) => setCustomerName(e.target.value)}
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
//                             <Input
//                                 id="customerPhone"
//                                 placeholder="01XXXXXXXXX"
//                                 value={customerPhone}
//                                 onChange={(e) => setCustomerPhone(e.target.value)}
//                             />
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="discount">Discount (%)</Label>
//                                 <Input
//                                     id="discount"
//                                     type="number"
//                                     min="0"
//                                     max="100"
//                                     value={discount}
//                                     onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
//                                 />
//                             </div>
//                             {/* <div className="space-y-2">
//                                 <Label htmlFor="tax">Tax (%)</Label>
//                                 <Input
//                                     id="tax"
//                                     type="number"
//                                     min="0"
//                                     max="100"
//                                     value={tax}
//                                     onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
//                                 />
//                             </div> */}
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="paymentMethod">Payment Method *</Label>
//                             <Select value={paymentMethod} defaultValue="CASH" onValueChange={setPaymentMethod}>
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="CASH">Cash</SelectItem>
//                                     <SelectItem value="CARD">Card</SelectItem>
//                                     <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         {paymentMethod === "CASH" && (
//                             <div className="space-y-2">
//                                 <Label htmlFor="receivedAmount">Received Amount (৳) *</Label>
//                                 <Input
//                                     id="receivedAmount"
//                                     type="number"
//                                     step="0.01"
//                                     min="0"
//                                     value={receivedAmount}
//                                     onChange={(e) => setReceivedAmount(e.target.value)}
//                                     placeholder="0.00"
//                                 />
//                                 {receivedAmountNum >= total && (
//                                     <p className="text-sm text-muted-foreground">Change: ৳{changeAmount.toFixed(2)}</p>
//                                 )}
//                             </div>
//                         )}
//                         <div className="space-y-2">
//                             <Label htmlFor="notes">Notes (Optional)</Label>
//                             <Input
//                                 id="notes"
//                                 placeholder="Any additional notes..."
//                                 value={notes}
//                                 onChange={(e) => setNotes(e.target.value)}
//                             />
//                         </div>
//                         <div className="bg-muted p-4 rounded-lg space-y-2">
//                             <div className="flex items-center justify-between text-sm">
//                                 <span className="text-muted-foreground">Subtotal</span>
//                                 <span>৳{subtotal.toFixed(2)}</span>
//                             </div>
//                             {discount > 0 && (
//                                 <div className="flex items-center justify-between text-sm">
//                                     <span className="text-muted-foreground">Discount</span>
//                                     <span className="text-destructive">-৳{discountAmount.toFixed(2)}</span>
//                                 </div>
//                             )}
//                             {tax > 0 && (
//                                 <div className="flex items-center justify-between text-sm">
//                                     <span className="text-muted-foreground">Tax</span>
//                                     <span>৳{taxAmount.toFixed(2)}</span>
//                                 </div>
//                             )}
//                             <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-border">
//                                 <span>Total</span>
//                                 <span className="text-primary">৳{total.toFixed(2)}</span>
//                             </div>
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => setShowCheckout(false)}>
//                             Cancel
//                         </Button>
//                         <Button onClick={handleCheckout} disabled={isCreatingSale}>
//                             {isCreatingSale ? "Processing..." : "Complete Sale"}
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     )
// }