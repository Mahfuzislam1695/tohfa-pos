import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, BarChart3, DollarSign, Lightbulb, PieChart, TrendingUp } from "lucide-react"
import { ProfitLossData } from "@/types/dashboard"
import { formatCurrency } from "@/lib/units"

interface ProfitLossReportSummaryProps {
    data: ProfitLossData
}

export function ProfitLossReportSummary({ data }: ProfitLossReportSummaryProps) {
    return (
        <div className="space-y-6">
            {/* Quick Snapshot - Most Important Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Business Health Card */}
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Business Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Net Profit</span>
                                <div className={`text-lg font-bold ${data.summary.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                                    {formatCurrency(data.summary.netProfit)}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Margin</span>
                                <div className={`text-lg font-bold ${data.summary.netProfitMargin >= 0 ? "text-green-700" : "text-red-700"}`}>
                                    {data.summary.netProfitMargin.toFixed(1)}%
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                                {data.summary.netProfit >= 0 ? "✓ Profitable" : "⚠ Needs Attention"}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Efficiency Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Revenue Efficiency
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Revenue</span>
                                <div className="text-lg font-bold text-blue-700">
                                    {formatCurrency(data.summary.totalRevenue)}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Gross Profit</span>
                                <div className="text-lg font-bold text-emerald-700">
                                    {formatCurrency(data.summary.grossProfit)}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                                Every ৳100 revenue → ৳{data.summary.grossProfitMargin.toFixed(0)} gross profit
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cost Management Card */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Cost Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Cost of Goods</span>
                                <div className="text-lg font-bold text-red-700">
                                    {formatCurrency(data.summary.totalCostOfGoodsSold)}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Expenses</span>
                                <div className="text-lg font-bold text-orange-700">
                                    {formatCurrency(data.summary.totalExpenses)}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                                Cost is {(data.summary.totalRevenue > 0 ?
                                    (data.summary.totalCostOfGoodsSold / data.summary.totalRevenue * 100).toFixed(0) : 0)}% of revenue
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Losses Card */}
                <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Losses & Issues
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Losses</span>
                                <div className="text-lg font-bold text-red-700">
                                    {formatCurrency(data.summary.totalRemovalsLoss + data.summary.totalReturnsLoss)}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Impact on Profit</span>
                                <div className="text-lg font-bold text-red-700">
                                    {data.summary.totalRevenue > 0 ?
                                        ((data.summary.totalRemovalsLoss + data.summary.totalReturnsLoss) /
                                            data.summary.totalRevenue * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                                Losses reduce profit by {formatCurrency(data.summary.totalRemovalsLoss + data.summary.totalReturnsLoss)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Key Performance Indicators */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Performance Summary
                    </CardTitle>
                    <CardDescription>What you earn vs. what you spend</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Income Side */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-green-700 flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                Money Coming In
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm">Total Sales</span>
                                    <span className="font-bold text-green-700">
                                        {formatCurrency(data.summary.totalRevenue)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                                    <span className="text-sm">Gross Profit</span>
                                    <span className="font-bold text-emerald-700">
                                        {formatCurrency(data.summary.grossProfit)}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground pl-3">
                                    You keep <span className="font-medium">{data.summary.grossProfitMargin.toFixed(1)}%</span> of every sale
                                </div>
                            </div>
                        </div>

                        {/* Expenses Side */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-red-700 flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                Money Going Out
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                    <span className="text-sm">Product Costs</span>
                                    <span className="font-bold text-red-700">
                                        {formatCurrency(data.summary.totalCostOfGoodsSold)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <span className="text-sm">Operating Costs</span>
                                    <span className="font-bold text-orange-700">
                                        {formatCurrency(data.summary.totalExpenses)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                                    <span className="text-sm">Losses</span>
                                    <span className="font-bold text-rose-700">
                                        {formatCurrency(data.summary.totalRemovalsLoss + data.summary.totalReturnsLoss)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Line - Most Important */}
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="font-medium">Bottom Line</h3>
                                <p className="text-sm text-muted-foreground">
                                    After all costs, expenses, and losses
                                </p>
                            </div>
                            <div className={`text-2xl md:text-3xl font-bold px-4 py-3 rounded-lg ${data.summary.netProfit >= 0 ?
                                "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {data.summary.netProfit >= 0 ? "💰 " : "⚠ "}
                                {formatCurrency(data.summary.netProfit)} Net Profit
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span>You earn {data.summary.netProfitMargin.toFixed(1)}% on each sale</span>
                            </div>
                            {data.summary.netProfit < 0 && (
                                <div className="flex items-center gap-2 text-amber-700">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Revenue doesn't cover costs by {formatCurrency(Math.abs(data.summary.netProfit))}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Insights */}
            {data.summary.totalRevenue > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Quick Insights
                        </CardTitle>
                        <CardDescription>Simple breakdown for better decisions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-700">
                                    {data.summary.grossProfitMargin.toFixed(1)}%
                                </div>
                                <p className="text-sm mt-1">Gross Margin</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Your profit before expenses
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-lg">
                                <div className="text-2xl font-bold text-emerald-700">
                                    {data.summary.netProfitMargin.toFixed(1)}%
                                </div>
                                <p className="text-sm mt-1">Net Margin</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Your actual profit percentage
                                </p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-700">
                                    {data.summary.totalRevenue > 0 ?
                                        (data.summary.totalExpenses / data.summary.totalRevenue * 100).toFixed(1) : 0}%
                                </div>
                                <p className="text-sm mt-1">Expense Ratio</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Operating costs vs revenue
                                </p>
                            </div>
                            <div className="p-4 bg-rose-50 rounded-lg">
                                <div className="text-2xl font-bold text-rose-700">
                                    {data.summary.totalRevenue > 0 ?
                                        ((data.summary.totalRemovalsLoss + data.summary.totalReturnsLoss) /
                                            data.summary.totalRevenue * 100).toFixed(1) : 0}%
                                </div>
                                <p className="text-sm mt-1">Loss Ratio</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Money lost from issues
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}