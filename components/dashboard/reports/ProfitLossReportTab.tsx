import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"
import { ReportFilters } from "@/types/dashboard"
import { useProfitLossReport } from "@/hooks/use-profit-loss-report"
import { ProfitLossReportSummary } from "./profit-loss/ProfitLossReportSummary"
import { ProfitLossReportDetailed } from "./profit-loss/ProfitLossReportDetailed"

interface ProfitLossReportTabProps {
    filters: ReportFilters
}

export function ProfitLossReportTab({ filters }: ProfitLossReportTabProps) {
    const { profitLossData, isLoading, error } = useProfitLossReport(filters)

    if (isLoading) {
        return (
            <TabsContent value="profit-loss" className="space-y-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </TabsContent>
        )
    }

    if (error) {
        return (
            <TabsContent value="profit-loss" className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-destructive">
                            <TrendingDown className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Error loading profit & loss report</h3>
                            <p className="text-sm mt-2">{error.message}</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        )
    }

    if (!profitLossData) {
        return (
            <TabsContent value="profit-loss" className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No profit & loss data available</h3>
                            <p className="text-sm mt-2">Select a different period to view financial data</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        )
    }

    return (
        <TabsContent value="profit-loss" className="space-y-4">
            <ProfitLossReportSummary data={profitLossData} />
            <ProfitLossReportDetailed data={profitLossData} />
        </TabsContent>
    )
}