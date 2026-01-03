"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RemovalReason, RemovalFilters } from "@/types/removal";
import { Calendar } from "lucide-react";
import { useProductsDropdown } from "@/hooks/use-products-dropdown";

interface RemovalFilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: Partial<RemovalFilters>;
    onFiltersChange: (filters: Partial<RemovalFilters>) => void;
}

export function RemovalFilterDialog({
    open,
    onOpenChange,
    filters,
    onFiltersChange,
}: RemovalFilterDialogProps) {
    const { products } = useProductsDropdown();
    const [localFilters, setLocalFilters] = useState<Partial<RemovalFilters>>(
        filters
    );

    const handleApply = () => {
        onFiltersChange(localFilters);
        onOpenChange(false);
    };

    const handleReset = () => {
        setLocalFilters({});
        onFiltersChange({});
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Filter Removal Records</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="startDate" className="text-xs">
                                    From Date
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={
                                            localFilters.startDate
                                                ? localFilters.startDate.toISOString().split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                startDate: e.target.value
                                                    ? new Date(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="endDate" className="text-xs">
                                    To Date
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={
                                            localFilters.endDate
                                                ? localFilters.endDate.toISOString().split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                endDate: e.target.value
                                                    ? new Date(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Select
                            value={localFilters.reason || ""}
                            onValueChange={(value: RemovalReason | "") =>
                                setLocalFilters({
                                    ...localFilters,
                                    reason: value || undefined,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All reasons" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All reasons</SelectItem>
                                {Object.values(RemovalReason).map((reason) => (
                                    <SelectItem key={reason} value={reason}>
                                        {reason.replace("_", " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Product */}
                    <div className="space-y-2">
                        <Label htmlFor="productId">Product</Label>
                        <Select
                            value={localFilters.productId?.toString() || ""}
                            onValueChange={(value) =>
                                setLocalFilters({
                                    ...localFilters,
                                    productId: value ? parseInt(value) : undefined,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All products" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All products</SelectItem>
                                {products.map((product) => (
                                    <SelectItem
                                        key={product.productID}
                                        value={product.productID.toString()}
                                    >
                                        {product.name} (SKU: {product.sku})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Loss Range */}
                    <div className="space-y-2">
                        <Label>Loss Amount Range (৳)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="minLoss" className="text-xs">
                                    Minimum
                                </Label>
                                <Input
                                    id="minLoss"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={localFilters.minLoss || ""}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            minLoss: e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="maxLoss" className="text-xs">
                                    Maximum
                                </Label>
                                <Input
                                    id="maxLoss"
                                    type="number"
                                    step="0.01"
                                    placeholder="10000"
                                    value={localFilters.maxLoss || ""}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            maxLoss: e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleReset}>
                        Reset All
                    </Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}