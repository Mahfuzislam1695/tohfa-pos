import { ShoppingCart, Trash2, Plus, Minus, X, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CartItem } from "./types"

interface CartSectionProps {
    cart: CartItem[]
    clearCart: () => void
    updateQuantity: (productId: number, saleUnit: string, change: number) => void
    removeFromCart: (productId: number, saleUnit: string) => void
    subtotal: number
    discount: number
    tax: number
    discountAmount: number
    taxAmount: number
    total: number
    setShowCheckout: (show: boolean) => void
    isCreatingSale: boolean
}

export function CartSection({
    cart,
    clearCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    tax,
    discountAmount,
    taxAmount,
    total,
    setShowCheckout,
    isCreatingSale,
}: CartSectionProps) {
    return (
        <div className="w-[400px] border-l border-border bg-card flex flex-col">
            {/* Cart Header */}
            <div className="border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Cart ({cart.length})
                    </h2>
                    {cart.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearCart}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
                {cart.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                        <div>
                            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Cart is empty</p>
                            <p className="text-sm">Add products to get started</p>
                        </div>
                    </div>
                ) : (
                    cart.map((item, index) => (
                        <Card key={`${item.productId}-${item.saleUnit}-${index}`} className="p-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm">{item.productName}</h4>
                                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                                    <p className="text-sm font-medium text-primary mt-1">৳{item.unitPrice} / unit</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => removeFromCart(item.productId, item.saleUnit)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 bg-transparent"
                                        onClick={() => updateQuantity(item.productId, item.saleUnit, -1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-16 text-center font-medium text-sm">
                                        {item.saleQuantity} {item.saleUnit}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 bg-transparent"
                                        onClick={() => updateQuantity(item.productId, item.saleUnit, 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <span className="font-bold">৳{item.subtotal.toFixed(2)}</span>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
                <div className="border-t border-border px-6 py-4 space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Discount ({discount}%)</span>
                                <span className="font-medium text-destructive">-৳{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tax ({tax}%)</span>
                                <span className="font-medium">৳{taxAmount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold text-primary">৳{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={() => setShowCheckout(true)}
                        disabled={isCreatingSale}
                    >
                        <Receipt className="h-5 w-5 mr-2" />
                        {isCreatingSale ? "Processing..." : "Proceed to Checkout"}
                    </Button>
                </div>
            )}
        </div>
    )
}