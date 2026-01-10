export enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    MOBILE_BANKING = "MOBILE_BANKING",
    BANK_TRANSFER = "BANK_TRANSFER",
    DIGITAL_WALLET = "DIGITAL_WALLET",
    OTHER = "OTHER"
}

export enum PaymentStatus {
    PENDING = "PENDING",
    PARTIAL = "PARTIAL",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    CANCELLED = "CANCELLED",
    VOIDED = "VOIDED",
    OVERDUE = "OVERDUE"
}

export interface CustomerDueSummary {
    customerID: number
    customerName: string
    customerPhone: string
    currentBalance: number
    creditLimit?: number
    totalDue: number
    totalInvoices: number
    lastPaymentDate?: Date
    lastPaymentAmount?: number
    pendingInvoices: PendingInvoice[]
}

export interface PendingInvoice {
    sellID: number
    invoiceNumber: string
    saleDate: Date
    totalAmount: number
    paidAmount: number
    dueAmount: number
}

export interface PaymentRecord {
    paymentID: number
    paymentSid: string
    paymentNumber: string
    amount: number
    paymentMethod: PaymentMethod
    paymentType: string
    status: PaymentStatus
    paymentDate: Date
    transactionId?: string
    bankName?: string
    accountNumber?: string
    notes?: string
    customer?: {
        customerID: number
        name: string
        phone: string
        currentBalance: number
    }
    receivedBy?: {
        userID: number
        name: string
        email: string
    }
    createdAt: Date
}

export interface CustomerWithDues {
    customerID: number
    name: string
    phone: string
    email?: string
    currentBalance: number
    creditLimit?: number
    status: string
    createdAt: Date
    sells: {
        sellID: number
        invoiceNumber: string
        dueAmount: number
    }[]
}

export interface CreatePaymentDto {
    customerId?: number
    customerPhone?: string
    amount: number
    paymentMethod: PaymentMethod
    status?: PaymentStatus
    transactionId?: string
    bankName?: string
    accountNumber?: string
    notes?: string
}

export interface DueStatistics {
    totalCustomersWithDues: number
    totalOutstandingAmount: number
    averageDuePerCustomer: number
    customersOverCreditLimit: number
    recentPayments: number
    totalInvoicesPending: number
}

export interface MetaData {
    currentPage: number
    itemCount: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
    statistics?: DueStatistics
}