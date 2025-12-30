"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Plus, List } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserList } from "./user-list"
import { UserForm } from "./user-form"

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list")
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingUser, setEditingUser] = useState<any>(null)

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    setActiveTab("list")
    setEditingUser(null)
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setActiveTab("add")
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setActiveTab("list")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage system users and their access levels</p>
        </div>
        {activeTab === "list" && (
          <Button
            variant="outline"
            onClick={() => {
              setEditingUser(null)
              setActiveTab("add")
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            View Users
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            {editingUser ? (
              <>
                <Users className="h-4 w-4" />
                Edit User
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add User
              </>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <UserList
            key={refreshKey}
            onEdit={handleEdit}
          />
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <UserForm
            editItem={editingUser}
            onSuccess={handleSuccess}
            onCancel={handleCancelEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}