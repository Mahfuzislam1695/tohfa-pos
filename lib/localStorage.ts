export interface Product {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  unit: string // Now stores the short name of the unit (e.g., "kg", "ml", "pcs")
  purchasePrice: number
  sellingPrice: number
  stockQuantity: number // Always in the product's base unit
  lowStockThreshold: number
  description: string
  supplier: string
  barcode: string
  image?: string // Base64 encoded image or URL
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Unit {
  id: string
  name: string
  shortName: string
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone: string
  items: SaleItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  receivedAmount: number
  changeAmount: number
  createdAt: string
  createdBy: string
}

export interface PurchaseItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
}

export interface Purchase {
  id: string
  purchaseNumber: string
  items: PurchaseItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  notes: string
  createdAt: string
  createdBy: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "Admin" | "Manager" | "Salesman"
  status: "Active" | "Inactive"
  password: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  date: string
  category: string
  amount: number
  description: string
  paymentMethod: string
  reference: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY_PRODUCTS = "pos_products"
const STORAGE_KEY_CATEGORIES = "pos_categories"
const STORAGE_KEY_BRANDS = "pos_brands"
const STORAGE_KEY_UNITS = "pos_units"
const STORAGE_KEY_SUPPLIERS = "pos_suppliers"
const STORAGE_KEY_SALES = "pos_sales"
const STORAGE_KEY_PURCHASES = "pos_purchases"
const STORAGE_KEY_USERS = "pos_users"
const STORAGE_KEY_EXPENSES = "pos_expenses"

function createStorage<T extends { id: string; createdAt: string; updatedAt: string }>(storageKey: string) {
  return {
    getAll: (): T[] => {
      if (typeof window === "undefined") return []
      const data = localStorage.getItem(storageKey)
      return data ? JSON.parse(data) : []
    },

    getById: (id: string): T | null => {
      const items = createStorage<T>(storageKey).getAll()
      return items.find((item) => item.id === id) || null
    },

    add: (item: Omit<T, "id" | "createdAt" | "updatedAt">): T => {
      const items = createStorage<T>(storageKey).getAll()
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T
      items.push(newItem)
      localStorage.setItem(storageKey, JSON.stringify(items))
      return newItem
    },

    update: (id: string, updates: Partial<Omit<T, "id" | "createdAt">>): T | null => {
      const items = createStorage<T>(storageKey).getAll()
      const index = items.findIndex((item) => item.id === id)
      if (index === -1) return null

      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(items))
      return items[index]
    },

    delete: (id: string): boolean => {
      const items = createStorage<T>(storageKey).getAll()
      const filtered = items.filter((item) => item.id !== id)
      if (filtered.length === items.length) return false
      localStorage.setItem(storageKey, JSON.stringify(filtered))
      return true
    },
  }
}

export const productStorage = createStorage<Product>(STORAGE_KEY_PRODUCTS)

export const categoryStorage = createStorage<Category>(STORAGE_KEY_CATEGORIES)
export const brandStorage = createStorage<Brand>(STORAGE_KEY_BRANDS)
export const unitStorage = createStorage<Unit>(STORAGE_KEY_UNITS)
export const supplierStorage = createStorage<Supplier>(STORAGE_KEY_SUPPLIERS)

export const saleStorage = createStorage<Sale>(STORAGE_KEY_SALES)

export const purchaseStorage = createStorage<Purchase>(STORAGE_KEY_PURCHASES)
export const userStorage = createStorage<User>(STORAGE_KEY_USERS)
export const expenseStorage = createStorage<Expense>(STORAGE_KEY_EXPENSES)

export const productSpecificStorage = {
  // Get low stock products
  getLowStock: (): Product[] => {
    const products = productStorage.getAll()
    return products.filter((p) => p.stockQuantity <= p.lowStockThreshold)
  },

  // Search products
  search: (query: string): Product[] => {
    const products = productStorage.getAll()
    const lowerQuery = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        p.barcode.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery),
    )
  },

  updateStock: (productId: string, quantitySold: number): boolean => {
    const product = productStorage.getById(productId)
    if (!product || product.stockQuantity < quantitySold) return false

    productStorage.update(productId, {
      stockQuantity: product.stockQuantity - quantitySold,
    })
    return true
  },
}

export const saleSpecificStorage = {
  generateInvoiceNumber: (): string => {
    const sales = saleStorage.getAll()
    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
    const count = sales.filter((s) => s.invoiceNumber.startsWith(`INV-${dateStr}`)).length + 1
    return `INV-${dateStr}-${String(count).padStart(4, "0")}`
  },

  getTodaySales: (): Sale[] => {
    const sales = saleStorage.getAll()
    const today = new Date().toISOString().split("T")[0]
    return sales.filter((s) => s.createdAt.split("T")[0] === today)
  },
}

export const purchaseSpecificStorage = {
  generatePurchaseNumber: (): string => {
    const purchases = purchaseStorage.getAll()
    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
    const count = purchases.filter((p) => p.purchaseNumber.startsWith(`PUR-${dateStr}`)).length + 1
    return `PUR-${dateStr}-${String(count).padStart(4, "0")}`
  },

  getTodayPurchases: (): Purchase[] => {
    const purchases = purchaseStorage.getAll()
    const today = new Date().toISOString().split("T")[0]
    return purchases.filter((p) => p.createdAt.split("T")[0] === today)
  },
}
