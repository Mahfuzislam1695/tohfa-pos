"use client"

import { useGetAll } from "./useGet"

export interface Category {
    categoryID: number
    name: string
}

export const useCategoriesDropdown = () => {
    const { data, isLoading } = useGetAll<any>("/categories?limit=100", ["categories-dropdown"])

    const categories: Category[] = data?.data?.map((category: any) => ({
        categoryID: category.categoryID,
        name: category.name
    })) || []

    return {
        categories,
        isLoading
    }
}