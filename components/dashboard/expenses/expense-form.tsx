"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, X, Upload } from "lucide-react"
import { usePost } from "@/hooks/usePost"
import { usePatch } from "@/hooks/usePatch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { ExpenseCategory, ExpensePaymentMethod, ExpenseFormData } from "@/types/expense"

interface ExpenseFormProps {
    editItem?: any
    onSuccess?: () => void
    onCancel?: () => void
}

const expenseSchema = z.object({
    date: z.string().min(1, "Date is required"),
    amount: z.string()
        .min(1, "Amount is required")
        .transform((val) => parseFloat(val))
        .refine((val) => val > 0, "Amount must be greater than 0"),
    category: z.nativeEnum(ExpenseCategory, {
        errorMap: () => ({ message: "Category is required" })
    }),
    paymentMethod: z.nativeEnum(ExpensePaymentMethod, {
        errorMap: () => ({ message: "Payment method is required" })
    }),
    referenceNumber: z.string().optional(),
    description: z.string().optional(),
    receiptUrl: z.string().optional(),
    fileName: z.string().optional(),
})

export function ExpenseForm({ editItem, onSuccess, onCancel }: ExpenseFormProps) {
    const queryClient = useQueryClient()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        trigger,
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: "",
            category: "",
            paymentMethod: "",
            referenceNumber: "",
            description: "",
            receiptUrl: "",
            fileName: "",
        }
    })

    const formValues = watch()

    // Handle file upload
    const handleFileUpload = async (file: File) => {
        setIsUploading(true)
        setUploadProgress(0)

        try {
            // Simulate file upload - replace with actual upload logic
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100))
                setUploadProgress(i)
            }

            // Set the uploaded file URL and name
            setValue("receiptUrl", `https://storage.example.com/receipts/${file.name}`)
            setValue("fileName", file.name)

            toast.success("File uploaded successfully!")
        } catch (error) {
            toast.error("Failed to upload file")
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const { mutate: createExpense, isPending: isCreating } = usePost(
        "/expenses",
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                // toast.success("Expense created successfully!")
                reset()
                queryClient.invalidateQueries({ queryKey: ["expenses"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to save expense")
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to save expense")
        }
    )

    const { mutate: updateExpense, isPending: isUpdating } = usePatch(
        `/expenses/${editItem?.expenseID}`,
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                // toast.success("Expense updated successfully!")
                reset()
                queryClient.invalidateQueries({ queryKey: ["expenses"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to update expense")
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to update expense")
        }
    )

    useEffect(() => {
        if (editItem) {
            setValue("date", editItem.date.split('T')[0])
            setValue("amount", editItem.amount.toString())
            setValue("category", editItem.category)
            setValue("paymentMethod", editItem.paymentMethod)
            setValue("referenceNumber", editItem.referenceNumber || "")
            setValue("description", editItem.description || "")
            setValue("receiptUrl", editItem.receiptUrl || "")
            setValue("fileName", editItem.fileName || "")
        }
    }, [editItem, setValue])

    const onSubmit = async (data: ExpenseFormData) => {
        // Validate all fields
        const isValid = await trigger()
        if (!isValid) {
            toast.error("Please fix all errors before submitting")
            return
        }

        // Prepare data for submission
        const dataToSubmit = {
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            amount: data.amount,
            category: data.category,
            paymentMethod: data.paymentMethod,
            referenceNumber: data.referenceNumber || undefined,
            description: data.description || undefined,
            receiptUrl: data.receiptUrl || undefined,
            fileName: data.fileName || undefined,
        }

        if (editItem?.expenseID) {
            updateExpense(dataToSubmit)
        } else {
            createExpense(dataToSubmit)
        }
    }

    const isLoading = isCreating || isUpdating || isUploading

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editItem ? "Edit Expense" : "Add New Expense"}</CardTitle>
                <CardDescription>
                    {editItem ? "Update the expense information" : "Fill in the expense details"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                {...register("date")}
                                disabled={isLoading}
                                className={errors.date ? "border-red-500" : ""}
                            />
                            {errors.date && (
                                <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (৳) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                {...register("amount")}
                                placeholder="0.00"
                                disabled={isLoading}
                                className={errors.amount ? "border-red-500" : ""}
                            />
                            {errors.amount && (
                                <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formValues.category}
                                onValueChange={(value) => setValue("category", value as ExpenseCategory)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(ExpenseCategory).map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method *</Label>
                            <Select
                                value={formValues.paymentMethod}
                                onValueChange={(value) => setValue("paymentMethod", value as ExpensePaymentMethod)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(ExpensePaymentMethod).map((method) => (
                                        <SelectItem key={method} value={method}>
                                            {method.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.paymentMethod && (
                                <p className="text-sm text-red-500 mt-1">{errors.paymentMethod.message}</p>
                            )}
                        </div>

                        {/* Reference Number */}
                        <div className="space-y-2">
                            <Label htmlFor="referenceNumber">Reference Number</Label>
                            <Input
                                id="referenceNumber"
                                {...register("referenceNumber")}
                                placeholder="e.g., Invoice #12345"
                                disabled={isLoading}
                            />
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="receipt">Receipt Upload</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                {formValues.fileName ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm truncate">{formValues.fileName}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setValue("receiptUrl", "")
                                                setValue("fileName", "")
                                            }}
                                            disabled={isUploading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Input
                                            id="receipt"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleFileUpload(file)
                                            }}
                                            disabled={isUploading}
                                        />
                                        <Label htmlFor="receipt" className="cursor-pointer">
                                            <div className="flex flex-col items-center justify-center">
                                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">Click to upload receipt</p>
                                                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                                            </div>
                                        </Label>
                                    </>
                                )}

                                {isUploading && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Enter expense details..."
                                rows={3}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                {formValues.description?.length || 0}/1000 characters
                            </p>
                        </div>
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
                                        "Update Expense"
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Expense
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