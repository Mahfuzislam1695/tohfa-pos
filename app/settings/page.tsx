"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Bell, Database, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [shopSettings, setShopSettings] = useState({
    name: "My POS Shop",
    email: "shop@example.com",
    phone: "+880 1234567890",
    address: "123 Main Street, Dhaka, Bangladesh",
    taxRate: "15",
    currency: "৳",
  })

  useEffect(() => {
    const saved = localStorage.getItem("pos_shop_settings")
    if (saved) {
      setShopSettings(JSON.parse(saved))
    }
  }, [])

  const saveShopSettings = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("pos_shop_settings", JSON.stringify(shopSettings))
    toast({
      title: "Settings saved",
      description: "Your shop settings have been updated successfully.",
    })
  }

  const exportData = () => {
    const data = {
      products: localStorage.getItem("pos_products"),
      categories: localStorage.getItem("pos_categories"),
      brands: localStorage.getItem("pos_brands"),
      suppliers: localStorage.getItem("pos_suppliers"),
      sales: localStorage.getItem("pos_sales"),
      purchases: localStorage.getItem("pos_purchases"),
      users: localStorage.getItem("pos_users"),
    }

    const dataStr = JSON.stringify(data, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `pos-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Your data has been exported successfully.",
    })
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone!")) {
      localStorage.removeItem("pos_products")
      localStorage.removeItem("pos_categories")
      localStorage.removeItem("pos_brands")
      localStorage.removeItem("pos_suppliers")
      localStorage.removeItem("pos_sales")
      localStorage.removeItem("pos_purchases")
      localStorage.removeItem("pos_users")
      toast({
        title: "Data cleared",
        description: "All data has been removed from the system.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your POS system configuration</p>
            </div>

            <Tabs defaultValue="shop" className="space-y-4">
              <TabsList>
                <TabsTrigger value="shop">Shop Details</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="data">Data Management</TabsTrigger>
              </TabsList>

              <TabsContent value="shop">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      <CardTitle>Shop Information</CardTitle>
                    </div>
                    <CardDescription>Update your shop details and configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveShopSettings} className="space-y-4 max-w-2xl">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Shop Name *</Label>
                          <Input
                            id="name"
                            value={shopSettings.name}
                            onChange={(e) => setShopSettings({ ...shopSettings, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={shopSettings.email}
                            onChange={(e) => setShopSettings({ ...shopSettings, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={shopSettings.phone}
                            onChange={(e) => setShopSettings({ ...shopSettings, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxRate">Tax Rate (%)</Label>
                          <Input
                            id="taxRate"
                            type="number"
                            step="0.01"
                            value={shopSettings.taxRate}
                            onChange={(e) => setShopSettings({ ...shopSettings, taxRate: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={shopSettings.address}
                          onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                          rows={3}
                          required
                        />
                      </div>

                      <Button type="submit">Save Settings</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      <CardTitle>Notification Preferences</CardTitle>
                    </div>
                    <CardDescription>Configure how you receive alerts and notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Low Stock Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified when products are low in stock</p>
                      </div>
                      <Button variant="outline">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Daily Sales Summary</p>
                        <p className="text-sm text-muted-foreground">Receive daily sales reports via email</p>
                      </div>
                      <Button variant="outline">Disabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Purchase Reminders</p>
                        <p className="text-sm text-muted-foreground">Reminders for pending supplier payments</p>
                      </div>
                      <Button variant="outline">Enabled</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      <CardTitle>Backup & Export</CardTitle>
                    </div>
                    <CardDescription>Download your data for backup or migration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export all your POS data including products, sales, purchases, and settings in JSON format.
                      </p>
                      <Button onClick={exportData}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions - proceed with caution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Clear All Data</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This will permanently delete all products, sales, purchases, and users from the system. This
                        action cannot be undone.
                      </p>
                      <Button variant="destructive" onClick={clearAllData}>
                        Clear All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
