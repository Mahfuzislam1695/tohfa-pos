import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, TrendingDown } from "lucide-react"
import { ReportFilters, ReportPeriod } from "@/types/dashboard"
import { useSalesReport } from "@/hooks/use-sales-report"
import { SalesReportSummary } from "./sales/SalesReportSummary"
import { SalesReportDetailed } from "./sales/SalesReportDetailed"


interface SalesReportTabProps {
    filters: ReportFilters
    getPeriodLabel: (period: ReportPeriod) => string
}

export function SalesReportTab({ filters, getPeriodLabel }: SalesReportTabProps) {
    const { salesReportData, isLoading, error } = useSalesReport(filters)

    const handleExportSalesCSV = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.period) params.append('period', filters.period)
            if (filters.startDate) params.append('startDate', filters.startDate)
            if (filters.endDate) params.append('endDate', filters.endDate)

            const response = await fetch(`/api/dashboard/sales-report/export/csv?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to export')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export CSV')
        }
    }

    if (isLoading) {
        return (
            <TabsContent value="sales" className="space-y-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </TabsContent>
        )
    }

    if (error) {
        return (
            <TabsContent value="sales" className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-destructive">
                            <TrendingDown className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Error loading sales report</h3>
                            <p className="text-sm mt-2">{error.message}</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        )
    }

    if (!salesReportData) {
        return (
            <TabsContent value="sales" className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No sales data available</h3>
                            <p className="text-sm mt-2">Select a different period or check your data</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        )
    }

    return (
        <TabsContent value="sales" className="space-y-4">
            <SalesReportSummary data={salesReportData} />
            <SalesReportDetailed
                data={salesReportData}
                filters={filters}
                getPeriodLabel={getPeriodLabel}
                onExport={handleExportSalesCSV}
            />
        </TabsContent>
    )
}