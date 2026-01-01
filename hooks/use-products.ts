"use client"

import { useState } from "react"
import { useGetAll } from "./useGet"

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

    category?: {
        categoryID: number
        name: string
    }
    brand?: {
        brandID: number
        name: string
    }
}

interface MetaData {
    currentPage: number
    itemCount: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
}

interface UseProductsReturn {
    products: Product[]
    meta: MetaData
    isLoading: boolean
    searchTerm: string
    currentPage: number
    itemsPerPage: number
    setItemsPerPage: (count: number) => void
    setSearchTerm: (term: string) => void
    setCurrentPage: (page: number) => void
    refetch: () => void
}

export const useProducts = (): UseProductsReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Build query parameters for pagination and search
    const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
    }).toString()

    const { data, isLoading, refetch } = useGetAll<any>(`/products?${queryParams}`, [
        "products",
        currentPage,
        searchTerm,
        itemsPerPage
    ])

    const productsData = data?.data || []
    const meta: MetaData = data?.meta || {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    }

    // Transform API data to match our interface
    const products: Product[] = productsData.map((product: any) => ({
        productID: product.productID,
        productSid: product.productSid,
        sku: product.sku,
        name: product.name,
        description: product.description,
        barcode: product.barcode,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        taxRate: product.taxRate,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        unit: product.unit,
        categoryID: product.categoryID,
        brandID: product.brandID,
        brandName: product.brandName,
        categoryName: product.categoryName,
        profitMargin: product.profitMargin,
        reorderPoint: product.reorderPoint,
        location: product.location,
        notes: product.notes,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        category: product.category,
        brand: product.brand
    }))

    return {
        products,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        itemsPerPage,
        setItemsPerPage,
        setSearchTerm,
        setCurrentPage,
        refetch
    }
}