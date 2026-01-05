"use client"

import { useState } from "react"
import { useGet } from "./useGet"
import { SalesReportData, ReportFilters, ReportPeriod } from "@/types/dashboard"

export const useSalesReport = (filters?: Partial<ReportFilters>) => {
    // Build query parameters
    const params = new URLSearchParams()
    if (filters?.period) params.append('period', filters.period)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString())
    if (filters?.brandId) params.append('brandId', filters.brandId.toString())
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod)

    const queryString = params.toString()

    const { data, isLoading, error, refetch } = useGet<any>(
        `/dashboard/sales-report${queryString ? `?${queryString}` : ''}`,
        ["sales-report", filters]
    )

    const salesReportData: SalesReportData | null = data || null

    return {
        salesReportData,
        isLoading,
        error,
        refetch,
    }
}