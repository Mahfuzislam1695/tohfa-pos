"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Package, RefreshCw, ArrowLeftRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { usePost } from "@/hooks/usePost"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { ReturnType, ReturnReason, ReturnStatus } from "@/types/return.types"

interface ReturnModalProps {
    sale: any
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

const returnSchema = z.object({
    returnType: z.nativeEnum(ReturnType),
    returnReason: z.nativeEnum(ReturnReason),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    exchangeProductId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    exchangeQuantity: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    restockingFee: z.string().optional().transform(val => val ? parseFloat(val) : 0),
    description: z.string().optional(),
    items: z.array(z.object({
        sellItemId: z.number(),
        quantity: z.number().min(1),
        reason: z.nativeEnum(ReturnReason),
        condition: z.string().optional(),
        notes: z.string().optional(),
        refundAmount: z.number().optional(),
    })).min(1, "At least one item must be selected for return"),
})

type ReturnFormData = z.infer<typeof returnSchema>

export function ReturnModal({ sale, isOpen, onClose, onSuccess }: ReturnModalProps) {
    const [selectedItems, setSelectedItems] = useState<Map<number, { quantity: number; reason: ReturnReason; condition?: string; notes?: string }>>(new Map())
    const [exchangeProducts, setExchangeProducts] = useState<any[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const queryClient = useQueryClient()



    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ReturnFormData>({
        resolver: zodResolver(returnSchema),
        defaultValues: {
            returnType: ReturnType.PARTIAL_RETURN,
            returnReason: ReturnReason.OTHER,
            restockingFee: "0",
            items: [],
        }
    })

    // Build query parameters for pagination and search


    const returnType = watch("returnType")
    const exchangeProductId = watch("exchangeProductId")

    // Fetch exchange products when exchange is selected
    useEffect(() => {
        if (returnType === ReturnType.EXCHANGE && isOpen) {
            fetchExchangeProducts()
        }
    }, [returnType, isOpen])

    // Add this useEffect after your other useEffect
    useEffect(() => {
        const itemsData = Array.from(selectedItems.entries()).map(([sellItemId, itemData]) => ({
            sellItemId,
            quantity: itemData.quantity,
            reason: itemData.reason,
            condition: itemData.condition,
            notes: itemData.notes,
            refundAmount: itemData.quantity * (sale.sellItems.find((item: any) => item.sellItemID === sellItemId)?.unitPrice || 0),
        }))

        setValue("items", itemsData)
    }, [selectedItems, sale.sellItems, setValue])

    const fetchExchangeProducts = async () => {
        setIsLoadingProducts(true)
        try {
            const response = await fetch('/api/products?isActive=true&limit=100')
            const data = await response.json()
            if (data.success) {
                setExchangeProducts(data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
        } finally {
            setIsLoadingProducts(false)
        }
    }

    const { mutate: createReturn, isPending: isSubmitting } = usePost(
        "/returns",
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                queryClient.invalidateQueries({ queryKey: ["sales"] })
                queryClient.invalidateQueries({ queryKey: ["returns"] })
                onClose()
                reset()
                setSelectedItems(new Map())
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to create return")
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to create return")
        }
    )

    const handleItemSelect = (sellItemId: number, maxQuantity: number) => {
        const item = sale.sellItems.find((item: any) => item.sellItemID === sellItemId)
        if (!item) return

        if (selectedItems.has(sellItemId)) {
            const newItems = new Map(selectedItems)
            newItems.delete(sellItemId)
            setSelectedItems(newItems)
        } else {
            const newItems = new Map(selectedItems)
            newItems.set(sellItemId, {
                quantity: maxQuantity,
                reason: ReturnReason.OTHER,
                condition: "used",
                notes: ""
            })
            setSelectedItems(newItems)
        }
    }

    const handleQuantityChange = (sellItemId: number, quantity: number) => {
        const item = sale.sellItems.find((item: any) => item.sellItemID === sellItemId)
        if (!item) return

        const maxQuantity = item.quantity - (item.returnedQuantity || 0)
        const newQuantity = Math.min(Math.max(1, quantity), maxQuantity)

        const newItems = new Map(selectedItems)
        const itemData = newItems.get(sellItemId)
        if (itemData) {
            newItems.set(sellItemId, { ...itemData, quantity: newQuantity })
            setSelectedItems(newItems)
        }
    }

    const handleReasonChange = (sellItemId: number, reason: ReturnReason) => {
        const newItems = new Map(selectedItems)
        const itemData = newItems.get(sellItemId)
        if (itemData) {
            newItems.set(sellItemId, { ...itemData, reason })
            setSelectedItems(newItems)
        }
    }

    const handleConditionChange = (sellItemId: number, condition: string) => {
        const newItems = new Map(selectedItems)
        const itemData = newItems.get(sellItemId)
        if (itemData) {
            newItems.set(sellItemId, { ...itemData, condition })
            setSelectedItems(newItems)
        }
    }

    const onSubmit = (data: ReturnFormData) => {
        // Prepare items data
        const itemsData = Array.from(selectedItems.entries()).map(([sellItemId, itemData]) => ({
            sellItemId,
            quantity: itemData.quantity,
            reason: itemData.reason,
            condition: itemData.condition,
            notes: itemData.notes,
        }))

        const payload = {
            sellId: sale.sellID,
            returnType: data.returnType,
            returnReason: data.returnReason,
            items: itemsData,
            customerName: data.customerName || sale.customerName,
            customerPhone: data.customerPhone || sale.customerPhone,
            exchangeProductId: data.exchangeProductId,
            exchangeQuantity: data.exchangeQuantity,
            restockingFee: parseFloat(data.restockingFee || "0"),
            description: data.description,
            autoRestock: false,
        }

        createReturn(payload)
    }

    const calculateTotalRefund = () => {
        let total = 0
        selectedItems.forEach((itemData, sellItemId) => {
            const saleItem = sale.sellItems.find((item: any) => item.sellItemID === sellItemId)
            if (saleItem) {
                total += saleItem.unitPrice * itemData.quantity
            }
        })
        return total
    }

    const totalRefund = calculateTotalRefund()
    const selectedExchangeProduct = exchangeProducts.find(p => p.productID === exchangeProductId)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[80vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Create Return/Exchange
                    </DialogTitle>
                    <DialogDescription>
                        Create a return or exchange for sale: {sale.invoiceNumber}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Sale Information */}
                    <div className="rounded-lg border p-4">
                        <h3 className="font-semibold mb-2">Sale Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Invoice:</span>
                                <p className="font-medium">{sale.invoiceNumber}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Customer:</span>
                                <p className="font-medium">{sale.customerName || "Walk-in Customer"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Sale Date:</span>
                                <p className="font-medium">{new Date(sale.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total Amount:</span>
                                <p className="font-medium">৳{sale.total.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Return Type Selection */}
                    <div className="space-y-3 hidden">
                        <Label>Return Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(ReturnType).map((type) => (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={returnType === type ? "default" : "outline"}
                                    onClick={() => setValue("returnType", type)}
                                    className="justify-start"
                                >
                                    {type === ReturnType.FULL_RETURN && <Package className="h-4 w-4 mr-2" />}
                                    {type === ReturnType.PARTIAL_RETURN && <RefreshCw className="h-4 w-4 mr-2" />}
                                    {type === ReturnType.EXCHANGE && <ArrowLeftRight className="h-4 w-4 mr-2" />}
                                    {type.replace('_', ' ')}
                                </Button>
                            ))}
                        </div>
                        {errors.returnType && (
                            <p className="text-sm text-destructive">{errors.returnType.message}</p>
                        )}
                    </div>

                    {/* Return Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="returnReason">Return Reason</Label>
                        <Select
                            value={watch("returnReason")}
                            onValueChange={(value) => setValue("returnReason", value as ReturnReason)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(ReturnReason).map((reason) => (
                                    <SelectItem key={reason} value={reason}>
                                        {reason.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.returnReason && (
                            <p className="text-sm text-destructive">{errors.returnReason.message}</p>
                        )}
                    </div>

                    {/* Selected Items Table */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Select Items to Return</Label>
                            <Badge variant="secondary">
                                {selectedItems.size} items selected
                            </Badge>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedItems.size === sale.sellItems.length}
                                                onCheckedChange={() => {
                                                    if (selectedItems.size === sale.sellItems.length) {
                                                        setSelectedItems(new Map())
                                                    } else {
                                                        const newItems = new Map()
                                                        sale.sellItems.forEach((item: any) => {
                                                            const maxQuantity = item.quantity - (item.returnedQuantity || 0)
                                                            if (maxQuantity > 0) {
                                                                newItems.set(item.sellItemID, {
                                                                    quantity: maxQuantity,
                                                                    reason: ReturnReason.OTHER,
                                                                    condition: "used",
                                                                    notes: ""
                                                                })
                                                            }
                                                        })
                                                        setSelectedItems(newItems)
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Purchased</TableHead>
                                        <TableHead>Already Returned</TableHead>
                                        <TableHead>Available</TableHead>
                                        <TableHead>Return Qty</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Condition</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.sellItems.map((item: any) => {
                                        const returnedQuantity = item.returnedQuantity || 0
                                        const availableForReturn = item.quantity - returnedQuantity
                                        const isSelected = selectedItems.has(item.sellItemID)
                                        const selectedData = selectedItems.get(item.sellItemID)

                                        return (
                                            <TableRow key={item.sellItemID}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleItemSelect(item.sellItemID, availableForReturn)}
                                                        disabled={availableForReturn <= 0}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.productName}</div>
                                                    <div className="text-xs text-muted-foreground">SKU: {item.productSku}</div>
                                                </TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {returnedQuantity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={availableForReturn > 0 ? "default" : "destructive"}>
                                                        {availableForReturn}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {isSelected && availableForReturn > 0 && (
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={availableForReturn}
                                                            value={selectedData?.quantity}
                                                            onChange={(e) => handleQuantityChange(item.sellItemID, parseInt(e.target.value))}
                                                            className="w-20"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isSelected && (
                                                        <Select
                                                            value={selectedData?.reason}
                                                            onValueChange={(value) => handleReasonChange(item.sellItemID, value as ReturnReason)}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.values(ReturnReason).map((reason) => (
                                                                    <SelectItem key={reason} value={reason}>
                                                                        {reason.split('_')[0]}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isSelected && (
                                                        <Select
                                                            value={selectedData?.condition || "used"}
                                                            onValueChange={(value) => handleConditionChange(item.sellItemID, value)}
                                                        >
                                                            <SelectTrigger className="w-28">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="new">New</SelectItem>
                                                                <SelectItem value="used">Used</SelectItem>
                                                                <SelectItem value="damaged">Damaged</SelectItem>
                                                                <SelectItem value="defective">Defective</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                                <TableCell>৳{item.unitPrice.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    {isSelected ? (
                                                        <div className="font-bold text-emerald-600">
                                                            ৳{(item.unitPrice * (selectedData?.quantity || 0)).toFixed(2)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground">৳0.00</div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {selectedItems.size === 0 && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Please select at least one item to return
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Exchange Section */}
                    {returnType === ReturnType.EXCHANGE && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="font-semibold">Exchange Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="exchangeProductId">Exchange Product</Label>
                                    <Select
                                        value={exchangeProductId?.toString()}
                                        onValueChange={(value) => setValue("exchangeProductId", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product to exchange for" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingProducts ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading products...
                                                </SelectItem>
                                            ) : (
                                                exchangeProducts.map((product) => (
                                                    <SelectItem key={product.productID} value={product.productID.toString()}>
                                                        {product.name} (SKU: {product.sku}) - Stock: {product.stockQuantity}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="exchangeQuantity">Exchange Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        {...register("exchangeQuantity")}
                                        disabled={!exchangeProductId}
                                    />
                                </div>
                            </div>

                            {selectedExchangeProduct && (
                                <div className="rounded-lg bg-muted p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{selectedExchangeProduct.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                SKU: {selectedExchangeProduct.sku} |
                                                Price: ৳{selectedExchangeProduct.sellingPrice.toFixed(2)} |
                                                Stock: {selectedExchangeProduct.stockQuantity}
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            Available
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="restockingFee">Restocking Fee (৳)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...register("restockingFee")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name (if different)</Label>
                                <Input
                                    {...register("customerName")}
                                    placeholder={sale.customerName || "Walk-in Customer"}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customerPhone">Customer Phone (if different)</Label>
                            <Input
                                {...register("customerPhone")}
                                placeholder={sale.customerPhone || "N/A"}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Additional Notes</Label>
                            <Textarea
                                {...register("description")}
                                placeholder="Any additional information about this return..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg border p-4 space-y-3">
                        <h3 className="font-semibold">Return Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Refundable Amount:</span>
                                <span className="font-bold">৳{totalRefund.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Restocking Fee:</span>
                                <span className="text-destructive">-৳{parseFloat(watch("restockingFee") || "0").toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold">Net Refund Amount:</span>
                                <span className="font-bold text-lg">
                                    ৳{(totalRefund - parseFloat(watch("restockingFee") || "0")).toFixed(2)}
                                </span>
                            </div>
                            {returnType === ReturnType.EXCHANGE && exchangeProductId && (
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-muted-foreground">Exchange Product:</span>
                                    <span className="font-medium">
                                        {selectedExchangeProduct?.name || "Selected product"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {errors.items && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {errors.items.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={selectedItems.size === 0 || isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Creating Return...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Create Return
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}