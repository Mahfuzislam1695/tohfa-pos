"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, FileText, Download, User, CreditCard, Tag } from "lucide-react"
import { Expense, ExpenseCategory, ExpensePaymentMethod } from "@/types/expense"
import { formatDate } from "@/lib/units"

interface ExpenseDetailsProps {
    expense: Expense
}

export function ExpenseDetails({ expense }: ExpenseDetailsProps) {
    const formatCategory = (category: ExpenseCategory) => {
        const colors = {
            [ExpenseCategory.RENT]: "bg-purple-500",
            [ExpenseCategory.UTILITIES]: "bg-blue-500",
            [ExpenseCategory.SALARIES]: "bg-green-500",
            [ExpenseCategory.SUPPLIES]: "bg-yellow-500",
            [ExpenseCategory.MARKETING]: "bg-pink-500",
            [ExpenseCategory.TRANSPORTATION]: "bg-orange-500",
            [ExpenseCategory.MAINTENANCE]: "bg-red-500",
            [ExpenseCategory.INSURANCE]: "bg-indigo-500",
            [ExpenseCategory.TAXES]: "bg-gray-500",
            [ExpenseCategory.OTHER]: "bg-gray-300"
        }

        return (
            <Badge className={`${colors[category]} text-white`}>
                {category.replace('_', ' ')}
            </Badge>
        )
    }

    const formatPaymentMethod = (method: ExpensePaymentMethod) => {
        const icons = {
            [ExpensePaymentMethod.CASH]: "💵",
            [ExpensePaymentMethod.BANK_TRANSFER]: "🏦",
            [ExpensePaymentMethod.CREDIT_CARD]: "💳",
            [ExpensePaymentMethod.DEBIT_CARD]: "💳",
            [ExpensePaymentMethod.MOBILE_PAYMENT]: "📱"
        }

        return `${icons[method]} ${method.replace('_', ' ')}`
    }

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Expense #{expense.expenseSid.slice(0, 8)}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                            {formatCategory(expense.category)}
                        </Badge>
                        <Badge variant="outline">
                            {formatPaymentMethod(expense.paymentMethod)}
                        </Badge>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-destructive">৳{expense.amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Expense Amount</div>
                </div>
            </div>

            <Separator />

            {/* Main Info Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Expense ID</p>
                                    <p className="font-mono text-sm">{expense.expenseSid}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">{formatDate(expense.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <div className="mt-1">{formatCategory(expense.category)}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Method</p>
                                    <p className="font-medium">{expense.paymentMethod.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Financial Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Amount</span>
                                    <span className="text-2xl font-bold text-destructive">৳{expense.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Reference Number</span>
                                    <span className="font-medium">{expense.referenceNumber || "N/A"}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Tax</span>
                                    <span className="font-medium">৳0.00</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="font-medium mt-1 p-3 bg-gray-50 rounded">
                                    {expense.description || "No description provided"}
                                </p>
                            </div>

                            {expense.receiptUrl && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Receipt</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="font-medium truncate">{expense.fileName || "Receipt"}</span>
                                        <a
                                            href={expense.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-auto text-blue-600 hover:text-blue-800"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Created By Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Created By
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{expense.createdBy.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium text-sm">{expense.createdBy.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium text-sm">{formatDate(expense.createdAt, true)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                    <p className="font-medium text-sm">{formatDate(expense.updatedAt, true)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Timeline Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Expense Date</span>
                            </div>
                            <span className="font-medium">{formatDate(expense.date)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Record Created</span>
                            </div>
                            <span className="font-medium">{formatDate(expense.createdAt, true)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>Last Updated</span>
                            </div>
                            <span className="font-medium">{formatDate(expense.updatedAt, true)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}