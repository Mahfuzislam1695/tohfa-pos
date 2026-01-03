"use client"

import { useGet } from "./useGet"
import { RemovalStatisticsDto } from "@/types/removal"

interface UseRemovalStatisticsReturn {
    statistics: RemovalStatisticsDto | null
    isLoading: boolean
    error: any
    refetch: () => void
}

export const useRemovalStatistics = (): UseRemovalStatisticsReturn => {
    const { data, isLoading, error, refetch } = useGet<any>(
        "/removals/statistics",
        ["removal-statistics"]
    )

    // Handle empty or missing data
    const statisticsData = data

    // Check if data is empty object
    const isEmptyData = statisticsData &&
        typeof statisticsData === 'object' &&
        Object.keys(statisticsData).length === 0

    // Transform API data to match our interface
    const statistics: RemovalStatisticsDto | null = !isEmptyData && statisticsData ? {
        totalRemovals: statisticsData.totalRemovals || 0,
        totalQuantity: statisticsData.totalQuantity || 0,
        totalLoss: statisticsData.totalLoss || 0,
        monthlyRemovals: statisticsData.monthlyRemovals || [],
        reasonBreakdown: statisticsData.reasonBreakdown || {},
        productBreakdown: statisticsData.productBreakdown || [],
        recentRemovals: statisticsData.recentRemovals || []
    } : null

    return {
        statistics,
        isLoading,
        error,
        refetch
    }
}