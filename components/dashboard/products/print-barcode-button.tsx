import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useState } from "react"
import { BarcodePrint } from "./barcode-print"

interface PrintBarcodeButtonProps {
    productName: string
    productSku: string
    barcode: string
    variant?: "default" | "outline" | "secondary" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
}

export function PrintBarcodeButton({
    productName,
    productSku,
    barcode,
    variant = "outline",
    size = "default"
}: PrintBarcodeButtonProps) {
    const [showDialog, setShowDialog] = useState(false)

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={() => setShowDialog(true)}
                disabled={!barcode}
            >
                <Printer className="mr-2 h-4 w-4" />
                Print Barcode
            </Button>

            <BarcodePrint
                open={showDialog}
                onOpenChange={setShowDialog}
                productName={productName}
                productSku={productSku}
                barcode={barcode}
            />
        </>
    )
}