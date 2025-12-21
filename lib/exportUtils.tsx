export function exportSalesToCSV(sales: any[], filename = "sales") {
  const headers = ["Invoice", "Date", "Customer", "Phone", "Items", "Subtotal", "Discount", "Tax", "Total", "Payment"]

  const rows = sales.map((sale) => [
    sale.invoiceNumber,
    new Date(sale.createdAt).toLocaleString(),
    sale.customerName || "Walk-in",
    sale.customerPhone || "-",
    sale.items.length.toString(),
    `৳${sale.subtotal.toFixed(2)}`,
    `৳${sale.discount.toFixed(2)}`,
    `৳${sale.tax.toFixed(2)}`,
    `৳${sale.total.toFixed(2)}`,
    sale.paymentMethod,
  ])

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportSalesToPDF(sales: any[], filename = "sales", stats?: any) {
  // Create a printable HTML document
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #10b981; }
          .stats { margin: 20px 0; }
          .stats p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #10b981; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Sales Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        ${
          stats
            ? `
          <div class="stats">
            <p><strong>Total Sales:</strong> ${stats.totalSales}</p>
            <p><strong>Total Revenue:</strong> ৳${stats.totalRevenue.toFixed(2)}</p>
            <p><strong>Total Items Sold:</strong> ${stats.totalItems}</p>
          </div>
        `
            : ""
        }
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${sales
              .map(
                (sale) => `
              <tr>
                <td>${sale.invoiceNumber}</td>
                <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
                <td>${sale.customerName || "Walk-in"}</td>
                <td>${sale.items.length}</td>
                <td>৳${sale.total.toFixed(2)}</td>
                <td>${sale.paymentMethod}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

export function exportToCSV(data: any[], filename: string) {
  // Handle products
  if (data.length > 0 && "sku" in data[0]) {
    const headers = [
      "SKU",
      "Name",
      "Category",
      "Brand",
      "Unit",
      "Purchase Price",
      "Selling Price",
      "Stock Quantity",
      "Low Stock Threshold",
      "Supplier",
      "Barcode",
    ]

    const rows = data.map((product) => [
      product.sku,
      product.name,
      product.category,
      product.brand,
      product.unit,
      `৳${product.purchasePrice.toFixed(2)}`,
      `৳${product.sellingPrice.toFixed(2)}`,
      product.stockQuantity.toString(),
      product.lowStockThreshold.toString(),
      product.supplier,
      product.barcode,
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}

export function exportToPDF(data: any[], filename: string) {
  // Handle products
  if (data.length > 0 && "sku" in data[0]) {
    // Create a printable HTML document
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Products Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #10b981; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #10b981; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Products Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Products: ${data.length}</p>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Purchase</th>
                <th>Selling</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (product) => `
                <tr>
                  <td>${product.sku}</td>
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>${product.brand}</td>
                  <td>৳${product.purchasePrice.toFixed(2)}</td>
                  <td>৳${product.sellingPrice.toFixed(2)}</td>
                  <td>${product.stockQuantity}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }
}
