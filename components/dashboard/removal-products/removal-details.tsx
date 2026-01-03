"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    DollarSign,
    Package,
    AlertTriangle,
    Hash,
    FileText,
    TrendingDown,
    Users,
    Clock,
    Box,
    Trash2,
    RefreshCw,
} from "lucide-react";
import { useGet } from "@/hooks/useGet";
import { Button } from "@/components/ui/button";
import { RemovalReason } from "@/types/removal";
import { useDelete } from "@/hooks/useDelete";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface RemovalDetailsProps {
    removalID: any;
    onClose?: () => void;
}

export function RemovalDetails({ removalID, onClose }: RemovalDetailsProps) {
    const queryClient = useQueryClient();

    const { data: removal, refetch, isLoading, error } = useGet<any>(
        `/removals/${removalID}`,
        ["removalDetails", removalID]
    );

    const { mutate: deleteRemoval, isPending: isDeleting } = useDelete(
        "/removals",
        ["removals", "removalDetails"],
        {
            successMessage: "Removal record deleted successfully!",
            errorMessage: "Failed to delete removal record",
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["removals"] });
                queryClient.invalidateQueries({ queryKey: ["products"] });
                onClose?.();
            },
        }
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading removal details</div>;
    if (!removal) return <div>Removal record not found</div>;

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return `৳${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    // Get reason badge color
    const getReasonColor = (reason: RemovalReason) => {
        const colors: Record<RemovalReason, string> = {
            [RemovalReason.EXPIRED]: "destructive",
            [RemovalReason.DAMAGED]: "destructive",
            [RemovalReason.BROKEN]: "destructive",
            [RemovalReason.DEFECTIVE]: "destructive",
            [RemovalReason.STOLEN]: "secondary",
            [RemovalReason.LOST]: "secondary",
            [RemovalReason.SAMPLE]: "default",
            [RemovalReason.QUALITY_ISSUE]: "outline",
            [RemovalReason.RECALL]: "secondary",
            [RemovalReason.WASTE]: "outline",
            [RemovalReason.DONATION]: "default",
            [RemovalReason.EMPLOYEE_USE]: "default",
            [RemovalReason.TESTING]: "outline",
            [RemovalReason.DEMONSTRATION]: "outline",
            [RemovalReason.SHOWROOM_DISPLAY]: "outline",
            [RemovalReason.PROMOTIONAL]: "default",
            [RemovalReason.MANUFACTURER_DEFECT]: "secondary",
            [RemovalReason.SHIPPING_DAMAGE]: "destructive",
            [RemovalReason.STORAGE_DAMAGE]: "destructive",
            [RemovalReason.NATURAL_DISASTER]: "secondary",
            [RemovalReason.OTHER]: "outline",
        };
        return colors[reason] || "outline";
    };

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this removal record? This will restore stock.")) return;
        deleteRemoval(removalID);
    };

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Removal Record #{removal.removalID}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={getReasonColor(removal.reason)}>
                            {removal.reason.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Removal ID: {removal.removalSid}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-destructive">
                        {formatCurrency(removal.totalLoss)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Loss</div>
                </div>
            </div>

            <Separator />

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Product Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Product Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Product Name</p>
                                <p className="font-medium">{removal.product?.name || "Unknown"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">SKU</p>
                                <p className="font-medium font-mono">{removal.product?.sku || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Quantity Removed</p>
                                <p className="font-medium text-destructive">{removal.quantity}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Current Stock</p>
                                <p className="font-medium">{removal.product?.stockQuantity || 0}</p>
                            </div>
                        </div>
                        {removal.batchId && (
                            <div>
                                <p className="text-sm text-muted-foreground">Batch ID</p>
                                <p className="font-medium">#{removal.batchId}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Removal Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Removal Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Reason</span>
                                <Badge variant={getReasonColor(removal.reason)}>
                                    {removal.reason.replace("_", " ")}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Estimated Loss</span>
                                <span className="font-medium text-destructive">
                                    {formatCurrency(removal.estimatedLoss || removal.totalLoss)}
                                </span>
                            </div>
                            {removal.expiryDate && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Expiry Date</span>
                                    <span className="font-medium">
                                        {new Date(removal.expiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Removed By</span>
                                <span className="font-medium">
                                    {removal.removedBy?.name || "System"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Removed At</span>
                                <span className="font-medium">
                                    {formatDate(removal.createdAt)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Additional Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {removal.damageDescription && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Damage Description</p>
                            <p className="text-sm bg-muted p-3 rounded-md">
                                {removal.damageDescription}
                            </p>
                        </div>
                    )}
                    {removal.notes && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Notes</p>
                            <p className="text-sm bg-muted p-3 rounded-md">{removal.notes}</p>
                        </div>
                    )}
                    {removal.batchDetails && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Batch Details</p>
                            <pre className="text-sm bg-muted p-3 rounded-md overflow-auto max-h-32">
                                {JSON.stringify(removal.batchDetails, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Last updated: {formatDate(removal.updatedAt)}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isDeleting}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? "Deleting..." : "Delete & Restore Stock"}
                    </Button>
                </div>
            </div>
        </div>
    );
}