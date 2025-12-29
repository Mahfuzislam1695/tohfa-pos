import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export interface PaginatedQueryParams {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    [key: string]: any
}

export const usePaginatedQuery = <T>(
    endpoint: string,
    queryKeyBase: string[],
    params?: PaginatedQueryParams
) => {
    // Create a stable query key
    const queryKey = [
        ...queryKeyBase,
        params?.page || 1,
        params?.limit || 10,
        params?.search || "",
        params?.sortBy || "",
        params?.sortOrder || ""
    ]

    return useQuery<T>({
        queryKey,
        queryFn: async () => {
            const response = await axios.get(endpoint, {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    ...(params?.search && { search: params.search }),
                    ...(params?.sortBy && { sortBy: params.sortBy }),
                    ...(params?.sortOrder && { sortOrder: params.sortOrder }),
                }
            })
            return response.data
        }
    })
}