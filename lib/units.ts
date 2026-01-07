import { exportToCSV } from "./exportUtils"

export interface UnitDefinition {
  name: string
  shortName: string
  category: "weight" | "volume" | "count" | "length" | "other"
  baseUnit?: string
  conversionFactor?: number
  allowsDecimal?: boolean
}

export const PREDEFINED_UNITS: UnitDefinition[] = [
  // Most Used Units (Must-Have)
  { name: "Piece", shortName: "pcs", category: "count", allowsDecimal: false },
  { name: "Kilogram", shortName: "kg", category: "weight", allowsDecimal: true },
  { name: "Gram", shortName: "g", category: "weight", baseUnit: "kg", conversionFactor: 1000, allowsDecimal: true },
  { name: "Liter", shortName: "l", category: "volume", allowsDecimal: true },
  { name: "Milliliter", shortName: "ml", category: "volume", baseUnit: "l", conversionFactor: 1000, allowsDecimal: true },
  { name: "Box", shortName: "box", category: "count", allowsDecimal: false },
  { name: "Pack", shortName: "pack", category: "count", allowsDecimal: false },
  { name: "Dozen", shortName: "dozen", category: "count", allowsDecimal: false },
  { name: "Set", shortName: "set", category: "count", allowsDecimal: false },

  // Retail & Grocery
  { name: "Bag", shortName: "bag", category: "count", allowsDecimal: false },
  { name: "Bottle", shortName: "bottle", category: "count", allowsDecimal: false },
  { name: "Can", shortName: "can", category: "count", allowsDecimal: false },
  { name: "Jar", shortName: "jar", category: "count", allowsDecimal: false },
  { name: "Sachet", shortName: "sachet", category: "count", allowsDecimal: false },
  { name: "Bundle", shortName: "bundle", category: "count", allowsDecimal: false },

  // Electronics / Hardware
  { name: "Unit", shortName: "unit", category: "count", allowsDecimal: false },
  { name: "Pair", shortName: "pair", category: "count", allowsDecimal: false },
  { name: "Roll", shortName: "roll", category: "count", allowsDecimal: false },
  { name: "Meter", shortName: "m", category: "length", allowsDecimal: true },
  { name: "Feet", shortName: "ft", category: "length", allowsDecimal: true },
  { name: "Inch", shortName: "inch", category: "length", allowsDecimal: true },
  { name: "Sheet", shortName: "sheet", category: "count", allowsDecimal: false },

  // Wholesale / Bulk
  { name: "Carton", shortName: "carton", category: "count", allowsDecimal: false },
  { name: "Case", shortName: "case", category: "count", allowsDecimal: false },
  { name: "Packet", shortName: "packet", category: "count", allowsDecimal: false },
  { name: "Lot", shortName: "lot", category: "count", allowsDecimal: false },
]

// Helper function to check if a unit allows decimal quantities
export const unitAllowsDecimal = (unitShortName: string): boolean => {
  const unit = getUnitByShortName(unitShortName)
  // Default to false if not specified
  return unit?.allowsDecimal || false
}


export function getUnitByShortName(shortName: string): UnitDefinition | undefined {
  return PREDEFINED_UNITS.find((u) => u.shortName === shortName)
}

export function canConvertUnit(fromUnit: string, toUnit: string): boolean {
  const from = getUnitByShortName(fromUnit)
  const to = getUnitByShortName(toUnit)

  if (!from || !to) return false
  if (from.category !== to.category) return false

  return true
}

export function convertQuantity(quantity: number, fromUnit: string, toUnit: string): number | null {
  const from = getUnitByShortName(fromUnit)
  const to = getUnitByShortName(toUnit)

  if (!from || !to || !canConvertUnit(fromUnit, toUnit)) return null

  // Same unit
  if (fromUnit === toUnit) return quantity

  // Convert to base unit first, then to target unit
  let inBaseUnit = quantity

  // Convert from source to base unit
  if (from.baseUnit && from.conversionFactor) {
    inBaseUnit = quantity / from.conversionFactor
  }

  // Convert from base unit to target
  if (to.baseUnit && to.conversionFactor) {
    return inBaseUnit * to.conversionFactor
  }

  return inBaseUnit
}

export function convertToBaseUnit(quantity: number, unit: string): number {
  const unitDef = getUnitByShortName(unit)

  if (!unitDef) return quantity

  // If already base unit, return as is
  if (!unitDef.baseUnit) return quantity

  // Convert to base unit
  if (unitDef.conversionFactor) {
    return quantity / unitDef.conversionFactor
  }

  return quantity
}

export function getUnitShortName(unit: string): string {
  const unitDef = getUnitByShortName(unit)
  return unitDef ? unitDef.shortName : unit
}


export function formatDate(dateString: string, includeTime: boolean = false): string {
  const date = new Date(dateString)

  if (includeTime) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function getDateRange(filter: string, customStart?: Date, customEnd?: Date) {
  const today = new Date()
  const startDate = new Date()
  const endDate = new Date()

  switch (filter) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'yesterday':
      startDate.setDate(today.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(today.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'last7days':
      startDate.setDate(today.getDate() - 7)
      break
    case 'last30days':
      startDate.setDate(today.getDate() - 30)
      break
    case 'thisMonth':
      startDate.setDate(1)
      break
    case 'lastMonth':
      startDate.setMonth(today.getMonth() - 1, 1)
      endDate.setMonth(today.getMonth(), 0)
      break
    case 'thisYear':
      startDate.setMonth(0, 1)
      break
    case 'custom':
      if (customStart) startDate.setTime(customStart.getTime())
      if (customEnd) endDate.setTime(customEnd.getTime())
      break
    default:
      startDate.setDate(today.getDate() - 30)
  }

  return { startDate, endDate }
}


// Validate phone number
export function validatePhone(phone: string): boolean {
  // Accepts formats like: +8801750256844 or (+880) 2 223362613-4
  const phoneRegex = /^(\+\d{1,4}\s?)?(\(\+\d{1,4}\))?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}$/
  return phoneRegex.test(phone)
}

// Validate password strength
export function validatePassword(password: string): boolean {
  // At least 8 characters, contains letters and numbers
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  return passwordRegex.test(password)
}

// export const exportReturnsToCSV = (returns: any[], filename: string) => {
//   const headers = [
//     'Return Number',
//     'Invoice Number',
//     'Customer Name',
//     'Customer Phone',
//     'Return Type',
//     'Return Reason',
//     'Status',
//     'Refund Amount',
//     'Restocking Fee',
//     'Total Amount',
//     'Created Date',
//     'Processed Date',
//     'Description',
//     'Items Count',
//     'Exchange Product'
//   ]

//   const data = returns.map(ret => ({
//     'Return Number': ret.returnNumber,
//     'Invoice Number': ret.sell.invoiceNumber,
//     'Customer Name': ret.customerName,
//     'Customer Phone': ret.customerPhone,
//     'Return Type': ret.returnType,
//     'Return Reason': ret.returnReason,
//     'Status': ret.status,
//     'Refund Amount': ret.refundAmount,
//     'Restocking Fee': ret.restockingFee,
//     'Total Amount': ret.totalAmount,
//     'Created Date': new Date(ret.createdAt).toLocaleDateString(),
//     'Processed Date': ret.processedAt ? new Date(ret.processedAt).toLocaleDateString() : '',
//     'Description': ret.description,
//     'Items Count': ret.returnItems.length,
//     'Exchange Product': ret.exchangeForProduct?.name || ''
//   }))
// }