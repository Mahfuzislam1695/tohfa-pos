"use client"

import { useState, useEffect } from "react"
import { useGetAll } from "./useGet"
import { Expense } from "@/lib/localStorage"
import { ExpenseCategory, ExpensePaymentMethod, ExpensesResponse } from "@/types/expense"


interface UseExpensesReturn {
    expenses: Expense[]
    meta: ExpensesResponse['meta']
    isLoading: boolean
    searchTerm: string
    currentPage: number
    itemsPerPage: number
    startDate: string
    endDate: string
    category: ExpenseCategory | 'all'
    paymentMethod: ExpensePaymentMethod | 'all'
    minAmount: string
    maxAmount: string
    sortOrder: string
    setSearchTerm: (term: string) => void
    setCurrentPage: (page: number) => void
    setItemsPerPage: (limit: number) => void
    setStartDate: (date: string) => void
    setEndDate: (date: string) => void
    setCategory: (category: ExpenseCategory | 'all') => void
    setPaymentMethod: (method: ExpensePaymentMethod | 'all') => void
    setMinAmount: (amount: string) => void
    setMaxAmount: (amount: string) => void
    setSortOrder: (order: string) => void
    refetch: () => void
}

export const useExpenses = (): UseExpensesReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [category, setCategory] = useState<ExpenseCategory | 'all'>('all')
    const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod | 'all'>('all')
    const [minAmount, setMinAmount] = useState("")
    const [maxAmount, setMaxAmount] = useState("")

    // Build query parameters
    const buildQueryParams = () => {
        const params: Record<string, string> = {
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
        }

        if (searchTerm) params.search = searchTerm
        if (startDate) params.startDate = startDate
        if (endDate) params.endDate = endDate
        if (category !== 'all') params.category = category
        if (paymentMethod !== 'all') params.paymentMethod = paymentMethod
        if (minAmount) params.minAmount = minAmount
        if (maxAmount) params.maxAmount = maxAmount
        return params
    }

    const { data, isLoading, refetch } = useGetAll<ExpensesResponse>(
        `/expenses`,
        [
            "expenses",
            currentPage,
            itemsPerPage,
            searchTerm,
            startDate,
            endDate,
            category,
            paymentMethod,
            minAmount,
            maxAmount
        ],
        buildQueryParams()
    )

    const expenses = data?.data || []
    const meta = data?.meta || {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
    }

    return {
        expenses,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        itemsPerPage,
        startDate,
        endDate,
        category,
        paymentMethod,
        minAmount,
        maxAmount,
        setSearchTerm,
        setCurrentPage,
        setItemsPerPage,
        setStartDate,
        setEndDate,
        setCategory,
        setPaymentMethod,
        setMinAmount,
        setMaxAmount,
        refetch
    }
}