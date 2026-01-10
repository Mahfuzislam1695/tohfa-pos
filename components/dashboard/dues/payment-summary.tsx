"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Smartphone, Building, Wallet, TrendingUp, Calendar } from "lucide-react"
import { usePaymentSummary } from "@/hooks/useDues"
// import { DatePickerWithRange } from "@/components/ui/date-range-picker"
// import { DateRange } from "react-day-picker"

export function PaymentSummary() {
    // const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const { summary, isLoading } = usePaymentSummary({
        // startDate: dateRange?.from?.toISOString().split('T')[0],
        // endDate: dateRange?.to?.toISOString().split('T')[0]
    })

    return (
        <div className="space-y-6">
            {/* Date Range Filter */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Payment Summary
                        </span>
                        {/* <DatePickerWithRange
                            date={dateRange}
                            setDate={setDateRange}
                        /> */}
                    </CardTitle>
                    <CardDescription>
                        View payment statistics for the selected date range
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Summary Cards */}
            {summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                ৳{summary.totalAmount.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                From {summary.totalPayments} payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalCompleted}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.totalPending} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-3 w-3" />
                                        <span className="text-sm">Cash</span>
                                    </div>
                                    <span className="font-medium">
                                        ৳{summary.cashPayments.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-3 w-3" />
                                        <span className="text-sm">Card</span>
                                    </div>
                                    <span className="font-medium">
                                        ৳{summary.cardPayments.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-3 w-3" />
                                        <span className="text-sm">Mobile</span>
                                    </div>
                                    <span className="font-medium">
                                        ৳{summary.mobilePayments.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-3 w-3" />
                                        <span className="text-sm">Bank</span>
                                    </div>
                                    <span className="font-medium">
                                        ৳{summary.bankTransfers.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary.totalPayments > 0
                                    ? ((summary.totalCompleted / summary.totalPayments) * 100).toFixed(1)
                                    : 0}%
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{
                                        width: `${summary.totalPayments > 0
                                            ? (summary.totalCompleted / summary.totalPayments) * 100
                                            : 0}%`
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {summary.totalCompleted} of {summary.totalPayments} payments completed
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Detailed Breakdown */}
            {summary && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <h4 className="font-medium">Amount Collected by Method</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="h-4 w-4 text-green-600" />
                                            <span>Cash</span>
                                        </div>
                                        <span className="font-bold">
                                            ৳{summary.cashPayments.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-blue-600" />
                                            <span>Card</span>
                                        </div>
                                        <span className="font-bold">
                                            ৳{summary.cardPayments.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-purple-600" />
                                            <span>Mobile Banking</span>
                                        </div>
                                        <span className="font-bold">
                                            ৳{summary.mobilePayments.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-amber-600" />
                                            <span>Bank Transfer</span>
                                        </div>
                                        <span className="font-bold">
                                            ৳{summary.bankTransfers.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium">Payment Status Distribution</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                            <span>Completed</span>
                                        </div>
                                        <span className="font-bold">{summary.totalCompleted}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                                            <span>Pending</span>
                                        </div>
                                        <span className="font-bold">{summary.totalPending}</span>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Total Payments</span>
                                            <span className="text-xl font-bold">{summary.totalPayments}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}