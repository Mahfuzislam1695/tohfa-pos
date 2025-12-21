export interface UnitDefinition {
  name: string
  shortName: string
  category: "weight" | "volume" | "count" | "length" | "other"
  baseUnit?: string
  conversionFactor?: number // How many of this unit equals 1 base unit
}

export const PREDEFINED_UNITS: UnitDefinition[] = [
  // Most Used Units (Must-Have)
  { name: "Piece", shortName: "pcs", category: "count" },
  { name: "Kilogram", shortName: "kg", category: "weight" },
  { name: "Gram", shortName: "g", category: "weight", baseUnit: "kg", conversionFactor: 1000 },
  { name: "Liter", shortName: "l", category: "volume" },
  { name: "Milliliter", shortName: "ml", category: "volume", baseUnit: "l", conversionFactor: 1000 },
  { name: "Box", shortName: "box", category: "count" },
  { name: "Pack", shortName: "pack", category: "count" },
  { name: "Dozen", shortName: "dozen", category: "count" },
  { name: "Set", shortName: "set", category: "count" },

  // Retail & Grocery
  { name: "Bag", shortName: "bag", category: "count" },
  { name: "Bottle", shortName: "bottle", category: "count" },
  { name: "Can", shortName: "can", category: "count" },
  { name: "Jar", shortName: "jar", category: "count" },
  { name: "Sachet", shortName: "sachet", category: "count" },
  { name: "Bundle", shortName: "bundle", category: "count" },

  // Electronics / Hardware
  { name: "Unit", shortName: "unit", category: "count" },
  { name: "Pair", shortName: "pair", category: "count" },
  { name: "Roll", shortName: "roll", category: "count" },
  { name: "Meter", shortName: "m", category: "length" },
  { name: "Feet", shortName: "ft", category: "length" },
  { name: "Inch", shortName: "inch", category: "length" },
  { name: "Sheet", shortName: "sheet", category: "count" },

  // Wholesale / Bulk
  { name: "Carton", shortName: "carton", category: "count" },
  { name: "Case", shortName: "case", category: "count" },
  { name: "Packet", shortName: "packet", category: "count" },
  { name: "Lot", shortName: "lot", category: "count" },
]

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
