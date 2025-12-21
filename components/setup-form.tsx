"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react"

interface SetupFormProps {
  type: "category" | "brand" | "unit" | "supplier"
  editItem?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function SetupForm({ type, editItem, onSuccess, onCancel }: SetupFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (editItem) {
      setFormData(editItem)
    } else {
      // Reset form based on type
      switch (type) {
        case "category":
        case "brand":
          setFormData({ name: "", description: "" })
          break
        case "unit":
          setFormData({ name: "", shortName: "" })
          break
        case "supplier":
          setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "" })
          break
      }
    }
  }, [editItem, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { categoryStorage, brandStorage, unitStorage, supplierStorage } = await import("@/lib/localStorage")

      if (editItem) {
        switch (type) {
          case "category":
            categoryStorage.update(editItem.id, formData)
            break
          case "brand":
            brandStorage.update(editItem.id, formData)
            break
          case "unit":
            unitStorage.update(editItem.id, formData)
            break
          case "supplier":
            supplierStorage.update(editItem.id, formData)
            break
        }
      } else {
        switch (type) {
          case "category":
            categoryStorage.add(formData)
            break
          case "brand":
            brandStorage.add(formData)
            break
          case "unit":
            unitStorage.add(formData)
            break
          case "supplier":
            supplierStorage.add(formData)
            break
        }
      }

      // Reset form
      switch (type) {
        case "category":
        case "brand":
          setFormData({ name: "", description: "" })
          break
        case "unit":
          setFormData({ name: "", shortName: "" })
          break
        case "supplier":
          setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "" })
          break
      }

      onSuccess?.()
    } catch (error) {
      console.error(`Error saving ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const getTitle = () => {
    const typeTitle = type.charAt(0).toUpperCase() + type.slice(1)
    return editItem ? `Edit ${typeTitle}` : `Add New ${typeTitle}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>
          {editItem ? `Update the ${type} information below` : `Fill in the ${type} details below`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(type === "category" || type === "brand" || type === "unit" || type === "supplier") && (
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder={`Enter ${type} name`}
                required
              />
            </div>
          )}

          {type === "unit" && (
            <div className="space-y-2">
              <Label htmlFor="shortName">Short Name *</Label>
              <Input
                id="shortName"
                name="shortName"
                value={formData.shortName || ""}
                onChange={handleChange}
                placeholder="e.g., PC, KG, L"
                required
              />
            </div>
          )}

          {(type === "category" || type === "brand") && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder={`Enter ${type} description`}
                rows={3}
              />
            </div>
          )}

          {type === "supplier" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson || ""}
                  onChange={handleChange}
                  placeholder="Enter contact person name"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="supplier@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    placeholder="+880 1234-567890"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="Enter supplier address"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editItem ? (
                    `Update ${type.charAt(0).toUpperCase() + type.slice(1)}`
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </>
                  )}
                </>
              )}
            </Button>
            {editItem && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
