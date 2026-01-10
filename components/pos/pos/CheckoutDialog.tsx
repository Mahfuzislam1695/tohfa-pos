import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"

interface CheckoutDialogProps {
    showCheckout: boolean
    setShowCheckout: (show: boolean) => void
    customerName: string
    setCustomerName: (name: string) => void
    customerPhone: string
    setCustomerPhone: (phone: string) => void
    discount: number
    setDiscount: (discount: number) => void
    discountAmount: number
    discountType: string
    setDiscountType: (type: string) => void
    tax: number
    setTax: (tax: number) => void
    paymentMethod: string
    setPaymentMethod: (method: string) => void
    paymentStatus: string
    setPaymentStatus: (status: string) => void
    receivedAmount: string
    setReceivedAmount: (amount: string) => void
    notes: string
    setNotes: (notes: string) => void
    subtotal: number
    taxAmount: number
    total: number
    receivedAmountNum: number
    changeAmount: number
    dueAmount: number
    handleCheckout: () => void
    isCreatingSale: boolean
}

export function CheckoutDialog({
    showCheckout,
    setShowCheckout,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    discount,
    setDiscount,
    discountAmount,
    discountType,
    setDiscountType,
    tax,
    setTax,
    paymentMethod,
    setPaymentMethod,
    paymentStatus,
    setPaymentStatus,
    receivedAmount,
    setReceivedAmount,
    notes,
    setNotes,
    subtotal,

    taxAmount,
    total,
    receivedAmountNum,
    changeAmount,
    dueAmount,
    handleCheckout,
    isCreatingSale,
}: CheckoutDialogProps) {
    const [isPartialPayment, setIsPartialPayment] = useState(false)
    const [showSpecialOffer, setShowSpecialOffer] = useState(false)

    // Initialize payment status to COMPLETED by default
    useEffect(() => {
        setPaymentStatus('COMPLETED')
    }, [setPaymentStatus])

    // Handle partial payment toggle
    useEffect(() => {
        if (isPartialPayment) {
            setPaymentStatus('PARTIAL')
            // Clear received amount for partial payments to recalculate
            if (receivedAmountNum >= total) {
                setReceivedAmount('')
            }
        } else {
            setPaymentStatus('COMPLETED')
        }
    }, [isPartialPayment, total, receivedAmountNum, setPaymentStatus, setReceivedAmount])

    // Calculate due amount for partial payments
    useEffect(() => {
        if (paymentStatus === 'PARTIAL' && receivedAmount) {
            const received = parseFloat(receivedAmount) || 0
            const due = Math.max(0, total - received)
            // You might want to update dueAmount in parent component
        }
    }, [paymentStatus, receivedAmount, total])

    // Handle discount type change
    const handleDiscountTypeChange = (type: string) => {
        setDiscountType(type)
        if (type === 'SPECIAL_OFFER') {
            setShowSpecialOffer(true)
            // Reset discount to 0 when switching to special offer
            setDiscount(0)
        } else {
            setShowSpecialOffer(false)
        }
    }

    return (
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
            <DialogContent className="max-h-[90vh] max-w-[50vw] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Complete Sale</DialogTitle>
                    <DialogDescription>Enter customer details and payment information</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Payment Status */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-end gap-4">
                            <Label htmlFor="partial-payment" className="font-medium">
                                Partial Payment
                            </Label>
                            <Switch
                                id="partial-payment"
                                checked={isPartialPayment}
                                onCheckedChange={setIsPartialPayment}
                            />
                        </div>
                        {isPartialPayment && (
                            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                                <p className="font-medium">⚠️ Customer Balance Required</p>
                                <p className="mt-1">Customer name and phone are required for partial payments.</p>
                                <p className="mt-1">Remaining balance will be tracked in customer account.</p>
                            </div>
                        )}
                    </div>
                    {/* Customer Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Customer Name {isPartialPayment && '*'}</Label>
                            <Input
                                id="customerName"
                                placeholder="Walk-in Customer"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required={isPartialPayment}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerPhone">Customer Phone {isPartialPayment && '*'}</Label>
                            <Input
                                id="customerPhone"
                                placeholder="01XXXXXXXXX"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                required={isPartialPayment}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">


                        {/* Discount Section */}
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select value={discountType} onValueChange={handleDiscountTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select discount type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* <SelectItem value="FIXED_AMOUNT">Fixed Amount (৳)</SelectItem> */}
                                    {/* <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem> */}
                                    <SelectItem value="SPECIAL_OFFER">Special Offer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {showSpecialOffer ? (
                            <div className="space-y-2">
                                <Label htmlFor="specialOffer">Special Offer Price (৳)</Label>
                                <Input
                                    id="specialOffer"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter special price"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Original Total: ৳{total.toFixed(2)} | Special Price: ৳{(total - discount).toFixed(2)}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="discount">
                                        {discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (৳)'}
                                    </Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        min="0"
                                        max={discountType === 'PERCENTAGE' ? '100' : undefined}
                                        step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        )}</div>

                    {/* Tax (Optional) */}
                    {/* <div className="space-y-2">
                        <Label htmlFor="tax">Tax (%)</Label>
                        <Input
                            id="tax"
                            type="number"
                            min="0"
                            max="100"
                            value={tax}
                            onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
                        />
                    </div> */}



                    <div className="grid grid-cols-2 gap-4">


                        {/* Payment Method */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method *</Label>
                            <Select value={paymentMethod} defaultValue="CASH" onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="DIGITAL_WALLET">Digital Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Received Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="receivedAmount">
                                {isPartialPayment ? 'Received Amount (৳) *' : 'Received Amount (৳) *'}
                            </Label>
                            <Input
                                id="receivedAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={receivedAmount}
                                onChange={(e) => setReceivedAmount(e.target.value)}
                                placeholder="0.00"
                            />
                            {receivedAmountNum > 0 && (
                                <div className="space-y-1">
                                    {isPartialPayment ? (
                                        <>
                                            <p className="text-sm text-muted-foreground">
                                                Due Amount: ৳{Math.max(0, total - receivedAmountNum).toFixed(2)}
                                            </p>
                                            <p className="text-sm text-amber-600">
                                                Balance will be added to customer account
                                            </p>
                                        </>
                                    ) : (
                                        receivedAmountNum >= total && (
                                            <p className="text-sm text-muted-foreground">
                                                Change: ৳{changeAmount.toFixed(2)}
                                            </p>
                                        )
                                    )}
                                </div>
                            )}
                        </div></div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            placeholder="Any additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Order Summary */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>৳{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {discountType === 'SPECIAL_OFFER' ? 'Special Offer' :
                                        discountType === 'PERCENTAGE' ? `Discount (${discount}%)` : 'Discount'}
                                </span>
                                <span className="text-destructive">-৳{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tax ({tax}%)</span>
                                <span>৳{taxAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-border">
                            <span>Total</span>
                            <span className="text-primary">৳{total.toFixed(2)}</span>
                        </div>
                        {isPartialPayment && receivedAmountNum > 0 && (
                            <>
                                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                                    <span className="text-muted-foreground">Received</span>
                                    <span className="text-green-600">৳{receivedAmountNum.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Due Amount</span>
                                    <span className="text-amber-600">৳{Math.max(0, total - receivedAmountNum).toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCheckout(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCheckout} disabled={isCreatingSale}>
                        {isCreatingSale ? "Processing..." : "Complete Sale"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// interface CheckoutDialogProps {
//     showCheckout: boolean
//     setShowCheckout: (show: boolean) => void
//     customerName: string
//     setCustomerName: (name: string) => void
//     customerPhone: string
//     setCustomerPhone: (phone: string) => void
//     discount: number
//     setDiscount: (discount: number) => void
//     tax: number
//     setTax: (tax: number) => void
//     paymentMethod: string
//     setPaymentMethod: (method: string) => void
//     receivedAmount: string
//     setReceivedAmount: (amount: string) => void
//     notes: string
//     setNotes: (notes: string) => void
//     subtotal: number
//     discountAmount: number
//     taxAmount: number
//     total: number
//     receivedAmountNum: number
//     changeAmount: number
//     handleCheckout: () => void
//     isCreatingSale: boolean
// }

// export function CheckoutDialog({
//     showCheckout,
//     setShowCheckout,
//     customerName,
//     setCustomerName,
//     customerPhone,
//     setCustomerPhone,
//     discount,
//     setDiscount,
//     tax,
//     setTax,
//     paymentMethod,
//     setPaymentMethod,
//     receivedAmount,
//     setReceivedAmount,
//     notes,
//     setNotes,
//     subtotal,
//     discountAmount,
//     taxAmount,
//     total,
//     receivedAmountNum,
//     changeAmount,
//     handleCheckout,
//     isCreatingSale,
// }: CheckoutDialogProps) {
//     return (
//         <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
//             <DialogContent className="max-w-lg">
//                 <DialogHeader>
//                     <DialogTitle>Complete Sale</DialogTitle>
//                     <DialogDescription>Enter customer details and payment information</DialogDescription>
//                 </DialogHeader>
//                 <div className="space-y-4 py-4">
//                     <div className="space-y-2">
//                         <Label htmlFor="customerName">Customer Name (Optional)</Label>
//                         <Input
//                             id="customerName"
//                             placeholder="Walk-in Customer"
//                             value={customerName}
//                             onChange={(e) => setCustomerName(e.target.value)}
//                         />
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
//                         <Input
//                             id="customerPhone"
//                             placeholder="01XXXXXXXXX"
//                             value={customerPhone}
//                             onChange={(e) => setCustomerPhone(e.target.value)}
//                         />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="discount">Discount (%)</Label>
//                             <Input
//                                 id="discount"
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 value={discount}
//                                 onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
//                             />
//                         </div>
//                         {/* <div className="space-y-2">
//                             <Label htmlFor="tax">Tax (%)</Label>
//                             <Input
//                                 id="tax"
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 value={tax}
//                                 onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
//                             />
//                         </div> */}
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="paymentMethod">Payment Method *</Label>
//                         <Select value={paymentMethod} defaultValue="CASH" onValueChange={setPaymentMethod}>
//                             <SelectTrigger>
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="CASH">Cash</SelectItem>
//                                 <SelectItem value="CARD">Card</SelectItem>
//                                 <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                     {paymentMethod === "CASH" && (
//                         <div className="space-y-2">
//                             <Label htmlFor="receivedAmount">Received Amount (৳) *</Label>
//                             <Input
//                                 id="receivedAmount"
//                                 type="number"
//                                 step="0.01"
//                                 min="0"
//                                 value={receivedAmount}
//                                 onChange={(e) => setReceivedAmount(e.target.value)}
//                                 placeholder="0.00"
//                             />
//                             {receivedAmountNum >= total && (
//                                 <p className="text-sm text-muted-foreground">Change: ৳{changeAmount.toFixed(2)}</p>
//                             )}
//                         </div>
//                     )}
//                     <div className="space-y-2">
//                         <Label htmlFor="notes">Notes (Optional)</Label>
//                         <Input
//                             id="notes"
//                             placeholder="Any additional notes..."
//                             value={notes}
//                             onChange={(e) => setNotes(e.target.value)}
//                         />
//                     </div>
//                     <div className="bg-muted p-4 rounded-lg space-y-2">
//                         <div className="flex items-center justify-between text-sm">
//                             <span className="text-muted-foreground">Subtotal</span>
//                             <span>৳{subtotal.toFixed(2)}</span>
//                         </div>
//                         {discount > 0 && (
//                             <div className="flex items-center justify-between text-sm">
//                                 <span className="text-muted-foreground">Discount</span>
//                                 <span className="text-destructive">-৳{discountAmount.toFixed(2)}</span>
//                             </div>
//                         )}
//                         {tax > 0 && (
//                             <div className="flex items-center justify-between text-sm">
//                                 <span className="text-muted-foreground">Tax</span>
//                                 <span>৳{taxAmount.toFixed(2)}</span>
//                             </div>
//                         )}
//                         <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-border">
//                             <span>Total</span>
//                             <span className="text-primary">৳{total.toFixed(2)}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <DialogFooter>
//                     <Button variant="outline" onClick={() => setShowCheckout(false)}>
//                         Cancel
//                     </Button>
//                     <Button onClick={handleCheckout} disabled={isCreatingSale}>
//                         {isCreatingSale ? "Processing..." : "Complete Sale"}
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     )
// }