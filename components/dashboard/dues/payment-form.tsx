"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, DollarSign, CreditCard, Smartphone, Building, Wallet, Receipt } from "lucide-react"
import { usePost } from "@/hooks/usePost"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetAll } from "@/hooks/useGet"
import { Separator } from "@/components/ui/separator"

const paymentSchema = z.object({
    customerId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    sellId: z.string().optional().transform(val => val ? parseInt(val) : undefined),

    paymentMethod: z.string().min(1, "Payment method is required"),
    notes: z.string().max(500).optional(),

    transactionId: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    chequeNumber: z.string().optional(),
    mobileOperator: z.string().optional(),
})


// const paymentSchema = z.object({
//     customerId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
//     sellId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
//     amount: z.string()
//         .min(1, "Amount is required")
//         .transform((val) => parseFloat(val))
//         .refine((val) => val > 0, "Amount must be greater than 0"),
//     paymentMethod: z.string().min(1, "Payment method is required"),
//     notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
//     transactionId: z.string().optional(),
//     bankName: z.string().optional(),
//     accountNumber: z.string().optional(),
//     chequeNumber: z.string().optional(),
//     mobileOperator: z.string().optional(),
// })

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
    customerId?: number
    sellId?: number
    dueAmount?: number
    invoiceNumber?: string
    onSuccess?: () => void
    onCancel?: () => void
}

