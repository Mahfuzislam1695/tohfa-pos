"use client"

import { useState } from "react"
import { useGetAll } from "./useGet"

export interface Purchase {
    batchID: number
    quantity: number
    unitCost: number
    expiryDate?: string
    receivedAt: string
    notes?: string
    reason?: string
    batchValue: number
    createdBy: {
        userID: number
        name: string
        email: string
    }
    product?: {
        productID: number
        name: string
        sku: string
    }
}

export interface PurchaseStatistics {
    totalBatches: number
    totalQuantity: number
    totalValue: number
    expiringSoonCount: number
    expiredCount: number
    batchesWithExpiry: number
    batchesWithoutExpiry: number
    averageBatchValue: number
    averageBatchQuantity: number
}

interface MetaData {
    currentPage: number
    itemCount: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
    statistics?: PurchaseStatistics
}

interface UsePurchasesReturn {
    purchases: Purchase[]
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

export const usePurchases = (productId?: number): UsePurchasesReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Build query parameters
    const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(productId && { productId: productId.toString() })
    }).toString()

    const { data, isLoading, refetch } = useGetAll<any>(
        productId
            ? `/products/${productId}/inventory/batches?${queryParams}`
            : `/inventory/batches?${queryParams}`,
        [
            "purchases",
            currentPage,
            searchTerm,
            itemsPerPage,
            productId
        ]
    )

    const purchasesData = data?.data || []
    const meta: MetaData = data?.meta || {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    }

    // Transform API data
    const purchases: Purchase[] = purchasesData.map((purchase: any) => ({
        batchID: purchase.batchID,
        quantity: purchase.quantity,
        unitCost: purchase.unitCost,
        expiryDate: purchase.expiryDate,
        receivedAt: purchase.receivedAt,
        notes: purchase.notes,
        reason: purchase.reason,
        batchValue: purchase.batchValue,
        createdBy: purchase.createdBy,
        product: purchase.product
    }))

    return {
        purchases,
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
