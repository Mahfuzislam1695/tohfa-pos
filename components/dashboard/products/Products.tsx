"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Plus, List, Eye } from "lucide-react"
import { useState } from "react"
import { ProductList } from "./product-list"
import { ProductForm } from "./product-form"
import { ProductDetails } from "./product-details"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Products() {
    const [activeTab, setActiveTab] = useState("list")
    const [refreshKey, setRefreshKey] = useState(0)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [viewingProduct, setViewingProduct] = useState<any>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

    const handleSuccess = () => {
        setRefreshKey((prev) => prev + 1)
        setActiveTab("list")
        setEditingProduct(null)
    }

    const handleEdit = (product: any) => {
        setEditingProduct(product)
        setActiveTab("add")
    }

    const handleView = (product: any) => {
        setViewingProduct(product)
        setIsViewDialogOpen(true)
    }

    const handleCloseView = () => {
        setIsViewDialogOpen(false)
        setViewingProduct(null)
    }

    const handleCancelEdit = () => {
        setEditingProduct(null)
        setActiveTab("list")
    }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <Package className="h-8 w-8" />
                            Product Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Add, view, and manage your product inventory</p>
                    </div>
                    {activeTab === "list" && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditingProduct(null)
                                setActiveTab("add")
                            }}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Button>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            View Products
                        </TabsTrigger>
                        <TabsTrigger value="add" className="flex items-center gap-2">
                            {editingProduct ? (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Edit Product
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Add Product
                                </>
                            )}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="list" className="mt-6">
                        <ProductList
                            key={refreshKey}
                            onEdit={handleEdit}
                            onView={handleView}
                        />
                    </TabsContent>
                    <TabsContent value="add" className="mt-6">
                        <ProductForm
                            editItem={editingProduct}
                            onSuccess={handleSuccess}
                            onCancel={handleCancelEdit}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* View Product Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="w-[80vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Product Details</DialogTitle>
                    </DialogHeader>
                    {viewingProduct && (
                        <ProductDetails productID={viewingProduct.productID} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
