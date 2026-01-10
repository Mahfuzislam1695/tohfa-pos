// import { CartItem } from "./types"

interface CartItem {
    sellItemID: number
    sellItemSid: string
    productID: number
    quantity: number
    returnedQuantity: number
    netQuantity: number
    unitPrice: number
    subtotal: number
    productName: string
    productSku: string
    isReturned: boolean
    isFullyReturned: boolean
    product?: {
        productID: number
        productSid: string
        sku: string
        name: string
        unit: string
    }
}

interface SaleData {
    sellID: number
    sellSid: string
    invoiceNumber: string
    customerName?: string
    customerPhone?: string
    subtotal: number
    discount: number
    tax: number
    taxRate: number
    total: number
    totalReturned: number
    netTotal: number
    paymentMethod: string
    receivedAmount: number
    changeAmount: number
    paymentStatus: string
    paidAmount: number
    dueAmount: number
    isCreditSale: boolean
    discountType?: string
    notes?: string
    createdAt: string
    updatedAt: string
    createdBy?: {
        userID: number
        name: string
        email: string
    }
    customer?: {
        customerID: number
        name: string
        phone: string
        currentBalance: number
    }
    payments?: Array<{
        paymentID: number
        paymentNumber: string
        amount: number
        paymentMethod: string
        status: string
        paymentDate: string
    }>
    sellItems: CartItem[]
}

