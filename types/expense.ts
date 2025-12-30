export enum ExpenseCategory {
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  SALARIES = 'SALARIES',
  SUPPLIES = 'SUPPLIES',
  MARKETING = 'MARKETING',
  TRANSPORTATION = 'TRANSPORTATION',
  MAINTENANCE = 'MAINTENANCE',
  INSURANCE = 'INSURANCE',
  TAXES = 'TAXES',
  OTHER = 'OTHER'
}

export enum ExpensePaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT'
}

export interface Expense {
  expenseID: number
  expenseSid: string
  date: string
  amount: number
  category: ExpenseCategory
  paymentMethod: ExpensePaymentMethod
  referenceNumber?: string
  description?: string
  receiptUrl?: string
  fileName?: string
  createdAt: string
  updatedAt: string
  createdBy: {
    userID: number
    name: string
    email: string
  }
}

export interface ExpenseFormData {
  date: string
  amount: string
  category: ExpenseCategory | ''
  paymentMethod: ExpensePaymentMethod | ''
  referenceNumber?: string
  description?: string
  receiptUrl?: string
  fileName?: string
}

export interface ExpensesResponse {
  statusCode: number
  success: boolean
  message: string
  data: Expense[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}