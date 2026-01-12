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

    const { data, isLoading, error, refetch } = useGet<ProfitLossData>(
        `/dashboard/profit-loss-report${queryString ? `?${queryString}` : ''}`,
        ["profit-loss-report", filters]
    )

    // Transform data to ensure it matches the expected structure
    const transformData = (data: any): ProfitLossData | null => {
        if (!data) return null

        return {
            summary: {
                totalRevenue: data.summary?.totalRevenue || 0,
                totalCostOfGoodsSold: data.summary?.totalCostOfGoodsSold || 0,
                grossProfit: data.summary?.grossProfit || 0,
                grossProfitMargin: data.summary?.grossProfitMargin || 0,
                totalExpenses: data.summary?.totalExpenses || 0,
                netProfit: data.summary?.netProfit || 0,
                netProfitMargin: data.summary?.netProfitMargin || 0,
                totalRemovalsLoss: data.summary?.totalRemovalsLoss || 0,
                totalReturnsAmount: data.summary?.totalReturnsAmount || 0,
                totalReturnsCount: data.summary?.totalReturnsCount || 0,
                operatingProfit: data.summary?.operatingProfit || 0,
                grossSales: data.summary?.grossSales || 0,
                netSales: data.summary?.netSales || 0,
                returnRate: data.summary?.returnRate || 0,
            },
            categoryBreakdown: data.categoryBreakdown || [],
            monthlyTrend: data.monthlyTrend || [],
            topProfitableProducts: data.topProfitableProducts || [],
            expenseBreakdown: data.expenseBreakdown || [],
            returnsBreakdown: data.returnsBreakdown || {
                summary: { totalAmount: 0, totalCount: 0, averageReturnAmount: 0 },
                breakdown: []
            }
        }
    }

    const profitLossData = transformData(data)

    return {
        profitLossData,
        isLoading,
        error,
        refetch,
    }
}
// "use client"

// import { useGet } from "./useGet"
// import { ProfitLossData, ReportFilters } from "@/types/dashboard"

// export const useProfitLossReport = (filters?: Partial<ReportFilters>) => {
//     // Build query parameters
//     const params = new URLSearchParams()
//     if (filters?.period) params.append('period', filters.period)
//     if (filters?.startDate) params.append('startDate', filters.startDate)
//     if (filters?.endDate) params.append('endDate', filters.endDate)

//     const queryString = params.toString()

//     const { data, isLoading, error, refetch } = useGet<any>(
//         `/dashboard/profit-loss-report${queryString ? `?${queryString}` : ''}`,
//         ["profit-loss-report", filters]
//     )

//     const profitLossData: ProfitLossData | null = data || null

//     return {
//         profitLossData,
//         isLoading,
//         error,
//         refetch,
//     }
// }