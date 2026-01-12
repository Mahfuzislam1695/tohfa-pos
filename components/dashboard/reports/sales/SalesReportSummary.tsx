import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calculator, DollarSign, Lightbulb, RefreshCw, ShoppingBag, TrendingUp } from "lucide-react"
import { SalesReportData } from "@/types/dashboard"
import { formatCurrency } from "@/lib/units"

interface SalesReportSummaryProps {
    data: SalesReportData
}

export function SalesReportSummary({ data }: SalesReportSummaryProps) {
    const {
        totalRevenue,
        netSales,
        grossSales,
        totalReturnsAmount,
        returnRate,
        totalProfit,
        profitMargin,
        itemsSold,
        totalSales,
        averageOrderValue,
        totalCost,
        totalDiscount
    } = data.summary;

    return (
        <div className="space-y-6">
            {/* Sales Performance Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Revenue Card */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Net Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-green-700">
                                {formatCurrency(totalRevenue)}
                            </div>
                            <div className="text-sm text-green-600">
                                After returns
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Gross: {formatCurrency(grossSales)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Returns Card */}
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Returns
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-amber-700">
                                {formatCurrency(totalReturnsAmount)}
                            </div>
                            <div className="text-sm text-amber-600">
                                {returnRate.toFixed(1)}% rate
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {data.summary.totalReturnsItems} items
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profit Card */}
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Net Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                {formatCurrency(totalProfit)}
                            </div>
                            <div className={`text-sm ${profitMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                {profitMargin.toFixed(1)}% margin
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Volume Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Sales Volume
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-blue-700">
                                {itemsSold.toFixed(0)}
                            </div>
                            <div className="text-sm text-blue-600">Items Sold</div>
                            <div className="text-xs text-muted-foreground">
                                {totalSales} transactions
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Costs & Deductions Card */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Costs & Deductions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">Product Cost</span>
                                <div className="text-sm font-bold text-red-600">
                                    {formatCurrency(totalCost)}
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Discounts</span>
                                <div className="text-sm font-bold text-orange-600">
                                    {formatCurrency(totalDiscount)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Flow */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Revenue Flow
                    </CardTitle>
                    <CardDescription>How money moves through sales process</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Flow Steps */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                                <div className="text-lg font-bold text-blue-700">
                                    {formatCurrency(grossSales)}
                                </div>
                                <p className="text-sm mt-1">Gross Sales</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Before returns
                                </p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg text-center">
                                <div className="text-lg font-bold text-amber-700">
                                    -{formatCurrency(totalReturnsAmount)}
                                </div>
                                <p className="text-sm mt-1">Returns</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {returnRate.toFixed(1)}% of gross
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                <div className="text-lg font-bold text-green-700">
                                    {formatCurrency(netSales)}
                                </div>
                                <p className="text-sm mt-1">Net Revenue</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    What you keep
                                </p>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <div className="font-medium text-green-700">
                                    {formatCurrency(netSales)}
                                </div>
                                <p className="text-xs mt-1">Revenue</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <div className="font-medium text-red-700">
                                    -{formatCurrency(totalCost)}
                                </div>
                                <p className="text-xs mt-1">Product Cost</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <div className="font-medium text-orange-700">
                                    -{formatCurrency(totalDiscount)}
                                </div>
                                <p className="text-xs mt-1">Discounts</p>
                            </div>
                            <div className={`p-3 rounded-lg ${totalProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                <div className={`font-medium ${totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {formatCurrency(totalProfit)}
                                </div>
                                <p className="text-xs mt-1">Net Profit</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Performance Insights
                    </CardTitle>
                    <CardDescription>Key metrics for better decisions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-700">
                                {formatCurrency(averageOrderValue)}
                            </div>
                            <p className="text-sm mt-1">Avg Order Value</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Per customer transaction
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                            <div className="text-lg font-bold text-emerald-700">
                                {profitMargin.toFixed(1)}%
                            </div>
                            <p className="text-sm mt-1">Profit Margin</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Net profit percentage
                            </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg">
                            <div className="text-lg font-bold text-amber-700">
                                {returnRate.toFixed(1)}%
                            </div>
                            <p className="text-sm mt-1">Return Rate</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Percentage of sales returned
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-700">
                                {totalSales > 0 ? (itemsSold / totalSales).toFixed(1) : 0}
                            </div>
                            <p className="text-sm mt-1">Items per Order</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Average basket size
                            </p>
                        </div>
                    </div>

                    {/* Actionable Insights */}
                    {returnRate > 5 && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium text-amber-700 mb-2">⚠ High Return Rate Alert</h4>
                            <p className="text-sm text-muted-foreground">
                                {returnRate.toFixed(1)}% of sales were returned. Consider checking product quality, descriptions, or customer service.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { BarChart3, Calculator, DollarSign, Lightbulb, ShoppingBag, TrendingUp } from "lucide-react"
// import { SalesReportData } from "@/types/dashboard"
// import { formatCurrency } from "@/lib/units"

// interface SalesReportSummaryProps {
//     data: SalesReportData
// }

// export function SalesReportSummary({ data }: SalesReportSummaryProps) {
//     return (
//         <div className="space-y-6">
//             {/* Sales Performance Overview */}
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 {/* Revenue Card */}
//                 <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//                     <CardHeader className="pb-3">
//                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                             <DollarSign className="h-4 w-4" />
//                             Total Revenue
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-3">
//                             <div className="text-2xl font-bold text-green-700">
//                                 {formatCurrency(data.summary.totalRevenue)}
//                             </div>
//                             <div className="flex justify-between items-center text-sm">
//                                 <span className="text-muted-foreground">Orders</span>
//                                 <span className="font-medium text-green-700">
//                                     {data.summary.totalSales}
//                                 </span>
//                             </div>
//                             <div className="text-xs text-muted-foreground pt-2 border-t">
//                                 Avg: {formatCurrency(data.summary.averageOrderValue)} per order
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Profit Card */}
//                 <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
//                     <CardHeader className="pb-3">
//                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                             <TrendingUp className="h-4 w-4" />
//                             Total Profit
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-3">
//                             <div className={`text-2xl font-bold ${data.summary.totalProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
//                                 {formatCurrency(data.summary.totalProfit)}
//                             </div>
//                             <div className="flex justify-between items-center text-sm">
//                                 <span className="text-muted-foreground">Margin</span>
//                                 <span className={`font-medium ${data.summary.profitMargin >= 0 ? "text-emerald-700" : "text-red-700"}`}>
//                                     {data.summary.profitMargin.toFixed(1)}%
//                                 </span>
//                             </div>
//                             <div className="text-xs text-muted-foreground pt-2 border-t">
//                                 Every ৳100 revenue → ৳{data.summary.profitMargin.toFixed(0)} profit
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Sales Volume Card */}
//                 <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//                     <CardHeader className="pb-3">
//                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                             <ShoppingBag className="h-4 w-4" />
//                             Sales Volume
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-3">
//                             <div className="text-2xl font-bold text-blue-700">
//                                 {data.summary.itemsSold.toFixed(0)}
//                             </div>
//                             <div className="text-sm text-muted-foreground">Items Sold</div>
//                             <div className="flex justify-between items-center text-sm">
//                                 <span className="text-muted-foreground">Avg Items/Order</span>
//                                 <span className="font-medium text-blue-700">
//                                     {(data.summary.itemsSold / data.summary.totalSales).toFixed(1)}
//                                 </span>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Costs & Deductions Card */}
//                 <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
//                     <CardHeader className="pb-3">
//                         <CardTitle className="text-sm font-medium flex items-center gap-2">
//                             <Calculator className="h-4 w-4" />
//                             Costs & Deductions
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="space-y-3">
//                             <div className="flex items-center justify-between">
//                                 <span className="text-sm">Product Cost</span>
//                                 <div className="text-sm font-bold text-red-600">
//                                     {formatCurrency(data.summary.totalCost)}
//                                 </div>
//                             </div>
//                             <div className="flex items-center justify-between">
//                                 <span className="text-sm">Discounts</span>
//                                 <div className="text-sm font-bold text-orange-600">
//                                     {formatCurrency(data.summary.totalDiscount)}
//                                 </div>
//                             </div>
//                             <div className="text-xs text-muted-foreground pt-2 border-t">
//                                 {data.summary.totalRevenue > 0 ?
//                                     ((data.summary.totalDiscount / data.summary.totalRevenue) * 100).toFixed(1) : 0}% discount rate
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>

//             {/* Quick Insights */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="text-lg flex items-center gap-2">
//                         <Lightbulb className="h-5 w-5" />
//                         Sales Insights
//                     </CardTitle>
//                     <CardDescription>Key metrics for better sales decisions</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                         <div className="p-4 bg-green-50 rounded-lg">
//                             <div className="text-lg font-bold text-green-700">
//                                 {formatCurrency(data.summary.averageOrderValue)}
//                             </div>
//                             <p className="text-sm mt-1">Average Order</p>
//                             <p className="text-xs text-muted-foreground mt-1">
//                                 Per customer
//                             </p>
//                         </div>
//                         <div className="p-4 bg-emerald-50 rounded-lg">
//                             <div className="text-lg font-bold text-emerald-700">
//                                 {data.summary.totalRevenue > 0 ?
//                                     ((data.summary.totalProfit / data.summary.totalRevenue) * 100).toFixed(1) : 0}%
//                             </div>
//                             <p className="text-sm mt-1">Profit Margin</p>
//                             <p className="text-xs text-muted-foreground mt-1">
//                                 Net profit percentage
//                             </p>
//                         </div>
//                         <div className="p-4 bg-orange-50 rounded-lg">
//                             <div className="text-lg font-bold text-orange-700">
//                                 {data.summary.totalRevenue > 0 ?
//                                     ((data.summary.totalDiscount / data.summary.totalRevenue) * 100).toFixed(1) : 0}%
//                             </div>
//                             <p className="text-sm mt-1">Discount Rate</p>
//                             <p className="text-xs text-muted-foreground mt-1">
//                                 % of revenue discounted
//                             </p>
//                         </div>
//                         <div className="p-4 bg-blue-50 rounded-lg">
//                             <div className="text-lg font-bold text-blue-700">
//                                 {data.summary.itemsSold > 0 ?
//                                     (data.summary.totalRevenue / data.summary.itemsSold).toFixed(0) : 0}
//                             </div>
//                             <p className="text-sm mt-1">Avg. Price/Item</p>
//                             <p className="text-xs text-muted-foreground mt-1">
//                                 Revenue per item sold
//                             </p>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Sales Performance Breakdown */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="text-lg flex items-center gap-2">
//                         <BarChart3 className="h-5 w-5" />
//                         Performance Breakdown
//                     </CardTitle>
//                     <CardDescription>Revenue vs. costs vs. profit</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid gap-6 md:grid-cols-3">
//                         {/* Income Side */}
//                         <div className="space-y-4">
//                             <h3 className="font-medium text-green-700 flex items-center gap-2">
//                                 <div className="h-3 w-3 rounded-full bg-green-500"></div>
//                                 Money Coming In
//                             </h3>
//                             <div className="p-4 bg-green-50 rounded-lg">
//                                 <div className="text-xl font-bold text-green-700">
//                                     {formatCurrency(data.summary.totalRevenue)}
//                                 </div>
//                                 <p className="text-sm mt-1">Total Revenue</p>
//                                 <div className="mt-2 text-xs text-muted-foreground">
//                                     {data.summary.totalSales} transactions
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Expenses Side */}
//                         <div className="space-y-4">
//                             <h3 className="font-medium text-red-700 flex items-center gap-2">
//                                 <div className="h-3 w-3 rounded-full bg-red-500"></div>
//                                 Money Going Out
//                             </h3>
//                             <div className="p-4 bg-red-50 rounded-lg">
//                                 <div className="text-xl font-bold text-red-700">
//                                     {formatCurrency(data.summary.totalCost)}
//                                 </div>
//                                 <p className="text-sm mt-1">Product Costs</p>
//                                 <div className="mt-2 text-xs text-muted-foreground">
//                                     + {formatCurrency(data.summary.totalDiscount)} discounts
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Net Result */}
//                         <div className="space-y-4">
//                             <h3 className="font-medium text-emerald-700 flex items-center gap-2">
//                                 <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
//                                 Net Result
//                             </h3>
//                             <div className={`p-4 rounded-lg ${data.summary.totalProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
//                                 <div className={`text-xl font-bold ${data.summary.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
//                                     {formatCurrency(data.summary.totalProfit)}
//                                 </div>
//                                 <p className="text-sm mt-1">Net Profit</p>
//                                 <div className={`mt-2 text-xs ${data.summary.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
//                                     {data.summary.profitMargin.toFixed(1)}% margin
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     )
// }