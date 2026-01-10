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
    const [discountType, setDiscountType] = useState("SPECIAL_OFFER") // ADD THIS LINE
    const [tax, setTax] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
    const [paymentStatus, setPaymentStatus] = useState("COMPLETED") // ADD THIS LINE
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
                console.log("data", data.data)

                // Reset form
                setCart([])
                setCustomerName("")
                setCustomerPhone("")
                setDiscount(0)
                setDiscountType("SPECIAL_OFFER") // ADD THIS
                setTax(0)
                setPaymentStatus("COMPLETED") // ADD THIS
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

    // ADD THIS FUNCTION
    const calculateDiscountAmount = () => {
        if (discountType === 'PERCENTAGE') {
            return (subtotal * discount) / 100
        } else if (discountType === 'SPECIAL_OFFER') {
            // For special offer, discount is the amount to subtract
            return Math.min(discount, subtotal)
        } else {
            // FIXED_AMOUNT and others
            return discount
        }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const discountAmount = calculateDiscountAmount() // UPDATE THIS
    const taxAmount = ((subtotal - discountAmount) * tax) / 100
    const total = subtotal - discountAmount + taxAmount
    const receivedAmountNum = Number.parseFloat(receivedAmount) || 0
    const changeAmount = paymentStatus === 'COMPLETED' ? Math.max(0, receivedAmountNum - total) : 0
    const dueAmount = paymentStatus === 'PARTIAL' ? Math.max(0, total - receivedAmountNum) : 0


    //     const handleCheckout = () => {
    //     if (cart.length === 0) {
    //         toast.error("Cart is empty!")
    //         return
    //     }

    //     if (paymentMethod === "cash" && receivedAmountNum < total) {
    //         toast.error("Received amount is less than total amount!")
    //         return
    //     }

    //     const saleData = {
    //         items: cart.map((item) => ({
    //             productId: item.productId,
    //             quantity: item.quantity,
    //             unitPrice: item.unitPrice
    //         })),
    //         customerName: customerName || "Walk-in Customer",
    //         customerPhone: customerPhone || "",
    //         discount: discountAmount,
    //         taxRate: tax,
    //         paymentMethod: paymentMethod.toUpperCase(),
    //         receivedAmount: paymentMethod === "cash" ? receivedAmountNum : total,
    //         notes: notes || ""
    //     }

    //     createSale(saleData)
    // }





    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error("Cart is empty!")
            return
        }

        // Validate partial payment requirements
        if (paymentStatus === 'PARTIAL') {
            if (!customerName.trim() || !customerPhone.trim()) {
                toast.error("Customer name and phone are required for partial payments!")
                return
            }
            if (receivedAmountNum <= 0) {
                toast.error("Received amount must be greater than 0 for partial payments!")
                return
            }
            if (receivedAmountNum > total) {
                toast.error("Received amount cannot be greater than total for partial payments!")
                return
            }
        }

        // Validate completed payment
        if (paymentStatus === 'COMPLETED' && receivedAmountNum < total) {
            toast.error("Received amount is less than total amount!")
            return
        }

        // Prepare sale data
        const saleData = {
            items: cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            })),
            customerName: customerName.trim() || "Walk-in Customer",
            customerPhone: customerPhone.trim() || "",
            discount: discountAmount,
            discountType: discountType, // ADD THIS
            taxRate: tax,
            paymentMethod: paymentMethod.toUpperCase(),
            paymentStatus: paymentStatus, // ADD THIS
            receivedAmount: paymentStatus === 'COMPLETED' ? Math.max(receivedAmountNum, total) : receivedAmountNum,
            notes: notes || ""
        }

        console.log("Sending sale data:", saleData)
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
                    discount={discountType === 'PERCENTAGE' ? discount : 0}
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
                discountAmount={discountAmount}
                discountType={discountType}
                setDiscountType={setDiscountType}
                tax={tax}
                setTax={setTax}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                paymentStatus={paymentStatus}
                setPaymentStatus={setPaymentStatus}
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
                dueAmount={dueAmount}
                handleCheckout={handleCheckout}
                isCreatingSale={isCreatingSale}
            />
        </div>
    )
}