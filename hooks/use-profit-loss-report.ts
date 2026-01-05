"use client"

import { useGet } from "./useGet"
import { ProfitLossData, ReportFilters } from "@/types/dashboard"

export const useProfitLossReport = (filters?: Partial<ReportFilters>) => {
    // Build query parameters
    const params = new URLSearchParams()
    if (filters?.period) params.append('period', filters.period)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryString = params.toString()

    const { data, isLoading, error, refetch } = useGet<any>(
        `/dashboard/profit-loss-report${queryString ? `?${queryString}` : ''}`,
        ["profit-loss-report", filters]
    )

    const profitLossData: ProfitLossData | null = data || null

    return {
        profitLossData,
        isLoading,
        error,
        refetch,
    }
}