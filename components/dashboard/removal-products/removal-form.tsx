"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, AlertTriangle, Calculator } from "lucide-react";
import { usePost } from "@/hooks/usePost";
import { usePatch } from "@/hooks/usePatch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useProductsDropdown } from "@/hooks/use-products-dropdown";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RemovalReason } from "@/types/removal";
import { Badge } from "@/components/ui/badge";

interface RemovalFormProps {
    editItem?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const removalSchema = z.object({
    productID: z.string().min(1, "Product is required").transform(Number),
    reason: z.nativeEnum(RemovalReason, {
        errorMap: () => ({ message: "Reason is required" }),
    }),
    quantity: z
        .string()
        .min(1, "Quantity is required")
        .transform(Number)
        .refine((val) => val > 0, "Quantity must be greater than 0"),
    batchId: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
    // expiryDate: z.string().optional(),
    damageDescription: z.string().max(500, "Description must be less than 500 characters").optional(),
    estimatedLoss: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => val === undefined || val >= 0, "Loss must be positive"),
    notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

type RemovalFormData = z.infer<typeof removalSchema>;

export function RemovalForm({ editItem, onSuccess, onCancel }: RemovalFormProps) {
    const queryClient = useQueryClient();
    const { products, isLoading: productsLoading } = useProductsDropdown();
    console.log("product", products);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showLossCalculator, setShowLossCalculator] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        trigger,
    } = useForm<RemovalFormData>({
        resolver: zodResolver(removalSchema),
        defaultValues: {
            productID: "",
            reason: RemovalReason.OTHER,
            quantity: "",
            batchId: "",
            // expiryDate: "",
            damageDescription: "",
            estimatedLoss: "",
            notes: "",
        },
    });

    const formValues = watch();
    const selectedProductObj = products.find(
        (p) => p.productID.toString() === formValues.productID
    );

    // Calculate estimated loss
    const calculateEstimatedLoss = () => {
        if (selectedProductObj && formValues.quantity) {
            const quantity = Number(formValues.quantity);
            const sellingPrice = Number(selectedProductObj.sellingPrice);
            const estimatedLoss = quantity * sellingPrice * 0.8; // 80% of selling price as estimate
            setValue("estimatedLoss", estimatedLoss.toFixed(2));
            toast.info("Estimated loss calculated based on selling price");
        }
    };

    // Auto-fill expiry date for expired items
    // useEffect(() => {
    //     if (formValues.reason === RemovalReason.EXPIRED) {
    //         setValue("expiryDate", new Date().toISOString().split("T")[0]);
    //     }
    // }, [formValues.reason, setValue]);

