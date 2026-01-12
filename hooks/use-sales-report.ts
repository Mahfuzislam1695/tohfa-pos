"use client"

import { useGet } from "./useGet"
import { SalesReportData, ReportFilters, ReportPeriod } from "@/types/dashboard"

export const useSalesReport = (filters?: Partial<ReportFilters>) => {
    // Build query parameters
    const params = new URLSearchParams()
    if (filters?.period) params.append('period', filters.period)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.categoryId) params.append('categoryId', filters.categoryId?.toString() || '')
    if (filters?.brandId) params.append('brandId', filters.brandId?.toString() || '')
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod)

    const queryString = params.toString()

    const { data, isLoading, error, refetch } = useGet<any>(
        `/dashboard/sales-report${queryString ? `?${queryString}` : ''}`,
        ["sales-report", filters]
    )

    // Transform data to match new structure
    const transformData = (data: any): SalesReportData | null => {
        if (!data) return null

        return {
            summary: {
                totalSales: data.summary?.totalSales || 0,
                totalRevenue: data.summary?.totalRevenue || 0,
                totalCost: data.summary?.totalCost || 0,
                totalProfit: data.summary?.totalProfit || 0,
                totalDiscount: data.summary?.totalDiscount || 0,
                totalTax: data.summary?.totalTax || 0,
                itemsSold: data.summary?.itemsSold || 0,
                averageOrderValue: data.summary?.averageOrderValue || 0,
                profitMargin: data.summary?.profitMargin || 0,
                grossSales: data.summary?.grossSales || 0,
                totalReturnsAmount: data.summary?.totalReturnsAmount || 0,
                totalReturnsItems: data.summary?.totalReturnsItems || 0,
                returnRate: data.summary?.returnRate || 0,
                netSales: data.summary?.netSales || 0,
            },
            sales: (data.sales || []).map((sale: any) => ({
                sellID: sale.sellID,
                invoiceNumber: sale.invoiceNumber,
                customerName: sale.customerName,
                customerPhone: sale.customerPhone,
                total: sale.total,
                subtotal: sale.subtotal,
                discount: sale.discount,
                tax: sale.tax,
                paymentMethod: sale.paymentMethod,
                paymentStatus: sale.paymentStatus,
                itemsCount: sale.itemsCount,
                createdAt: sale.createdAt,
                originalTotal: sale.originalTotal || sale.total,
                returnsAmount: sale.returnsAmount || 0,
                returnsItems: sale.returnsItems || 0,
                netItems: sale.netItems || sale.itemsCount,
            })),
            topProducts: data.topProducts || [],
            categoryBreakdown: data.categoryBreakdown || [],
            paymentMethodBreakdown: data.paymentMethodBreakdown || [],
            returnsBreakdown: data.returnsBreakdown || {
                summary: { totalReturns: 0, totalRefundAmount: 0, averageRefundAmount: 0 },
                recentReturns: [],
                returnTrend: [],
                topReturnedProducts: [],
            }
        }
    }

    const salesReportData = transformData(data)

    return {
        salesReportData,
        isLoading,
        error,
        refetch,
    }
}