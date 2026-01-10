"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, DollarSign, Phone, User, AlertTriangle, Loader2 } from "lucide-react"
import { useAllCustomerDues } from "@/hooks/useDues"

interface CustomerDuesListProps {
    onAddPayment?: (customerId: number) => void
}

export function CustomerDuesList({ onAddPayment }: CustomerDuesListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const { customerDues, isLoading, refetch } = useAllCustomerDues()

    // Filter customers based on search
    const filteredCustomers = customerDues.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    )

    // Get status badge
    const getDueStatus = (amount: number) => {
        if (amount === 0) return <Badge variant="default">Clear</Badge>
        if (amount <= 1000) return <Badge variant="secondary">Low</Badge>
        if (amount <= 5000) return <Badge variant="outline">Medium</Badge>
        return <Badge variant="destructive">High</Badge>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Customer Dues</CardTitle>
                            <CardDescription>
                                View all customer dues and outstanding amounts
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-right">Credit Due</TableHead>
                                    <TableHead className="text-right">Sale Dues</TableHead>
                                    <TableHead className="text-right">Total Due</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                                            {searchTerm
                                                ? `No customers found matching "${searchTerm}"`
                                                : `No customer dues found`
                                            }
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.customerID}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{customer.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ID: {customer.customerID}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{customer.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={`font-medium ${customer.creditDue > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                                        ৳{customer.creditDue.toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-medium text-blue-600">
                                                        ৳{customer.saleDues.toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xl font-bold text-emerald-600">
                                                        ৳{customer.totalDue.toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getDueStatus(customer.totalDue)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onAddPayment?.(customer.customerID)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                        Pay
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}