export function printReceipt(sale: SaleData) {
    const receiptWindow = window.open("", "_blank")
    if (!receiptWindow) return

    const cartItems = sale.sellItems || []
    const subtotal = sale.subtotal || 0
    const discountAmount = sale.discount || 0
    const taxAmount = sale.tax || 0
    const total = sale.total || 0
    const netTotal = sale.netTotal || total // Use netTotal if available
    const totalReturned = sale.totalReturned || 0
    const receivedAmountNum = sale.receivedAmount || 0
    const changeAmount = sale.changeAmount || 0
    const paymentMethod = sale.paymentMethod || "CASH"
    const notes = sale.notes || ""
    const paidAmount = sale.paidAmount || 0
    const dueAmount = sale.dueAmount || 0
    const isCreditSale = sale.isCreditSale || false

    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Receipt - ${sale.invoiceNumber}</title>
                <style>
                    body { font-family: monospace; padding: 5px; max-width: 300px; margin: 0 auto; }
                    h2 { text-align: center; margin: 10px 0; }
                    .line { border-top: 1px dashed #000; margin: 10px 0; }
                    .row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .bold { font-weight: bold; }
                    .center { text-align: center; }
                    .center1 { margin-top: 4px; }
                    .returned { color: #d00; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { text-align: left; padding: 5px 0; }
                    .right { text-align: right; }
                    .receipt-table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                    }
                    .receipt-table th,
                    .receipt-table td {
                        padding: 4px 3px;
                        font-size: 12px;
                        line-height: 1.2;
                    }
                    .receipt-table thead th {
                        border-bottom: 1px dashed #000;
                        padding-bottom: 6px;
                    }
                    .receipt-table .left {
                        text-align: left;
                    }
                    .receipt-table .right {
                        text-align: right;
                        white-space: nowrap;
                    }
                    .receipt-table .item {
                        word-break: break-word;
                        padding-right: 6px;
                    }
                </style>
            </head>
            <body>
                <h2>AT-TOHFA</h2>
                <div class="center">Gift & Islamic Item</div>
                <div class="center">Kamarpara</div>
                <div class="center">Phone: 01752372837</div>
                <div class="line"></div>
                <div class="row"><span>Invoice:</span><span>${sale.invoiceNumber}</span></div>
                <div class="row"><span>Date:</span><span>${new Date(sale.createdAt).toLocaleString()}</span></div>
                <div class="row"><span>Customer:</span><span>${sale.customerName || 'Walk-in Customer'}</span></div>
                ${sale.customerPhone ? `<div class="row"><span>Phone:</span><span>${sale.customerPhone}</span></div>` : ""}
                ${totalReturned > 0 ? `<div class="row returned"><span>Total Returned:</span><span>-৳${totalReturned.toFixed(2)}</span></div>` : ""}
                <div class="line"></div>
                <table class="receipt-table">
                    <colgroup>
                        <col style="width: 6%">
                        <col style="width: 42%">
                        <col style="width: 12%">
                        <col style="width: 20%">
                        <col style="width: 20%">
                    </colgroup>
                    <thead>
                        <tr>
                            <th class="center">SL</th>
                            <th class="left">Item</th>
                            <th class="right">Qty</th>
                            <th class="right">Price</th>
                            <th class="right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cartItems
            .map(
                (item: CartItem, index: number) => {
                    const quantity = item.netQuantity || item.quantity
                    const isReturned = item.isReturned || false
                    const returnedQty = item.returnedQuantity || 0
                    const isFullyReturned = item.isFullyReturned || false

                    return `
                                        <tr ${isReturned ? 'class="returned"' : ''}>
                                            <td class="center">${index + 1}</td>
                                            <td class="item">
                                                ${item.productName}
                                                ${returnedQty > 0 ? `<br><small>(${returnedQty} returned)</small>` : ''}
                                                ${isFullyReturned ? '<br><small>[FULLY RETURNED]</small>' : ''}
                                            </td>
                                            <td class="right">${quantity}</td>
                                            <td class="right">${item.unitPrice.toFixed(2)}</td>
                                            <td class="right">${item.subtotal.toFixed(2)}</td>
                                        </tr>
                                    `
                }
            )
            .join("")}
                    </tbody>
                </table>
                <div class="line"></div>
                <div class="row"><span>Subtotal:</span><span>৳${subtotal.toFixed(2)}</span></div>
                ${discountAmount > 0 ? `<div class="row"><span>Discount (${((discountAmount / subtotal) * 100).toFixed(0)}%):</span><span>-৳${discountAmount.toFixed(2)}</span></div>` : ""}
                ${taxAmount > 0 ? `<div class="row"><span>Tax:</span><span>৳${taxAmount.toFixed(2)}</span></div>` : ""}
                <div class="line"></div>
                
                ${totalReturned > 0 ? `
                    <div class="row"><span>Original Total:</span><span>৳${total.toFixed(2)}</span></div>
                    <div class="row returned"><span>Returned Amount:</span><span>-৳${totalReturned.toFixed(2)}</span></div>
                    <div class="row bold"><span>Net Total:</span><span>৳${netTotal.toFixed(2)}</span></div>
                ` : `
                    <div class="row bold"><span>TOTAL:</span><span>৳${total.toFixed(2)}</span></div>
                `}
                
                ${isCreditSale ? `
                    <div class="row"><span>Paid Amount:</span><span>৳${paidAmount.toFixed(2)}</span></div>
                    <div class="row"><span>Due Amount:</span><span>৳${dueAmount.toFixed(2)}</span></div>
                ` : ''}
                
                ${paymentMethod === "CASH" && !isCreditSale ? `
                    <div class="row"><span>Received:</span><span>৳${receivedAmountNum.toFixed(2)}</span></div>
                    <div class="row"><span>Change:</span><span>৳${changeAmount.toFixed(2)}</span></div>
                ` : ''}
                
                <div class="row"><span>Payment:</span><span>${paymentMethod.toUpperCase()}</span></div>
                
                ${sale.paymentStatus ? `<div class="row"><span>Status:</span><span>${sale.paymentStatus}</span></div>` : ''}
                
                <div class="line"></div>
                ${notes ? `<div class="center">Notes: ${notes}</div>` : ''}
                <div class="center">Thanks for shopping—see you again!</div>
                <div class="line"></div>
                <div class="center ">Built by AethraSoft | 01750256844</div>
                <script>window.print(); window.onafterprint = () => window.close();</script>
            </body>
        </html>
    `)
    receiptWindow.document.close()
}
// export function printReceipt(sale: SaleData) {
//     const receiptWindow = window.open("", "_blank")
//     if (!receiptWindow) return

//     const cartItems = sale.sellItems || []
//     const subtotal = sale.subtotal || 0
//     const discountAmount = sale.discount || 0
//     const taxAmount = sale.tax || 0
//     const total = sale.total || 0
//     const receivedAmountNum = sale.receivedAmount || 0
//     const changeAmount = sale.changeAmount || 0
//     const paymentMethod = sale.paymentMethod || "CASH"
//     const notes = sale.notes || ""

//     receiptWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//             <head>
//                 <title>Receipt - ${sale.invoiceNumber}</title>
//                 <style>
//                     body { font-family: monospace; padding: 5px; max-width: 300px; margin: 0 auto; }
//                     h2 { text-align: center; margin: 10px 0; }
//                     .line { border-top: 1px dashed #000; margin: 10px 0; }
//                     .row { display: flex; justify-content: space-between; margin: 5px 0; }
//                     .bold { font-weight: bold; }
//                     .center { text-align: center; }
//                     table { width: 100%; border-collapse: collapse; }
//                     th, td { text-align: left; padding: 5px 0; }
//                     .right { text-align: right; }
//                     .receipt-table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         table-layout: fixed;
//                     }
//                     .receipt-table th,
//                     .receipt-table td {
//                         padding: 4px 3px;
//                         font-size: 12px;
//                         line-height: 1.2;
//                     }
//                     .receipt-table thead th {
//                         border-bottom: 1px dashed #000;
//                         padding-bottom: 6px;
//                     }
//                     .receipt-table .left {
//                         text-align: left;
//                     }
//                     .receipt-table .right {
//                         text-align: right;
//                         white-space: nowrap;
//                     }
//                     .receipt-table .item {
//                         word-break: break-word;
//                         padding-right: 6px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <h2>AT-TOHFA</h2>
//                 <div class="center">Gift & Islamic Item</div>
//                 <div class="center">Kamarpara</div>
//                 <div class="center">Phone: 01752372837</div>
//                 <div class="line"></div>
//                 <div class="row"><span>Invoice:</span><span>${sale.invoiceNumber}</span></div>
//                 <div class="row"><span>Date:</span><span>${new Date(sale.createdAt).toLocaleString()}</span></div>
//                 <div class="row"><span>Customer:</span><span>${sale.customerName}</span></div>
//                 ${sale.customerPhone ? `<div class="row"><span>Phone:</span><span>${sale.customerPhone}</span></div>` : ""}
//                 <div class="line"></div>
//                 <table class="receipt-table">
//                     <colgroup>
//                         <col style="width: 6%">
//                         <col style="width: 42%">
//                         <col style="width: 12%">
//                         <col style="width: 20%">
//                         <col style="width: 20%">
//                     </colgroup>
//                     <thead>
//                         <tr>
//                             <th class="center">SL</th>
//                             <th class="left">Item</th>
//                             <th class="right">Qty</th>
//                             <th class="right">Price</th>
//                             <th class="right">Total</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${cartItems
//             .map(
//                 (item: CartItem, index: number) => `
//                                 <tr>
//                                     <td class="center">${index + 1}</td>
//                                     <td class="item">${item.productName}</td>
//                                     <td class="right">${item.quantity}</td>
//                                     <td class="right">${item.unitPrice.toFixed(2)}</td>
//                                     <td class="right">${item.subtotal.toFixed(2)}</td>
//                                 </tr>
//                             `
//             )
//             .join("")}
//                     </tbody>
//                 </table>
//                 <div class="line"></div>
//                 <div class="row"><span>Subtotal:</span><span>৳${sale.subtotal.toFixed(2)}</span></div>
//                  ${sale.discount > 0 ? `<div class="row"><span>Discount (${((sale.discount / sale.subtotal) * 100).toFixed(0)}%):</span><span>-৳${sale.discount.toFixed(2)}</span></div>` : ""}
//                 ${sale.tax > 0 ? `<div class="row"><span>Tax:</span><span>৳${sale.tax.toFixed(2)}</span></div>` : ""}
//                 <div class="line"></div>
//                 <div class="row bold"><span>TOTAL:</span><span>৳${sale.total.toFixed(2)}</span></div>
//                 ${sale.paymentMethod === "cash"
//             ? `
//                     <div class="row"><span>Received:</span><span>৳${sale.receivedAmount.toFixed(2)}</span></div>
//                     <div class="row"><span>Change:</span><span>৳${sale.changeAmount.toFixed(2)}</span></div>
//                 `
//             : ""
//         }
//                 <div class="row"><span>Payment:</span><span>${sale.paymentMethod.toUpperCase()}</span></div>
//                 <div class="line"></div>
//                 <div class="center">Thanks for shopping—see you again!</div>
//                 <div class="center">Built:aethrasoft.com | 01750-256844</div>
//                 <script>window.print(); window.onafterprint = () => window.close();</script>
//             </body>
//         </html>
//     `)
//     receiptWindow.document.close()
// }