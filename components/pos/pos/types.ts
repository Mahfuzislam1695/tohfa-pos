export interface Product {
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

export interface CartItem {
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