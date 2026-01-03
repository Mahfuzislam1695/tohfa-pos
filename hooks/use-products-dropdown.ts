"use client"

import { useGet } from "./useGet"

export interface ProductDropdownItem {
    productID: number
    sku: string
    name: string
    stockQuantity: number
    sellingPrice: number
}

interface UseProductsDropdownReturn {
    products: ProductDropdownItem[]
    isLoading: boolean
    error: any
    refetch: () => void
}

export const useProductsDropdown = (): UseProductsDropdownReturn => {
    const { data, isLoading, error, refetch } = useGet<any>(
        "/products/dropdown/active",
        ["products-dropdown"]
    )

    const productsData = data || []

    // Transform API data to match our interface
    const products: ProductDropdownItem[] = productsData.map((product: any) => ({
        productID: product.productID,
        sku: product.sku,
        name: product.name,
        stockQuantity: product.stockQuantity,
        sellingPrice: product.sellingPrice
    }))

    return {
        products,
        isLoading,
        error,
        refetch
    }
}