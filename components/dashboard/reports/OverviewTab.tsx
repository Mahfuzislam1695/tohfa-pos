import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { DollarSign, Package, TrendingUp } from "lucide-react"

export function OverviewTab() {
    return (
        <TabsContent value="overview" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Overview</CardTitle>
                    <CardDescription>
                        Select a specific report tab to view detailed analytics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Sales Report
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Detailed</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    View sales analytics
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Inventory Report
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Detailed</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    View inventory status
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Profit & Loss
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Detailed</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    View financial performance
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    )
}