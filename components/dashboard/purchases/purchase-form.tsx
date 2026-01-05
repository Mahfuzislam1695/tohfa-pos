"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Package } from "lucide-react"
import { usePost } from "@/hooks/usePost"
import { usePatch } from "@/hooks/usePatch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { formatDate } from "@/lib/units"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetAll } from "@/hooks/useGet"


interface PurchaseFormProps {
    productId?: number // Optional for editing existing batch
    editItem?: any
    onSuccess?: () => void
    onCancel?: () => void
}

const purchaseSchema = z.object({
    productID: z.string()
        .min(1, "Product is required")
        .transform((val) => parseInt(val))
        .refine((val) => val > 0, "Please select a product"),
    quantity: z.string()
        .min(1, "Quantity is required")
        .transform((val) => parseInt(val))
        .refine((val) => val > 0, "Quantity must be greater than 0"),
    unitCost: z.string()
        .min(1, "Unit cost is required")
        .transform((val) => parseFloat(val))
        .refine((val) => val > 0, "Unit cost must be greater than 0"),
    expiryDate: z.string().optional(),
    notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
    reason: z.string().max(500, "Reason must be less than 500 characters").optional(),
})

type PurchaseFormData = z.infer<typeof purchaseSchema>

export function PurchaseForm({ productId, editItem, onSuccess, onCancel }: PurchaseFormProps) {
    const queryClient = useQueryClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [date, setDate] = useState<Date>()

    // Fetch products for dropdown
    // const { products, isLoading: productsLoading } = useProducts()

    // const { data: products, isLoading: productsLoading } = useGetAll<any>(
    //     `/products/dropdown/active`,
    //     ["productsDropdown"]
    // )

    const { data, isLoading: productsLoading, refetch } = useGetAll<any>(
        `/products/dropdown/active`,
        ["productsDropdown"]
    )

    const products = data?.data || []

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        trigger,
    } = useForm<PurchaseFormData>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            productID: productId ? productId.toString() : "",
            quantity: "0",
            unitCost: "0",
            expiryDate: "",
            notes: "",
            reason: "",
        }
    })

    const formValues = watch()

    // Set date value when date changes
    useEffect(() => {
        if (date) {
            setValue("expiryDate", formatDate(date))
        } else {
            setValue("expiryDate", "")
        }
    }, [date, setValue])

    // Calculate batch value
    const batchValue = parseFloat(formValues.unitCost || "0") * parseInt(formValues.quantity || "0")

    // Handle form submission
    const { mutate: createPurchase, isPending: isCreating } = usePost(
        // Always use the specific product endpoint for creating batches
        `/products/${formValues.productID}/inventory/batch`,
        (data: any) => {
            setIsSubmitting(false)

            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                // toast.success("Purchase batch created successfully!")
                reset()
                queryClient.invalidateQueries({ queryKey: ["purchases"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to save purchase batch")
            }
        },
        (error: any) => {
            setIsSubmitting(false)
            console.error("Create purchase error:", error)
            toast.error(error?.message || "Failed to save purchase batch")
        }
    )

    const { mutate: updatePurchase, isPending: isUpdating } = usePatch(
        editItem ? `/inventory/batches/${editItem.batchID}` : "",
        (data: any) => {
            setIsSubmitting(false)

            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                // toast.success("Purchase batch updated successfully!")
                reset()
                queryClient.invalidateQueries({ queryKey: ["purchases"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to update purchase batch")
            }
        },
        (error: any) => {
            setIsSubmitting(false)
            toast.error(error?.message || "Failed to update purchase batch")
        }
    )

    // Initialize form with edit data
    useEffect(() => {
        if (editItem) {
            setValue("productID", editItem.productID?.toString() || editItem.product?.productID?.toString() || "")
            setValue("quantity", editItem.quantity.toString())
            setValue("unitCost", editItem.unitCost.toString())
            setValue("notes", editItem.notes || "")
            setValue("reason", editItem.reason || "")

            if (editItem.expiryDate) {
                const expiryDate = new Date(editItem.expiryDate)
                setDate(expiryDate)
                setValue("expiryDate", formatDate(expiryDate))
            }
        } else {
            reset({
                productID: productId ? productId.toString() : "",
                quantity: "0",
                unitCost: "0",
                expiryDate: "",
                notes: "",
                reason: "",
            })
            setDate(undefined)
        }
    }, [editItem, productId, setValue, reset])

    const onSubmit = async (data: PurchaseFormData) => {

        // Validate all fields before submission
        const isValid = await trigger()
        if (!isValid) {
            toast.error("Please fix all errors before submitting")
            return
        }

        setIsSubmitting(true)

        const dataToSubmit = {
            quantity: data.quantity,
            unitCost: data.unitCost,
            expiryDate: data.expiryDate || undefined,
            notes: data.notes || undefined,
            reason: data.reason || undefined,
        }

        if (editItem?.batchID) {
            // For updates, we use the inventory/batches endpoint
            const updateData = {
                ...dataToSubmit,
                productID: data.productID
            }
            updatePurchase(updateData)
        } else {
            // For creates, we use the product-specific endpoint
            createPurchase(dataToSubmit)
        }
    }

    // Get selected product info
    const selectedProduct = products.find(p => p.productID.toString() === formValues.productID)

    const isLoading = isCreating || isUpdating || isSubmitting || productsLoading

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editItem ? "Edit Purchase Batch" : "Add New Purchase Batch"}</CardTitle>
                <CardDescription>
                    {editItem
                        ? "Update the purchase batch information below"
                        : productId
                            ? `Add inventory batch for product #${productId}`
                            : "Fill in the purchase batch details below"
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {productId && !editItem && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div>
                                    <h3 className="font-medium text-blue-900">Adding batch for product</h3>
                                    <p className="text-sm text-blue-700">Product ID: {productId}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Product Selection - Only show if not editing or not provided with productId */}
                        {(!productId || editItem) && (
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="productID">Product *</Label>
                                <Select
                                    value={formValues.productID}
                                    onValueChange={(value) => setValue("productID", value)}
                                    disabled={isLoading || productsLoading || (productId && !editItem)}
                                >
                                    <SelectTrigger className={errors.productID ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productsLoading ? (
                                            <SelectItem value="loading" disabled>
                                                Loading products...
                                            </SelectItem>
                                        ) : products.length === 0 ? (
                                            <SelectItem value="empty" disabled>
                                                No products available
                                            </SelectItem>
                                        ) : (
                                            products.map((product) => (
                                                <SelectItem key={product.productID} value={product.productID.toString()}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{product.name}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            SKU: {product.sku}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.productID && (
                                    <p className="text-sm text-red-500 mt-1">{errors.productID.message}</p>
                                )}
                            </div>
                        )}

                        {/* Show product info if selected */}
                        {selectedProduct && (
                            <div className="md:col-span-2 p-4 bg-gray-50 border rounded-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Product</p>
                                        <p className="font-medium">{selectedProduct.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">SKU</p>
                                        <p className="font-medium">{selectedProduct.sku}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Stock</p>
                                        <p className="font-medium">{selectedProduct.stockQuantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Selling Price</p>
                                        <p className="font-medium">{selectedProduct.sellingPrice
                                        } TK</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="1"
                                {...register("quantity")}
                                placeholder="100"
                                disabled={isLoading}
                                className={errors.quantity ? "border-red-500" : ""}
                            />
                            {errors.quantity && (
                                <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
                            )}
                        </div>

                        {/* Unit Cost */}
                        <div className="space-y-2">
                            <Label htmlFor="unitCost">Unit Cost (৳) *</Label>
                            <Input
                                id="unitCost"
                                type="number"
                                step="0.01"
                                {...register("unitCost")}
                                placeholder="15.50"
                                disabled={isLoading}
                                className={errors.unitCost ? "border-red-500" : ""}
                            />
                            {errors.unitCost && (
                                <p className="text-sm text-red-500 mt-1">{errors.unitCost.message}</p>
                            )}
                        </div>

                        {/* Expiry Date */}
                        {/* <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                        disabled={isLoading}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? formatDate(date) : "Select expiry date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {date && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setDate(undefined)
                                        setValue("expiryDate", "")
                                    }}
                                    className="h-6 px-2 text-xs"
                                    disabled={isLoading}
                                >
                                    Clear date
                                </Button>
                            )}
                        </div> */}

                        {/* Batch Value (Read-only) */}
                        <div className="space-y-2">
                            <Label htmlFor="batchValue">Batch Value</Label>
                            <div className="p-2 bg-gray-50 border rounded-md">
                                <div className="text-xl font-bold text-emerald-600">
                                    ৳{batchValue.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Calculated automatically
                                </p>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Input
                                id="reason"
                                {...register("reason")}
                                placeholder="Initial stock, Restock, etc."
                                disabled={isLoading}
                                className={errors.reason ? "border-red-500" : ""}
                            />
                            {errors.reason && (
                                <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {formValues.reason?.length || 0}/500 characters
                            </p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            {...register("notes")}
                            placeholder="Enter any notes about this batch..."
                            rows={3}
                            disabled={isLoading}
                            className={errors.notes ? "border-red-500" : ""}
                        />
                        {errors.notes && (
                            <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {formValues.notes?.length || 0}/1000 characters
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        {onCancel && (
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
                            className={`${onCancel ? 'flex-1' : 'w-full'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isSubmitting ? "Processing..." : "Saving..."}
                                </>
                            ) : (
                                <>
                                    {editItem ? (
                                        "Update Batch"
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Purchase Batch
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