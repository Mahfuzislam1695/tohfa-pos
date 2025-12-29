import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

interface UseDeleteOptions {
    onSuccess?: (data: any) => void
    onError?: (error: any) => void
    successMessage?: string
    errorMessage?: string
}

export const useDelete = (
    endpoint: string,
    queryKey: string[],
    options?: UseDeleteOptions
) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`/api${endpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await response.json()

            if (!response.ok || data.statusCode >= 400) {
                throw new Error(data.message || `Failed to delete: ${response.statusText}`)
            }

            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey })
            if (options?.successMessage) {
                toast.success(options.successMessage)
            }
            options?.onSuccess?.(data)
        },
        onError: (error: Error) => {
            if (options?.errorMessage) {
                toast.error(options.errorMessage)
            } else {
                toast.error(error.message || "Failed to delete item")
            }
            options?.onError?.(error)
        }
    })
}