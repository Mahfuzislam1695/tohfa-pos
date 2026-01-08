import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Package, TrendingDown } from "lucide-react"
import { useInventoryReport } from "@/hooks/use-inventory-report"
import { InventoryReportDetailed } from "./inventory/InventoryReportDetailed"
import { InventoryReportSummary } from "./inventory/InventoryReportSummary"

export function InventoryReportTab() {
    const { inventoryReportData, isLoading, error } = useInventoryReport()

    const handleExportInventoryCSV = async () => {
        try {
            const response = await fetch('/api/dashboard/inventory-report/export/csv')
            if (!response.ok) throw new Error('Failed to export')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`
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
            <TabsContent value="inventory" className="space-y-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </TabsContent>
        )
    }

    if (error) {
        return (
            <TabsContent value="inventory" className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-destructive">
                            <Package className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Error loading inventory report</h3>
                            <p className="text-sm mt-2">{error.message}</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        )
    }

    if (!inventoryReportData) {
        return (
            <TabsContent value="inventory" className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No inventory data available</h3>
                            <p className="text-sm mt-2">Check your product data</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        )
    }

    return (
        <TabsContent value="inventory" className="space-y-4">
            <InventoryReportSummary data={inventoryReportData} />
            <InventoryReportDetailed
                data={inventoryReportData}
                onExport={handleExportInventoryCSV}
            />
        </TabsContent>
    )
}