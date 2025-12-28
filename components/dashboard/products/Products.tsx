"use client"


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Plus, List } from "lucide-react"
import { useState } from "react"
import { ProductList } from "./product-list"
import { ProductForm } from "./product-form"

export default function Products() {
    const [activeTab, setActiveTab] = useState("list")
    const [refreshKey, setRefreshKey] = useState(0)

    const handleSuccess = () => {
        setRefreshKey((prev) => prev + 1)
        setActiveTab("list")
    }
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Package className="h-8 w-8" />
                        Product Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Add, view, and manage your product inventory</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        View Products
                    </TabsTrigger>
                    <TabsTrigger value="add" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="mt-6">
                    <ProductList key={refreshKey} />
                </TabsContent>
                <TabsContent value="add" className="mt-6">
                    <ProductForm onSuccess={handleSuccess} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
