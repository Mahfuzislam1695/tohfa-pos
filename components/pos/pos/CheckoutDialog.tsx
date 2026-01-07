import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CheckoutDialogProps {
    showCheckout: boolean
    setShowCheckout: (show: boolean) => void
    customerName: string
    setCustomerName: (name: string) => void
    customerPhone: string
    setCustomerPhone: (phone: string) => void
    discount: number
    setDiscount: (discount: number) => void
    tax: number
    setTax: (tax: number) => void
    paymentMethod: string
    setPaymentMethod: (method: string) => void
    receivedAmount: string
    setReceivedAmount: (amount: string) => void
    notes: string
    setNotes: (notes: string) => void
    subtotal: number
    discountAmount: number
    taxAmount: number
    total: number
    receivedAmountNum: number
    changeAmount: number
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
    tax,
    setTax,
    paymentMethod,
    setPaymentMethod,
    receivedAmount,
    setReceivedAmount,
    notes,
    setNotes,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    receivedAmountNum,
    changeAmount,
    handleCheckout,
    isCreatingSale,
}: CheckoutDialogProps) {
    return (
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Complete Sale</DialogTitle>
                    <DialogDescription>Enter customer details and payment information</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="customerName">Customer Name (Optional)</Label>
                        <Input
                            id="customerName"
                            placeholder="Walk-in Customer"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                        <Input
                            id="customerPhone"
                            placeholder="01XXXXXXXXX"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discount">Discount (%)</Label>
                            <Input
                                id="discount"
                                type="number"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                            />
                        </div>
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
                    </div>
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
                            </SelectContent>
                        </Select>
                    </div>
                    {paymentMethod === "CASH" && (
                        <div className="space-y-2">
                            <Label htmlFor="receivedAmount">Received Amount (৳) *</Label>
                            <Input
                                id="receivedAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={receivedAmount}
                                onChange={(e) => setReceivedAmount(e.target.value)}
                                placeholder="0.00"
                            />
                            {receivedAmountNum >= total && (
                                <p className="text-sm text-muted-foreground">Change: ৳{changeAmount.toFixed(2)}</p>
                            )}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            placeholder="Any additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>৳{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="text-destructive">-৳{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>৳{taxAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-border">
                            <span>Total</span>
                            <span className="text-primary">৳{total.toFixed(2)}</span>
                        </div>
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