"use client"

import { useState } from "react"
import { useGetAll } from "./useGet"

interface Category {
    categoryID: number
    categorySid: string
    name: string
    description: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface MetaData {
    currentPage: number
    itemCount: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
}



interface UseCategoriesReturn {
    categories: Category[]
    meta: MetaData
    isLoading: boolean
    searchTerm: string
    currentPage: number
    setSearchTerm: (term: string) => void
    setCurrentPage: (page: number) => void
    refetch: () => void
}

export const useCategories = (): UseCategoriesReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const itemsPerPage = 10

    // Build query parameters for pagination and search
    const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
    }).toString()

    const { data, isLoading, refetch } = useGetAll<any>(`/categories?${queryParams}`, [
        "categories",
        currentPage,
        searchTerm,
        itemsPerPage
    ])

    const categoriesData = data?.data || []
    const meta: MetaData = data?.meta || {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    }

    // Transform API data to match our interface
    const categories: Category[] = categoriesData.map((category: any) => ({
        categoryID: category.categoryID,
        categorySid: category.categorySid,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    }))

    return {
        categories,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        setSearchTerm,
        setCurrentPage,
        refetch
    }
}