"use client"

import { useState } from "react"
import { useGetAll } from "./useGet"
import { RemovalResponseDto, RemovalFilters } from "@/types/removal"

interface MetaData {
    currentPage: number
    itemCount: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
}

interface UseRemovalsReturn {
    removals: RemovalResponseDto[]
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

export const useRemovals = (filters?: Partial<RemovalFilters>): UseRemovalsReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Build query parameters for pagination, search, and filters
    const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filters?.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters?.endDate && { endDate: filters.endDate.toISOString() }),
        ...(filters?.reason && { reason: filters.reason }),
        ...(filters?.productId && { productId: filters.productId.toString() }),
        ...(filters?.minLoss && { minLoss: filters.minLoss.toString() }),
        ...(filters?.maxLoss && { maxLoss: filters.maxLoss.toString() }),
    }).toString()

    const { data, isLoading, refetch } = useGetAll<any>(`/removals?${queryParams}`, [
        "removals",
        currentPage,
        searchTerm,
        itemsPerPage,
        filters
    ])

    const removalsData = data?.data || []
    const meta: MetaData = data?.meta || {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    }

    // Transform API data to match our interface
    const removals: RemovalResponseDto[] = removalsData.map((removal: any) => ({
        removalID: removal.removalID,
        removalSid: removal.removalSid,
        productID: removal.productID,
        reason: removal.reason,
        quantity: removal.quantity,
        estimatedLoss: removal.estimatedLoss,
        batchId: removal.batchId,
        expiryDate: removal.expiryDate,
        damageDescription: removal.damageDescription,
        notes: removal.notes,
        batchDetails: removal.batchDetails,
        createdAt: removal.createdAt,
        updatedAt: removal.updatedAt,
        removedBy: removal.removedBy,
        product: removal.product,
        totalLoss: removal.totalLoss
    }))

    return {
        removals,
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