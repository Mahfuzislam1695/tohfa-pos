"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, List, DollarSign, Users, AlertTriangle, BarChart3 } from "lucide-react"
import { useState } from "react"
import { PaymentList } from "./payment-list"
import { PaymentForm } from "./payment-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomerDuesList } from "./customer-dues-list"
import { OverdueSales } from "./overdue-sales"
import { PaymentSummary } from "./payment-summary"


export default function Dues() {
    const [activeTab, setActiveTab] = useState("payments")
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [paymentData, setPaymentData] = useState<{
        customerId?: number
        sellId?: number
        dueAmount?: number
    }>({})

    const handleAddPayment = (customerId?: number, sellId?: number, dueAmount?: number) => {
        setPaymentData({ customerId, sellId, dueAmount })
        setIsPaymentDialogOpen(true)
    }

    const handlePaymentSuccess = () => {
        setIsPaymentDialogOpen(false)
        setPaymentData({})
    }

    const handleClosePayment = () => {
        setIsPaymentDialogOpen(false)
        setPaymentData({})
    }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <DollarSign className="h-8 w-8" />
                            Dues & Payments Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage customer dues, payments, and collections</p>
                    </div>
                    <Button
                        onClick={() => handleAddPayment()}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Payment
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="payments" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            All Payments
                        </TabsTrigger>
                        <TabsTrigger value="customers" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Customer Dues
                        </TabsTrigger>
                        <TabsTrigger value="overdue" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Overdue Sales
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Summary
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="payments" className="mt-6">
                        <PaymentList onAddPayment={handleAddPayment} />
                    </TabsContent>

                    <TabsContent value="customers" className="mt-6">
                        <CustomerDuesList onAddPayment={handleAddPayment} />
                    </TabsContent>

                    <TabsContent value="overdue" className="mt-6">
                        <OverdueSales onAddPayment={handleAddPayment} />
                    </TabsContent>

                    <TabsContent value="summary" className="mt-6">
                        <PaymentSummary />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Payment</DialogTitle>
                    </DialogHeader>
                    <PaymentForm
                        customerId={paymentData.customerId}
                        sellId={paymentData.sellId}
                        dueAmount={paymentData.dueAmount}
                        onSuccess={handlePaymentSuccess}
                        onCancel={handleClosePayment}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}