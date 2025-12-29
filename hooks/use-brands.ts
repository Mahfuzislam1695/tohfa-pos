"use client"

import { useState } from "react"
import { useGetAll } from "./useGet"

interface Brand {
    brandID: number
    brandSid: string
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

interface UseBrandsReturn {
    brands: Brand[]
    meta: MetaData
    isLoading: boolean
    searchTerm: string
    currentPage: number
    setSearchTerm: (term: string) => void
    setCurrentPage: (page: number) => void
    refetch: () => void
}

export const useBrands = (): UseBrandsReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const itemsPerPage = 10

    // Build query parameters for pagination and search
    const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
    }).toString()

    const { data, isLoading, refetch } = useGetAll<any>(`/brands?${queryParams}`, [
        "brands",
        currentPage,
        searchTerm,
        itemsPerPage
    ])

    const brandsData = data?.data || []
    const meta: MetaData = data?.meta || {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    }

    // Transform API data to match our interface
    const brands: Brand[] = brandsData.map((brand: any) => ({
        brandID: brand.brandID,
        brandSid: brand.brandSid,
        name: brand.name,
        description: brand.description,
        isActive: brand.isActive,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt
    }))

    return {
        brands,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        setSearchTerm,
        setCurrentPage,
        refetch
    }
}