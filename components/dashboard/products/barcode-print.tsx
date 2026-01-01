"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Printer, X } from "lucide-react"

interface BarcodePrintProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  productSku: string
  barcode: string
  productPrice: string
  onPrintComplete?: () => void
}

export function BarcodePrint({
  open,
  onOpenChange,
  productName,
  productSku,
  productPrice,
  barcode,
  onPrintComplete
}: BarcodePrintProps) {
  const [printQuantity, setPrintQuantity] = useState(1)

  const handlePrint = () => {
    if (!barcode) {
      console.error("No barcode provided for printing")
      return
    }

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Print Barcodes - ${productSku}</title>
  <style>
    @page {
      size: auto;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 100%;
      margin: 0 auto;
      padding: 0;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: min-content;
      box-sizing: border-box;
      overflow: hidden;
    }

    .barcode-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .barcode-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      page-break-inside: avoid;
      break-inside: avoid;
      padding: 0;
    }

    .product-price {
      font-size: 12px;
      font-weight: bold;
      margin-top: 1px;
      margin-bottom: 1px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 95%;
      line-height: 1.1;
    }

    .barcode-svg {
      width: 98%;
      height: 35px;
      display: block;
    }

    .sku-text {
      font-size: 10px;  
      margin-top: 1px;
      letter-spacing: 0.5px;
      line-height: 1;
      font-weight: 700;
      text-align: center;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        width: 100%;
        height: auto;
      }

      .barcode-item {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      * {
        color: black !important;
        background: transparent !important;
      }
    }
  </style>
</head>

<body>
  <div class="barcode-container">
    ${Array.from({ length: printQuantity }).map((_, i) => `
      <div class="barcode-item">
        <div class="sku-text"> ${productSku}</div>
        <svg class="barcode-svg" id="barcode-${i}"></svg>
        <div class="product-price">TK-${productPrice}</div>

      </div>
    `).join("")}
  </div>

  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      ${Array.from({ length: printQuantity }).map((_, i) => `
        try {
          JsBarcode("#barcode-${i}", "${barcode}", {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false,
            margin: 0,
            background: "transparent",
            lineColor: "#000000"
          });
        } catch (error) {
          console.error("Barcode generation error:", error);
        }
      `).join("")}

      setTimeout(function() {
        window.print();
      }, 300);
    });

    window.onafterprint = function() {
      setTimeout(function() {
        if (!document.hidden) {
          window.close();
        }
      }, 1000);
    };

    window.addEventListener('afterprint', function() {
      setTimeout(function() {
        window.close();
      }, 1000);
    });
  </script>
</body>
</html>
`

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to print barcodes.")
      return
    }

    printWindow.document.write(printContent)
    printWindow.document.close()

    // Call onPrintComplete after printing
    setTimeout(() => {
      onPrintComplete?.()
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Print Barcode Labels</DialogTitle>
          <DialogDescription>
            Print barcode labels for the product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-2">Product Information</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Product Name:</div>
              <div className="font-medium">{productName}</div>

              <div className="text-gray-600">SKU:</div>
              <div className="font-medium">{productSku}</div>

              <div className="text-gray-600">Barcode:</div>
              <div className="font-mono font-bold">{barcode}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="printQuantity">Number of labels to print</Label>
            <div className="flex items-center gap-4">
              <Input
                id="printQuantity"
                type="number"
                min="1"
                max="100"
                value={printQuantity}
                onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-24"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPrintQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPrintQuantity(prev => Math.min(100, prev + 1))}
                >
                  +
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Each page can fit approximately 4 labels
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium mb-2">Preview</div>
            <div className="text-center p-4 bg-white border">
              <div className="font-bold text-lg">{productName}</div>
              <div className="text-sm text-gray-600 mb-2">SKU: {productSku}</div>
              <div className="font-mono text-xl tracking-widest mb-2">{barcode}</div>
              <div className="text-xs text-gray-500">
                Generated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Skip Printing
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!printQuantity}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print {printQuantity} Label{printQuantity > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}