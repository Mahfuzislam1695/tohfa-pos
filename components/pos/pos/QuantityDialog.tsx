import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getUnitByShortName, unitAllowsDecimal } from "@/lib/units"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Product } from "./types"

interface QuantityDialogProps {
    showQuantityDialog: boolean
    setShowQuantityDialog: (show: boolean) => void
    selectedProduct: Product | null
    customQuantity: string
    setCustomQuantity: (quantity: string) => void
    setSearchQuery: (searchQuery: string) => void
    customUnit: string
    confirmAddToCart: () => void
}

export function QuantityDialog({
    showQuantityDialog,
    setShowQuantityDialog,
    selectedProduct,
    customQuantity,
    setCustomQuantity,
    customUnit,
    confirmAddToCart,
    setSearchQuery
}: QuantityDialogProps) {
    const [unitAllowsDec, setUnitAllowsDec] = useState(false)
    const [unitName, setUnitName] = useState("")

    useEffect(() => {
        if (selectedProduct) {
            // Check if the product's unit allows decimal
            const allowsDecimal = unitAllowsDecimal(customUnit)
            setUnitAllowsDec(allowsDecimal)

            // Get unit display name
            const unitDef = getUnitByShortName(customUnit)
            setUnitName(unitDef?.name || customUnit)

            // If quantity has decimal but unit doesn't allow it, reset to integer
            if (!allowsDecimal && customQuantity.includes('.')) {
                const intValue = Math.floor(parseFloat(customQuantity))
                setCustomQuantity(intValue.toString())
            }
        }
    }, [selectedProduct, customUnit])

    const handleQuantityChange = (value: string) => {
        // If unit doesn't allow decimal, validate input
        if (!unitAllowsDec) {
            // Only allow integers - remove any non-digit characters except minus sign
            const cleanValue = value.replace(/[^\d]/g, '')
            setCustomQuantity(cleanValue)
        } else {
            // Allow decimals but validate format
            const regex = /^\d*\.?\d*$/
            if (regex.test(value) || value === '') {
                setCustomQuantity(value)
            }
        }
    }

    const validateAndAddToCart = () => {
        if (!selectedProduct) return

        const qty = parseFloat(customQuantity)
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity")
            return
        }

        // Additional validation for non-decimal units
        if (!unitAllowsDec && !Number.isInteger(qty)) {
            toast.error("Quantity must be a whole number for this unit")
            return
        }

        setSearchQuery("")

        confirmAddToCart()
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent entering decimal point for non-decimal units
        if (!unitAllowsDec && e.key === '.') {
            e.preventDefault()
        }

        // Allow Enter to submit
        if (e.key === 'Enter') {
            validateAndAddToCart()
        }
    }

    return (
        <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add to Cart</DialogTitle>
                    <DialogDescription>
                        {selectedProduct?.name} - Enter quantity in {unitName}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            Quantity ({unitName}) *
                            {!unitAllowsDec && (
                                <span className="text-xs text-muted-foreground ml-2">(Whole numbers only)</span>
                            )}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            step={unitAllowsDec ? "0.01" : "1"}
                            min="0.01"
                            value={customQuantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={unitAllowsDec ? "0.00" : "1"}
                            autoFocus
                        />
                        <div className="text-sm text-muted-foreground">
                            {unitAllowsDec ?
                                "Enter quantity with decimals if needed" :
                                "Only whole numbers are allowed for this unit"
                            }
                        </div>
                    </div>

                    {selectedProduct && customQuantity && (
                        <div className="text-sm bg-muted p-3 rounded-lg">
                            <div className="font-medium mb-1">Stock Information:</div>
                            <div>Available: {selectedProduct.stockQuantity} {unitName}</div>
                            <div>Entered: {customQuantity} {unitName}</div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowQuantityDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={validateAndAddToCart}>
                        Add to Cart
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}