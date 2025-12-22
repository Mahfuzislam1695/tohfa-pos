"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SetupForm } from "@/components/setup-form"
import { SetupList } from "@/components/setup-list"

export default function BrandsPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Brands</h1>
        <p className="text-muted-foreground">Manage product brands</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Brands</TabsTrigger>
          <TabsTrigger value="add">{editItem ? "Edit Brand" : "Add Brand"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <SetupList type="brand" onEdit={handleEdit} refresh={refresh} />
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <SetupForm type="brand" editItem={editItem} onSuccess={handleSuccess} onCancel={handleCancel} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
