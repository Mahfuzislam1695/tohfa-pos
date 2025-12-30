"use client"

import { useState } from "react"
import { useGetAll } from "./useGet"
import { User, Role, Status, UsersResponse } from "@/types/user"

interface UseUsersReturn {
    users: User[]
    meta: UsersResponse['meta']
    isLoading: boolean
    searchTerm: string
    currentPage: number
    itemsPerPage: number
    setSearchTerm: (term: string) => void
    setCurrentPage: (page: number) => void
    setItemsPerPage: (limit: number) => void
    refetch: () => void
}

export const useUsers = (): UseUsersReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Build query parameters
    const buildQueryParams = () => {
        const params: Record<string, string> = {
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
        }

        if (searchTerm) {
            params.search = searchTerm
        }

        return params
    }

    const { data, isLoading, refetch } = useGetAll<UsersResponse>(
        `/users`,
        [
            "users",
            currentPage,
            itemsPerPage,
            searchTerm
        ],
        buildQueryParams()
    )

    const users = data?.data || []
    const meta = data?.meta || {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
    }

    return {
        users,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        itemsPerPage,
        setSearchTerm,
        setCurrentPage,
        setItemsPerPage,
        refetch
    }
}