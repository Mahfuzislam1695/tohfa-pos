"use client"

import { useGet } from "./useGet"
import { InventoryReportData } from "@/types/dashboard"

export const useInventoryReport = () => {
    const { data, isLoading, error, refetch } = useGet<any>(
        "/dashboard/inventory-report",
        ["inventory-report"]
    )

    const inventoryReportData: InventoryReportData | null = data || null

    return {
        inventoryReportData,
        isLoading,
        error,
        refetch,
    }
}