"use client"

import { useState } from "react"
import { useGetAll } from "./useGet"

export interface Payment {
    paymentID: number
    paymentSid: string
    paymentNumber: string
    amount: number
    paymentMethod: string
    paymentType: string
    status: string
    transactionId?: string
    bankName?: string
    accountNumber?: string
    chequeNumber?: string
    mobileOperator?: string
    notes?: string
    paymentDate: string
    createdAt: string
    updatedAt: string
    customerID?: number
    sellID?: number
    customer?: {
        customerID: number
        name: string
        phone: string
        currentBalance: number
    }
    sell?: {
        sellID: number
        invoiceNumber: string
        total: number
        dueAmount: number
    }
    receivedBy?: {
        userID: number
        name: string
        email: string
    }
}

export interface DueSale {
    sellID: number
    invoiceNumber: string
    totalAmount: number
    paidAmount: number
    dueAmount: number
    createdAt: string
    daysOverdue: number
    paymentStatus: string
}

export interface CustomerDueDetails {
    customerID: number
    customerName: string
    customerPhone: string
    totalDue: number
    totalCredit: number
    currentBalance: number
    creditLimit?: number
    dueSales: DueSale[]
    recentPayments: Payment[]
    totalOverdue: number
    lastPaymentDate?: string
}

export interface CustomerDueSummary {
    customerID: number
    name: string
    phone: string
    currentBalance: number
    creditLimit?: number
    totalDue: number
    saleDues: number
    creditDue: number
}

export interface PaymentSummary {
    totalPayments: number
    totalAmount: number
    totalPending: number
    totalCompleted: number
    cashPayments: number
    cardPayments: number
    mobilePayments: number
    bankTransfers: number
}

export interface OverdueSale {
    sellID: number
    invoiceNumber: string
    totalAmount: number
    paidAmount: number
    dueAmount: number
    createdAt: string
    customer: {
        customerID: number
        name: string
        phone: string
    }
    daysOverdue: number
}

interface MetaData {
    currentPage: number
    itemCount: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
}

interface UseDuesReturn {
    payments: Payment[]
    meta: MetaData
    isLoading: boolean
    searchTerm: string
    currentPage: number
    itemsPerPage: number
    setItemsPerPage: (count: number) => void
    setSearchTerm: (term: string) => void
    setCurrentPage: (page: number) => void
    refetch: () => void
}

interface UseCustomerDuesReturn {
    dueDetails?: CustomerDueDetails
    isLoading: boolean
    refetch: () => void
}

interface UseAllCustomerDuesReturn {
    customerDues: CustomerDueSummary[]
    isLoading: boolean
    refetch: () => void
}

interface UsePaymentSummaryReturn {
    summary?: PaymentSummary
    isLoading: boolean
    refetch: () => void
}

interface UseOverdueSalesReturn {
    overdueSales: OverdueSale[]
    isLoading: boolean
    refetch: () => void
}

export const useDues = (customerId?: number, filters?: {
    startDate?: string
    endDate?: string
    status?: string
    paymentMethod?: string
}): UseDuesReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Build query parameters
    const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(customerId && { customerId: customerId.toString() }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.paymentMethod && { paymentMethod: filters.paymentMethod })
    }).toString()

    const { data, isLoading, refetch } = useGetAll<any>(
        `/payments?${queryParams}`,
        [
            "payments",
            currentPage,
            searchTerm,
            itemsPerPage,
            customerId,
            filters?.startDate,
            filters?.endDate,
            filters?.status,
            filters?.paymentMethod
        ]
    )

    const paymentsData = data?.data || []
    const meta: MetaData = data?.meta || {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    }

    return {
        payments: paymentsData,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        itemsPerPage,
        setItemsPerPage,
        setSearchTerm,
        setCurrentPage,
        refetch
    }
}

export const useCustomerDueDetails = (customerId: number): UseCustomerDuesReturn => {
    const { data, isLoading, refetch } = useGetAll<any>(
        `/payments/dues/customer/${customerId}`,
        ["customerDueDetails", customerId]
    )

    return {
        dueDetails: data?.data,
        isLoading,
        refetch
    }
}

export const useAllCustomerDues = (): UseAllCustomerDuesReturn => {
    const { data, isLoading, refetch } = useGetAll<any>(
        `/payments/dues/all`,
        ["allCustomerDues"]
    )

    return {
        customerDues: data?.data || [],
        isLoading,
        refetch
    }
}

export const usePaymentSummary = (filters?: {
    startDate?: string
    endDate?: string
}): UsePaymentSummaryReturn => {
    const queryParams = new URLSearchParams({
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate })
    }).toString()

    const url = `/payments/summary${queryParams ? `?${queryParams}` : ''}`

    const { data, isLoading, refetch } = useGetAll<any>(
        url,
        ["paymentSummary", filters?.startDate, filters?.endDate]
    )

    return {
        summary: data?.data,
        isLoading,
        refetch
    }
}

export const useOverdueSales = (daysThreshold?: number): UseOverdueSalesReturn => {
    const queryParams = new URLSearchParams({
        ...(daysThreshold && { daysThreshold: daysThreshold.toString() })
    }).toString()

    const url = `/payments/overdue${queryParams ? `?${queryParams}` : ''}`

    const { data, isLoading, refetch } = useGetAll<any>(
        url,
        ["overdueSales", daysThreshold]
    )

    return {
        overdueSales: data?.data || [],
        isLoading,
        refetch
    }
}