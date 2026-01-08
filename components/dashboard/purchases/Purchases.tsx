
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, List, Eye, TrendingUp } from "lucide-react"
import { useState } from "react"
import { PurchaseList } from "./purchase-list"
import { PurchaseForm } from "./purchase-form"
import { PurchaseDetails } from "./purchase-details"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Purchases() {
    const [activeTab, setActiveTab] = useState("list")
    const [refreshKey, setRefreshKey] = useState(0)
    const [editingPurchase, setEditingPurchase] = useState<any>(null)
    const [viewingPurchase, setViewingPurchase] = useState<any>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined)

    const handleSuccess = () => {
        setRefreshKey((prev) => prev + 1)
        setActiveTab("list")
        setEditingPurchase(null)
        setSelectedProductId(undefined)
    }

    const handleEdit = (purchase: any) => {
        setEditingPurchase(purchase)
        setSelectedProductId(purchase.productID || purchase.product?.productID)
        setActiveTab("add")
    }

    const handleView = (purchase: any) => {
        setViewingPurchase(purchase)
        setIsViewDialogOpen(true)
    }

    const handleCloseView = () => {
        setIsViewDialogOpen(false)
        setViewingPurchase(null)
    }

    const handleCancelEdit = () => {
        setEditingPurchase(null)
        setSelectedProductId(undefined)
        setActiveTab("list")
    }

    const handleAddForProduct = (productId?: number) => {
        setSelectedProductId(productId)
        setEditingPurchase(null)
        setActiveTab("add")
    }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <TrendingUp className="h-8 w-8" />
                            Purchase Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Add, view, and manage purchase batches</p>
                    </div>
                    {activeTab === "list" && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleAddForProduct()}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Purchase Batch
                            </Button>
                        </div>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            View Purchases
                        </TabsTrigger>
                        <TabsTrigger value="add" className="flex items-center gap-2">
                            {editingPurchase ? (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Edit Purchase
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Add Purchase
                                </>
                            )}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="list" className="mt-6">
                        <PurchaseList
                            key={refreshKey}
                            onEdit={handleEdit}
                            onView={handleView}
                            onAddForProduct={handleAddForProduct}
                        />
                    </TabsContent>
                    <TabsContent value="add" className="mt-6">
                        <PurchaseForm
                            productId={selectedProductId}
                            editItem={editingPurchase}
                            onSuccess={handleSuccess}
                            onCancel={handleCancelEdit}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* View Purchase Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="w-[80vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Purchase Batch Details</DialogTitle>
                    </DialogHeader>
                    {viewingPurchase && (
                        <PurchaseDetails purchase={viewingPurchase} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}