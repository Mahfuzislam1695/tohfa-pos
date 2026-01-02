"use client"

import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { useGet } from "./useGet"

export interface ReturnItem {
    returnItemID: number
    returnItemSid: string
    sellItemID: number
    quantity: number
    unitPrice: number
    refundAmount: number
    reason: string
    condition: string
    notes: string
    isRestocked: boolean
    restockedAt: string | null
    createdAt: string
    sellItem: {
        sellItemID: number
        productID: number
        productName: string
        productSku: string
        quantity: string
        unitPrice: string
    }
}

export interface ReturnDetails {
    returnID: number
    returnSid: string
    returnNumber: string
    sellID: number
    returnType: 'FULL_RETURN' | 'PARTIAL_RETURN' | 'EXCHANGE'
    returnReason: string
    status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
    customerName: string
    customerPhone: string
    refundAmount: number
    restockingFee: number
    totalAmount: number
    exchangeForProductID: number | null
    description: string
    attachments: string | null
    processedByID: number | null
    createdAt: string
    updatedAt: string
    processedAt: string | null
    sell: {
        sellID: number
        invoiceNumber: string
        total: string
        createdAt: string
    }
    exchangeForProduct: {
        productID: number
        productSid: string
        sku: string
        name: string
    } | null
    processedBy: {
        userID: number
        name: string
        email: string
    } | null
    returnItems: ReturnItem[]
}

interface UseReturnDetailsReturn {
    returnData: ReturnDetails | null
    isLoading: boolean
    error: any
    refetch: () => void
    invalidateCache: () => void
}

export const useReturnDetails = (returnId: number | undefined): UseReturnDetailsReturn => {
    const queryClient = useQueryClient()

    // Fetch return details
    const { data, isLoading, error, refetch } = useGet<any>(
        `/returns/${returnId}`,
        ["returnDetails"],
        {
            enabled: !!returnId
        }
    )

    // Extract return data from API response
    const returnData: ReturnDetails | null = data?.data || null

    // Helper function to invalidate cache
    const invalidateCache = useCallback(() => {
        if (returnId) {
            queryClient.invalidateQueries({ queryKey: ["returnDetails", returnId] })
        }
    }, [queryClient, returnId])

    return {
        returnData,
        isLoading,
        error,
        refetch,
        invalidateCache
    }
}

