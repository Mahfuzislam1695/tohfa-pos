"use client"

import { useGetAll } from "./useGet"

export interface Brand {
    brandID: number
    name: string
}

export const useBrandsDropdown = () => {
    const { data, isLoading } = useGetAll<any>("/brands?limit=100", ["brands-dropdown"])

    const brands: Brand[] = data?.data?.map((brand: any) => ({
        brandID: brand.brandID,
        name: brand.name
    })) || []

    return {
        brands,
        isLoading
    }
}