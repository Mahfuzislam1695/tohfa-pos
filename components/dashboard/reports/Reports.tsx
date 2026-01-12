"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportPeriod, ReportFilters } from "@/types/dashboard"
import { OverviewTab } from "./OverviewTab"
import { SalesReportTab } from "./SalesReportTab"
import { InventoryReportTab } from "./InventoryReportTab"
import { ProfitLossReportTab } from "./ProfitLossReportTab"
import { Loader2 } from "lucide-react"

export default function Reports() {
    const [activeTab, setActiveTab] = useState("overview")
    const [dateFilter, setDateFilter] = useState<ReportPeriod>(ReportPeriod.THIS_MONTH)
    const [filters, setFilters] = useState<ReportFilters>({
        period: ReportPeriod.THIS_MONTH,
    })
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    // Handle tab change
    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }

    // Format period label
    const getPeriodLabel = (period: ReportPeriod) => {
        const labels = {
            [ReportPeriod.TODAY]: 'Today',
            [ReportPeriod.YESTERDAY]: 'Yesterday',
            [ReportPeriod.LAST_7_DAYS]: 'Last 7 Days',
            [ReportPeriod.LAST_30_DAYS]: 'Last 30 Days',
            [ReportPeriod.THIS_MONTH]: 'This Month',
            [ReportPeriod.LAST_MONTH]: 'Last Month',
            [ReportPeriod.THIS_QUARTER]: 'This Quarter',
            [ReportPeriod.THIS_YEAR]: 'This Year',
            [ReportPeriod.CUSTOM]: 'Custom Range',
        }
        return labels[period]
    }

    // Handle date filter change
    const handleDateFilterChange = (value: ReportPeriod) => {
        setDateFilter(value)
        setFilters({
            ...filters,
            period: value,
        })
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive business insights and statistics
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label>Period:</Label>
                        <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(ReportPeriod).map((period) => (
                                    <SelectItem key={period} value={period}>
                                        {getPeriodLabel(period)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales Report</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
                    <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
                </TabsList>

                {/* Render only the active tab content */}
                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "sales" && <SalesReportTab filters={filters} getPeriodLabel={getPeriodLabel} />}
                {activeTab === "inventory" && <InventoryReportTab />}
                {activeTab === "profit-loss" && <ProfitLossReportTab filters={filters} />}
            </Tabs>
        </div>
    )
}
// "use client"

// import { useState, useEffect } from "react"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ReportPeriod, ReportFilters } from "@/types/dashboard"
// import { OverviewTab } from "./OverviewTab"
// import { SalesReportTab } from "./SalesReportTab"
// import { InventoryReportTab } from "./InventoryReportTab"
// import { ProfitLossReportTab } from "./ProfitLossReportTab"


// export default function Reports() {
//     const [activeTab, setActiveTab] = useState("overview")
//     const [dateFilter, setDateFilter] = useState<ReportPeriod>(ReportPeriod.THIS_MONTH)
//     const [filters, setFilters] = useState<ReportFilters>({
//         period: ReportPeriod.THIS_MONTH,
//     })

//     // Handle date filter change
//     useEffect(() => {
//         setFilters({
//             ...filters,
//             period: dateFilter,
//         })
//     }, [dateFilter])

//     // Format period label
//     const getPeriodLabel = (period: ReportPeriod) => {
//         const labels = {
//             [ReportPeriod.TODAY]: 'Today',
//             [ReportPeriod.YESTERDAY]: 'Yesterday',
//             [ReportPeriod.LAST_7_DAYS]: 'Last 7 Days',
//             [ReportPeriod.LAST_30_DAYS]: 'Last 30 Days',
//             [ReportPeriod.THIS_MONTH]: 'This Month',
//             [ReportPeriod.LAST_MONTH]: 'Last Month',
//             [ReportPeriod.THIS_QUARTER]: 'This Quarter',
//             [ReportPeriod.THIS_YEAR]: 'This Year',
//             [ReportPeriod.CUSTOM]: 'Custom Range',
//         }
//         return labels[period]
//     }

//     return (
//         <div className="p-6 space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold">Reports & Analytics</h1>
//                     <p className="text-muted-foreground mt-1">
//                         Comprehensive business insights and statistics
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     <div className="flex items-center gap-2">
//                         <Label>Period:</Label>
//                         <Select value={dateFilter} onValueChange={(value: ReportPeriod) => setDateFilter(value)}>
//                             <SelectTrigger className="w-48">
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {Object.values(ReportPeriod).map((period) => (
//                                     <SelectItem key={period} value={period}>
//                                         {getPeriodLabel(period)}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 </div>
//             </div>

//             <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//                 <TabsList>
//                     <TabsTrigger value="overview">Overview</TabsTrigger>
//                     <TabsTrigger value="sales">Sales Report</TabsTrigger>
//                     <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
//                     <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
//                 </TabsList>

//                 <OverviewTab />
//                 <SalesReportTab filters={filters} getPeriodLabel={getPeriodLabel} />
//                 <InventoryReportTab />
//                 <ProfitLossReportTab filters={filters} />
//             </Tabs>
//         </div>
//     )
// }
