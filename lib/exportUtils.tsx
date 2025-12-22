// Export utilities for CSV and PDF generation (browser-compatible, no external dependencies)

export function exportToCSV(data: any[], filename = "export") {
  if (data.length === 0) return

  // Handle products
  if (data.length > 0 && "sku" in data[0]) {
    const headers = ["SKU", "Name", "Category", "Brand", "Price", "Stock", "Unit"]
    const rows = data.map((product) => [
      product.sku,
      product.name,
      product.category,
      product.brand,
      `৳${product.price}`,
      product.stock,
      product.unit,
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    downloadCSV(csvContent, filename)
  }
}

export function exportToPDF(data: any[], filename = "export") {
  if (data.length === 0) return

  // Handle products - Create a printable HTML table
  if (data.length > 0 && "sku" in data[0]) {
    const tableRows = data
      .map(
        (product) => `
      <tr>
        <td>${product.sku}</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.brand}</td>
        <td>৳${product.price}</td>
        <td>${product.stock}</td>
        <td>${product.unit}</td>
      </tr>
    `,
      )
      .join("")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #10b981; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #10b981; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Products Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
    }
  }
}

export function exportSalesToCSV(sales: any[], filename = "sales", stats?: any) {
  if (sales.length === 0) return

  const headers = ["Invoice", "Date", "Customer", "Items", "Subtotal", "Discount", "Tax", "Total", "Payment"]
  const rows = sales.map((sale) => [
    sale.invoiceNumber,
    new Date(sale.date).toLocaleDateString(),
    sale.customerName || "Walk-in",
    sale.items.length,
    `৳${sale.subtotal}`,
    `৳${sale.discount}`,
    `৳${sale.tax}`,
    `৳${sale.total}`,
    sale.paymentMethod,
  ])

  let csvContent = ""

  // Add statistics if provided
  if (stats) {
    csvContent += `Sales Report\n`
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    csvContent += `Total Sales: ${stats.totalSales}\n`
    csvContent += `Total Revenue: ৳${stats.totalRevenue}\n`
    csvContent += `Total Items Sold: ${stats.totalItems}\n`
    csvContent += `Total Discount: ৳${stats.totalDiscount}\n\n`
  }

  csvContent += [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  downloadCSV(csvContent, filename)
}

export function exportSalesToPDF(sales: any[], filename = "sales", stats?: any) {
  if (sales.length === 0) return

  const statsHtml = stats
    ? `
    <div style="margin-bottom: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
      <h2 style="margin-top: 0;">Summary Statistics</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
        <div><strong>Total Sales:</strong> ${stats.totalSales}</div>
        <div><strong>Total Revenue:</strong> ৳${stats.totalRevenue}</div>
        <div><strong>Total Items:</strong> ${stats.totalItems}</div>
        <div><strong>Total Discount:</strong> ৳${stats.totalDiscount}</div>
      </div>
    </div>
  `
    : ""

  const tableRows = sales
    .map(
      (sale) => `
    <tr>
      <td>${sale.invoiceNumber}</td>
      <td>${new Date(sale.date).toLocaleDateString()}</td>
      <td>${sale.customerName || "Walk-in"}</td>
      <td>${sale.items.length}</td>
      <td>৳${sale.subtotal}</td>
      <td>৳${sale.discount}</td>
      <td>৳${sale.tax}</td>
      <td>৳${sale.total}</td>
      <td>${sale.paymentMethod}</td>
    </tr>
  `,
    )
    .join("")

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #10b981; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
          th { background-color: #10b981; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Sales Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        ${statsHtml}
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>Discount</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `

  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
