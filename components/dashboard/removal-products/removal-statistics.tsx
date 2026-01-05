"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRemovalStatistics } from "@/hooks/use-removal-statistics";
import { DollarSign, Package, TrendingDown, AlertTriangle, BarChart, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RemovalReason } from "@/types/removal";
import { Progress } from "@/components/ui/progress";

export function RemovalStatistics() {
    const { statistics, isLoading, error } = useRemovalStatistics();

    if (isLoading) return <div>Loading statistics...</div>;
    if (error) return <div>Error loading statistics</div>;
    if (!statistics) return <div>No statistics available</div>;

    // Format currency
    const formatCurrency = (amount: number) => {
        return `৳${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    // Get top reasons
    const topReasons = Object.entries(statistics.reasonBreakdown)
        .filter(([_, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Get top products by loss
    const topProducts = statistics.productBreakdown
        .sort((a, b) => b.loss - a.loss)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Removals</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totalRemovals}</div>
                        <p className="text-xs text-muted-foreground">Records in system</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {statistics.totalQuantity}
                        </div>
                        <p className="text-xs text-muted-foreground">Units removed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
                        <DollarSign className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {formatCurrency(statistics.totalLoss)}
                        </div>
                        <p className="text-xs text-muted-foreground">Estimated total loss</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Loss/Removal</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {formatCurrency(
                                statistics.totalRemovals > 0
                                    ? statistics.totalLoss / statistics.totalRemovals
                                    : 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Per removal record</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend and Top Reasons */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            Monthly Trend (Last 6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statistics.monthlyRemovals.map((month) => (
                                <div key={month.month} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{month.month}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {month.count} removals • {formatCurrency(month.loss)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={(month.quantity / statistics.totalQuantity) * 100}
                                        className="h-2"
                                    />
                                    <div className="text-xs text-muted-foreground flex justify-between">
                                        <span>{month.quantity} units</span>
                                        <span>{formatCurrency(month.loss)} loss</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Reasons */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Top Removal Reasons
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topReasons.map(([reason, count]) => (
                                <div key={reason} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {reason.replace("_", " ")}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{count}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {((count / statistics.totalRemovals) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products by Loss */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Products by Loss</CardTitle>
                    <CardDescription>Products with highest removal losses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topProducts.map((product) => (
                            <div key={product.productID} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{product.productName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {product.count} removals • {product.quantity} units
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-destructive">{formatCurrency(product.loss)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Avg: {formatCurrency(product.loss / product.count)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Removals */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Removals</CardTitle>
                    <CardDescription>Latest removal activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {statistics.recentRemovals.map((removal) => (
                            <div key={removal.removalID} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{removal.productName}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">
                                            {removal.reason.replace("_", " ")}
                                        </Badge>
                                        <span>{removal.quantity} units</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">
                                        {new Date(removal.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(removal.date).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}