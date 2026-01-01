import { useState } from "react"

export interface BarcodePrintData {
    productName: string
    productSku: string
    barcode: string
}

export function useBarcodePrint() {
    const [printDialogOpen, setPrintDialogOpen] = useState(false)
    const [printData, setPrintData] = useState<BarcodePrintData>({
        productName: "",
        productSku: "",
        barcode: ""
    })

    const openPrintDialog = (data: BarcodePrintData) => {
        setPrintData(data)
        setPrintDialogOpen(true)
    }

    const closePrintDialog = () => {
        setPrintDialogOpen(false)
        // Reset data after closing
        setTimeout(() => {
            setPrintData({ productName: "", productSku: "", barcode: "" })
        }, 300)
    }

    return {
        printDialogOpen,
        setPrintDialogOpen,
        printData,
        openPrintDialog,
        closePrintDialog
    }
}