"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react"
import { usePost } from "@/hooks/usePost"
import { usePatch } from "@/hooks/usePatch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"

interface CategoryFormProps {
    editItem?: any
    onSuccess?: () => void
    onCancel?: () => void
}

const categorySchema = z.object({
    name: z.string()
        .min(1, "Category name is required")
        .max(100, "Category name must be less than 100 characters"),
    description: z.string()
        .max(500, "Description must be less than 500 characters")
        .optional()
        .or(z.literal('')),
})

type CategoryFormData = z.infer<typeof categorySchema>

export function CategoryForm({ editItem, onSuccess, onCancel }: CategoryFormProps) {
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
        }
    })

    const formValues = watch()

    const { mutate: createCategory, isPending: isCreating } = usePost(
        "/categories",
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                toast.success("Category created successfully!")
                reset()
                // Invalidate category queries to refresh data
                queryClient.invalidateQueries({ queryKey: ["categories"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to save category")
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to save category")
        }
    )

    const { mutate: updateCategory, isPending: isUpdating } = usePatch(
        `/categories/${editItem?.categoryID}`,
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                toast.success("Category updated successfully!")
                reset()
                // Invalidate category queries to refresh data
                queryClient.invalidateQueries({ queryKey: ["categories"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to update category")
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to update category")
        }
    )

    useEffect(() => {
        if (editItem) {
            setValue("name", editItem.name || "")
            setValue("description", editItem.description || "")
        } else {
            reset({
                name: "",
                description: "",
            })
        }
    }, [editItem, setValue, reset])

    const onSubmit = (data: CategoryFormData) => {
        const dataToSubmit = {
            name: data.name,
            description: data.description,
        }

        if (editItem?.categoryID) {
            updateCategory(dataToSubmit)
        } else {
            createCategory(dataToSubmit)
        }
    }

    const isLoading = isCreating || isUpdating

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editItem ? "Edit Category" : "Add New Category"}</CardTitle>
                <CardDescription>
                    {editItem ? "Update the category information below" : "Fill in the category details below"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="Enter category name"
                            disabled={isLoading}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Enter category description"
                            rows={3}
                            disabled={isLoading}
                            className={errors.description ? "border-red-500" : ""}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {formValues.description?.length || 0}/500 characters
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        {editItem && onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`${editItem && onCancel ? 'flex-1' : 'w-full'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {editItem ? (
                                        "Update Category"
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Category
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}