"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SetupList } from "../setup-list"
import { SetupForm } from "../setup-form"



export default function Categories() {
    const [editItem, setEditItem] = useState<any>(null)
    const [activeTab, setActiveTab] = useState("list")
    const [refresh, setRefresh] = useState(0)

    const handleEdit = (item: any) => {
        setEditItem(item)
        setActiveTab("add")
    }

    const handleSuccess = () => {
        setEditItem(null)
        setActiveTab("list")
        setRefresh((prev) => prev + 1)
    }

    const handleCancel = () => {
        setEditItem(null)
        setActiveTab("list")
    }
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Categories</h1>
                <p className="text-muted-foreground">Manage product categories</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="list">All Categories</TabsTrigger>
                    <TabsTrigger value="add">{editItem ? "Edit Category" : "Add Category"}</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-6">
                    <SetupList type="category" onEdit={handleEdit} refresh={refresh} />
                </TabsContent>

                <TabsContent value="add" className="mt-6">
                    <SetupForm type="category" editItem={editItem} onSuccess={handleSuccess} onCancel={handleCancel} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