    const { mutate: createRemoval, isPending: isCreating } = usePost(
        "/removals",
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                toast.success("Product removed successfully!");
                reset();
                queryClient.invalidateQueries({ queryKey: ["removals"] });
                queryClient.invalidateQueries({ queryKey: ["products"] }); // Refresh product stock
                onSuccess?.();
            } else {
                toast.error(data?.message || "Failed to remove product");
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to remove product");
        }
    );

    const { mutate: updateRemoval, isPending: isUpdating } = usePatch(
        `/removals/${editItem?.removalID}`,
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                toast.success("Removal record updated successfully!");
                reset();
                queryClient.invalidateQueries({ queryKey: ["removals"] });
                queryClient.invalidateQueries({ queryKey: ["products"] });
                onSuccess?.();
            } else {
                toast.error(data?.message || "Failed to update removal record");
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to update removal record");
        }
    );

    useEffect(() => {
        if (editItem) {
            setValue("productID", editItem.productID.toString());
            setValue("reason", editItem.reason);
            setValue("quantity", editItem.quantity.toString());
            setValue("batchId", editItem.batchId?.toString() || "");
            // setValue(
            //     "expiryDate",
            //     editItem.expiryDate
            //         ? new Date(editItem.expiryDate).toISOString().split("T")[0]
            //         : ""
            // );
            setValue("damageDescription", editItem.damageDescription || "");
            setValue("estimatedLoss", editItem.estimatedLoss?.toString() || "");
            setValue("notes", editItem.notes || "");
        } else {
            reset({
                productID: "",
                reason: RemovalReason.OTHER,
                quantity: "",
                batchId: "",
                // expiryDate: "",
                damageDescription: "",
                estimatedLoss: "",
                notes: "",
            });
        }
    }, [editItem, setValue, reset]);

    const onSubmit = async (data: RemovalFormData) => {
        const isValid = await trigger();
        if (!isValid) {
            toast.error("Please fix all errors before submitting");
            return;
        }

        const dataToSubmit = {
            productID: data.productID,
            reason: data.reason,
            quantity: data.quantity,
            batchId: data.batchId,
            // expiryDate: data.expiryDate,
            damageDescription: data.damageDescription,
            estimatedLoss: data.estimatedLoss,
            notes: data.notes,
        };

        if (editItem?.removalID) {
            updateRemoval(dataToSubmit);
        } else {
            createRemoval(dataToSubmit);
        }
    };

    const isLoading = isCreating || isUpdating || productsLoading;

    // Reason options with descriptions
    const reasonOptions = [
        { value: RemovalReason.EXPIRED, label: "Expired", description: "Product past expiry date" },
        { value: RemovalReason.DAMAGED, label: "Damaged", description: "Physically damaged product" },
        { value: RemovalReason.BROKEN, label: "Broken", description: "Product is broken/non-functional" },
        { value: RemovalReason.DEFECTIVE, label: "Defective", description: "Manufacturing defect" },
        { value: RemovalReason.STOLEN, label: "Stolen", description: "Product stolen from inventory" },
        { value: RemovalReason.LOST, label: "Lost", description: "Product lost/misplaced" },
        { value: RemovalReason.SAMPLE, label: "Sample", description: "Used as product sample" },
        { value: RemovalReason.QUALITY_ISSUE, label: "Quality Issue", description: "Doesn't meet quality standards" },
        { value: RemovalReason.RECALL, label: "Recall", description: "Manufacturer recall" },
        { value: RemovalReason.WASTE, label: "Waste", description: "Disposed as waste" },
        { value: RemovalReason.DONATION, label: "Donation", description: "Donated to charity" },
        { value: RemovalReason.EMPLOYEE_USE, label: "Employee Use", description: "Used by employees" },
        { value: RemovalReason.TESTING, label: "Testing", description: "Used for testing purposes" },
        { value: RemovalReason.DEMONSTRATION, label: "Demonstration", description: "Used for demonstrations" },
        { value: RemovalReason.SHOWROOM_DISPLAY, label: "Showroom Display", description: "Display/showroom item" },
        { value: RemovalReason.PROMOTIONAL, label: "Promotional", description: "Used for promotions" },
        { value: RemovalReason.MANUFACTURER_DEFECT, label: "Manufacturer Defect", description: "Defect from manufacturer" },
        { value: RemovalReason.SHIPPING_DAMAGE, label: "Shipping Damage", description: "Damaged during shipping" },
        { value: RemovalReason.STORAGE_DAMAGE, label: "Storage Damage", description: "Damaged in storage" },
        { value: RemovalReason.NATURAL_DISASTER, label: "Natural Disaster", description: "Damage from natural disaster" },
        { value: RemovalReason.OTHER, label: "Other", description: "Other reasons" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {editItem ? "Edit Removal Record" : "Remove Product from Inventory"}
                </CardTitle>
                <CardDescription>
                    {editItem
                        ? "Update removal details"
                        : "Record product removal due to damage, expiry, or other reasons"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Product Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="productID">Product *</Label>
                        <Select
                            value={formValues.productID?.toString() || ""}
                            onValueChange={(value) => {
                                setValue("productID", value);
                                const product = products.find(
                                    (p) => p.productID.toString() === value
                                );
                                setSelectedProduct(product);
                            }}
                            disabled={isLoading || productsLoading || !!editItem}
                        >
                            <SelectTrigger className={errors.productID ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select product" />
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
                                        <SelectItem
                                            key={product.productID}
                                            value={product.productID.toString()}
                                        >
                                            {product.name} (SKU: {product.sku}) - Stock:{" "}
                                            {product.stockQuantity}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.productID && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.productID.message}
                            </p>
                        )}
                        {selectedProductObj && (
                            <div className="mt-2 p-3 bg-muted rounded-md">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Current Stock:</span>
                                        <span className="font-medium ml-2">
                                            {selectedProductObj.stockQuantity}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Selling Price:</span>
                                        <span className="font-medium ml-2">
                                            ৳{selectedProductObj.sellingPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Removal *</Label>
                            <Select
                                value={formValues.reason}
                                onValueChange={(value: RemovalReason) =>
                                    setValue("reason", value)
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger className={errors.reason ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reasonOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex flex-col">
                                                <span>{option.label}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.reason && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.reason.message}
                                </p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="quantity">Quantity to Remove *</Label>
                                {selectedProductObj && (
                                    <span className="text-xs text-muted-foreground">
                                        Available: {selectedProductObj.stockQuantity}
                                    </span>
                                )}
                            </div>
                            <Input
                                id="quantity"
                                type="number"
                                {...register("quantity")}
                                placeholder="Enter quantity"
                                disabled={isLoading}
                                className={errors.quantity ? "border-red-500" : ""}
                                min={1}
                                max={selectedProductObj?.stockQuantity}
                            />
                            {errors.quantity && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.quantity.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Batch ID and Expiry Date */}
                    {/* <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="batchId">Batch ID (Optional)</Label>
                            <Input
                                id="batchId"
                                type="number"
                                {...register("batchId")}
                                placeholder="Specific batch number"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty for automatic batch selection
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                {...register("expiryDate")}
                                disabled={isLoading || formValues.reason === RemovalReason.EXPIRED}
                            />
                        </div>
                    </div> */}

                    {/* Damage Description */}
                    <div className="space-y-2">
                        <Label htmlFor="damageDescription">
                            Damage/Issue Description (Optional)
                        </Label>
                        <Textarea
                            id="damageDescription"
                            {...register("damageDescription")}
                            placeholder="Describe the damage or issue..."
                            rows={2}
                            disabled={isLoading}
                            className={errors.damageDescription ? "border-red-500" : ""}
                        />
                        {errors.damageDescription && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.damageDescription.message}
                            </p>
                        )}
                    </div>

                    {/* Estimated Loss */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="estimatedLoss">Estimated Loss (Optional)</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={calculateEstimatedLoss}
                                disabled={!selectedProductObj || !formValues.quantity}
                                className="gap-1"
                            >
                                <Calculator className="h-3 w-3" />
                                Auto-calculate
                            </Button>
                        </div>
                        <Input
                            id="estimatedLoss"
                            type="number"
                            step="0.01"
                            {...register("estimatedLoss")}
                            placeholder="Estimated monetary loss"
                            disabled={isLoading}
                            className={errors.estimatedLoss ? "border-red-500" : ""}
                        />
                        {errors.estimatedLoss && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.estimatedLoss.message}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Leave empty for automatic calculation based on selling price
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            {...register("notes")}
                            placeholder="Any additional information..."
                            rows={2}
                            disabled={isLoading}
                            className={errors.notes ? "border-red-500" : ""}
                        />
                        {errors.notes && (
                            <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
                        )}
                    </div>

                    {/* Warning for stock reduction */}
                    {selectedProductObj && formValues.quantity && (
                        <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800">
                                        Stock Reduction Warning
                                    </p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Removing {formValues.quantity} units of{" "}
                                        {selectedProductObj.name} will reduce stock from{" "}
                                        {selectedProductObj.stockQuantity} to{" "}
                                        {selectedProductObj.stockQuantity - Number(formValues.quantity)}
                                        .
                                    </p>
                                    <p className="text-xs text-amber-600 mt-2">
                                        This action cannot be undone easily. Stock will be
                                        permanently reduced from inventory.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
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
                            className={`${editItem && onCancel ? "flex-1" : "w-full"} ${formValues.reason === RemovalReason.EXPIRED ||
                                formValues.reason === RemovalReason.DAMAGED
                                ? "bg-destructive hover:bg-destructive/90"
                                : ""
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {editItem ? (
                                        "Update Removal Record"
                                    ) : (
                                        <>
                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                            Remove Product
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}