export function PaymentForm({ customerId, sellId, dueAmount, invoiceNumber, onSuccess, onCancel }: PaymentFormProps) {
    const queryClient = useQueryClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<string>(customerId?.toString() || "")
    const [selectedSale, setSelectedSale] = useState<string>(sellId?.toString() || "")
    const [bulkPayments, setBulkPayments] = useState<Array<{ invoiceNumber: string; amount: number }>>([])

    // Fetch customers
    const { data: customersData, isLoading: customersLoading } = useGetAll<any>(
        "/payments/dropdown/active",
        ["customersDropdown"]
    )
    const customers = customersData?.data || []

    // Fetch customer's due sales
    const { data: dueSalesData, isLoading: dueSalesLoading, refetch: refetchDueSales } = useGetAll<any>(
        selectedCustomer ? `/payments/dues/customer/${selectedCustomer}` : null,
        ["customerDueSales", selectedCustomer]
    )
    const dueSales = dueSalesData?.data?.dueSales || []

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        trigger,
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            customerId: customerId?.toString(),
            sellId: sellId?.toString(),
            // amount: dueAmount?.toString() || "0",
            paymentMethod: "CASH",
            notes: "",
            transactionId: "",
            bankName: "",
            accountNumber: "",
            chequeNumber: "",
            mobileOperator: "",
        }
    })

    const formValues = watch()

    // Set initial values
    useEffect(() => {
        if (customerId) {
            setValue("customerId", customerId.toString())
            setSelectedCustomer(customerId.toString())
        }
        if (sellId) {
            setValue("sellId", sellId.toString())
            setSelectedSale(sellId.toString())
        }
        if (dueAmount) {
            setValue("amount", dueAmount.toString())
        }
    }, [customerId, sellId, dueAmount, setValue])

    // Handle customer change
    const handleCustomerChange = (value: string) => {
        setSelectedCustomer(value)
        setValue("customerId", value)
        setSelectedSale("")
        setValue("sellId", "")
        setBulkPayments([]) // Clear bulk payments when customer changes
        refetchDueSales()
    }

    // Add bulk payment item with validation
    const addBulkPaymentItem = () => {
        // Check if there are existing payments
        if (bulkPayments.length > 0) {
            // Get the last payment in the array
            const lastPayment = bulkPayments[bulkPayments.length - 1];

            // Check if last payment has valid invoice and amount
            if (!lastPayment.invoiceNumber || lastPayment.amount <= 0) {
                toast.error("Please complete the current payment before adding a new one");
                return;
            }

            // Check if amount exceeds due amount for the last payment
            const selectedSale = lastPayment.invoiceNumber
                ? dueSales.find((sale: any) => sale.invoiceNumber === lastPayment.invoiceNumber)
                : null;

            if (selectedSale && lastPayment.amount > selectedSale.dueAmount) {
                toast.error("Amount exceeds due amount for the current payment");
                return;
            }
        }

        // Add new payment
        setBulkPayments([...bulkPayments, { invoiceNumber: "", amount: 0 }]);
    }

    const getDueAmountByInvoice = (invoiceNumber: string) => {
        const sale = dueSales.find((s: any) => s.invoiceNumber === invoiceNumber)
        return sale?.dueAmount ?? 0
    }

    // Update bulk payment item
    const updateBulkPaymentItem = (index: number, field: string, value: any) => {
        const updatedPayments = [...bulkPayments]
        updatedPayments[index] = { ...updatedPayments[index], [field]: value }
        setBulkPayments(updatedPayments)
    }

    // Remove bulk payment item
    const removeBulkPaymentItem = (index: number) => {
        const updatedPayments = bulkPayments.filter((_, i) => i !== index)
        setBulkPayments(updatedPayments)
    }

    const isLastPaymentComplete = () => {
        if (bulkPayments.length === 0) return true

        const lastPayment = bulkPayments[bulkPayments.length - 1]

        if (!lastPayment.invoiceNumber) return false
        if (!lastPayment.amount || lastPayment.amount <= 0) return false

        const maxDue = getDueAmountByInvoice(lastPayment.invoiceNumber)
        if (lastPayment.amount > maxDue) return false

        return true
    }


    // Calculate total bulk amount
    const totalBulkAmount = bulkPayments.reduce((sum, item) => sum + item.amount, 0)

    // Handle bulk payment submission
    const { mutate: createBulkPayment, isPending: isCreatingBulk } = usePost(
        `/payments/bulk`,
        (data: any) => {
            setIsSubmitting(false)
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                // toast.success("Bulk payments created successfully!")
                setBulkPayments([])
                queryClient.invalidateQueries({ queryKey: ["payments"] })
                queryClient.invalidateQueries({ queryKey: ["customerDueDetails"] })
                queryClient.invalidateQueries({ queryKey: ["allCustomerDues"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to create bulk payments")
            }
        },
        (error: any) => {
            setIsSubmitting(false)
            toast.error(error?.message || "Failed to create bulk payments")
        }
    )

    const onSubmit = async (data: PaymentFormData) => {

        console.log('Form data:', data)
        console.log('Bulk payments:', bulkPayments)

        const isValid = await trigger()
        if (!isValid) {
            toast.error("Please fix all errors before submitting")
            return
        }

        setIsSubmitting(true)

        // Validate bulk payments
        if (!selectedCustomer) {
            toast.error("Please select a customer")
            setIsSubmitting(false)
            return
        }

        if (bulkPayments.length === 0) {
            toast.error("Please add at least one payment")
            setIsSubmitting(false)
            return
        }

        // Validate each bulk payment
        for (let i = 0; i < bulkPayments.length; i++) {
            const payment = bulkPayments[i]
            if (!payment.invoiceNumber) {
                toast.error(`Please select an invoice for payment #${i + 1}`)
                setIsSubmitting(false)
                return
            }
            if (payment.amount <= 0) {
                toast.error(`Please enter a valid amount for payment #${i + 1}`)
                setIsSubmitting(false)
                return
            }
        }

        const bulkPaymentData = {
            customerId: parseInt(selectedCustomer),
            payments: bulkPayments,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            transactionId: data.transactionId || undefined,
            bankName: data.bankName || undefined,
            accountNumber: data.accountNumber || undefined,
            chequeNumber: data.chequeNumber || undefined,
            mobileOperator: data.mobileOperator || undefined,
        }

        createBulkPayment(bulkPaymentData)
    }

    const isLoading = isCreatingBulk || isSubmitting

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Bulk Payments</CardTitle>
                <CardDescription>
                    Record multiple payments for a customer
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        {/* Customer Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="bulkCustomer">Customer *</Label>
                            <Select
                                value={selectedCustomer}
                                onValueChange={handleCustomerChange}
                                disabled={isLoading || customersLoading || !!customerId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customersLoading ? (
                                        <SelectItem value="loading" disabled>
                                            Loading customers...
                                        </SelectItem>
                                    ) : customers.length === 0 ? (
                                        <SelectItem value="empty" disabled>
                                            No customers available
                                        </SelectItem>
                                    ) : (
                                        customers.map((customer: any) => (
                                            <SelectItem key={customer.customerID} value={customer.customerID.toString()}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{customer.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        {customer.phone}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.customerId && (
                                <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>
                            )}
                        </div>

                        {/* Customer Due Summary */}
                        {selectedCustomer && dueSales.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Customer Due Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Due</p>
                                            <p className="text-xl font-bold">
                                                ৳{dueSalesData?.data?.totalDue?.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Overdue Sales</p>
                                            <p className="text-xl font-bold">
                                                {dueSalesData?.data?.dueSales?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Bulk Payments List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Payments *</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={addBulkPaymentItem}
                                    disabled={
                                        !selectedCustomer ||
                                        isLoading ||
                                        !isLastPaymentComplete()
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Payment
                                </Button>

                            </div>

                            {bulkPayments.length === 0 ? (
                                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">No payments added yet</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {selectedCustomer
                                            ? 'Click "Add Payment" to add payments for this customer'
                                            : 'Select a customer first to add payments'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bulkPayments.map((payment, index) => (
                                        <div key={index} className="p-4 border rounded-lg space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Payment #{index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeBulkPaymentItem(index)}
                                                    className="h-8 w-8 p-0 text-destructive"
                                                    disabled={isLoading}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Invoice Number *</Label>
                                                    <Select
                                                        value={payment.invoiceNumber}
                                                        onValueChange={(value) => updateBulkPaymentItem(index, 'invoiceNumber', value)}
                                                        disabled={isLoading}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select invoice" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {dueSalesLoading ? (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading invoices...
                                                                </SelectItem>
                                                            ) : dueSales.length === 0 ? (
                                                                <SelectItem value="empty" disabled>
                                                                    No due invoices available
                                                                </SelectItem>
                                                            ) : (
                                                                dueSales.map((sale: any) => (
                                                                    <SelectItem key={sale.sellID} value={sale.invoiceNumber}>
                                                                        <div className="flex justify-between w-full">
                                                                            <span>{sale.invoiceNumber}</span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Due: ৳{sale.dueAmount.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Amount (৳) *</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min={0}
                                                        max={getDueAmountByInvoice(payment.invoiceNumber)}
                                                        value={payment.amount || ""}
                                                        onChange={(e) => {
                                                            const inputValue = parseFloat(e.target.value) || 0
                                                            const maxAmount = getDueAmountByInvoice(payment.invoiceNumber)

                                                            if (inputValue > maxAmount) {
                                                                updateBulkPaymentItem(index, 'amount', maxAmount)
                                                                toast.warning(`Amount cannot exceed due amount (৳${maxAmount.toLocaleString()})`)
                                                            } else {
                                                                updateBulkPaymentItem(index, 'amount', inputValue)
                                                            }
                                                        }}
                                                        placeholder="Enter amount"
                                                        disabled={isLoading || !payment.invoiceNumber}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Total Summary */}
                            {bulkPayments.length > 0 && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-emerald-700">Total Bulk Payment</p>
                                            <p className="text-2xl font-bold text-emerald-600">
                                                ৳{totalBulkAmount.toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-emerald-700">Number of Payments</p>
                                            <p className="text-lg font-semibold text-emerald-600">
                                                {bulkPayments.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Payment Method and Notes */}
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                                    <Select
                                        value={formValues.paymentMethod}
                                        onValueChange={(value) => setValue("paymentMethod", value)}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CASH">
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="h-4 w-4" />
                                                    <span>Cash</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="CARD">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span>Card</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="MOBILE_BANKING">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4" />
                                                    <span>Mobile Banking</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="BANK_TRANSFER">
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4" />
                                                    <span>Bank Transfer</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="OTHER">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>Other</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.paymentMethod && (
                                        <p className="text-sm text-red-500 mt-1">{errors.paymentMethod.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        {...register("notes")}
                                        placeholder="Enter payment notes..."
                                        rows={2}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Transaction Details based on Payment Method */}
                            {formValues.paymentMethod === 'BANK_TRANSFER' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Bank Name</Label>
                                        <Input
                                            id="bankName"
                                            {...register("bankName")}
                                            placeholder="Enter bank name"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accountNumber">Account Number</Label>
                                        <Input
                                            id="accountNumber"
                                            {...register("accountNumber")}
                                            placeholder="Enter account number"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            {formValues.paymentMethod === 'CARD' && (
                                <div className="space-y-2">
                                    <Label htmlFor="chequeNumber">Card/Cheque Number</Label>
                                    <Input
                                        id="chequeNumber"
                                        {...register("chequeNumber")}
                                        placeholder="Enter card/cheque number"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}

                            {formValues.paymentMethod === 'MOBILE_BANKING' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="mobileOperator">Mobile Operator</Label>
                                        <Input
                                            id="mobileOperator"
                                            {...register("mobileOperator")}
                                            placeholder="e.g., bKash, Nagad"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="transactionId">Transaction ID</Label>
                                        <Input
                                            id="transactionId"
                                            {...register("transactionId")}
                                            placeholder="Enter transaction ID"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            {formValues.paymentMethod === 'OTHER' && (
                                <div className="space-y-2">
                                    <Label htmlFor="transactionId">Reference/Transaction ID</Label>
                                    <Input
                                        id="transactionId"
                                        {...register("transactionId")}
                                        placeholder="Enter reference/transaction ID"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Submit Buttons */}
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
                                disabled={isLoading || bulkPayments.length === 0 || !selectedCustomer}
                                className={`${onCancel ? 'flex-1' : 'w-full'}`}
                            // onClick={() => console.log('Button clicked, isLoading:', isLoading)}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Create Bulk Payments"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}