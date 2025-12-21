"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type Product,
  productStorage,
  categoryStorage,
  brandStorage,
  supplierStorage,
  type Category,
  type Brand,
  type Supplier,
} from "@/lib/localStorage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { PREDEFINED_UNITS, type Unit } from "@/lib/units"

interface ProductFormProps {
  editProduct?: Product | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({ editProduct, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    brand: "",
    unit: "",
    purchasePrice: "",
    sellingPrice: "",
    stockQuantity: "",
    lowStockThreshold: "",
    description: "",
    supplier: "",
    barcode: "",
  })

  useEffect(() => {
    setCategories(categoryStorage.getAll())
    setBrands(brandStorage.getAll())
    setSuppliers(supplierStorage.getAll())
    setUnits(PREDEFINED_UNITS)
  }, [])

  useEffect(() => {
    if (editProduct) {
      setFormData({
        sku: editProduct.sku,
        name: editProduct.name,
        category: editProduct.category,
        brand: editProduct.brand,
        unit: editProduct.unit,
        purchasePrice: editProduct.purchasePrice.toString(),
        sellingPrice: editProduct.sellingPrice.toString(),
        stockQuantity: editProduct.stockQuantity.toString(),
        lowStockThreshold: editProduct.lowStockThreshold.toString(),
        description: editProduct.description,
        supplier: editProduct.supplier,
        barcode: editProduct.barcode,
      })
    }
  }, [editProduct])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        unit: formData.unit,
        purchasePrice: Number.parseFloat(formData.purchasePrice),
        sellingPrice: Number.parseFloat(formData.sellingPrice),
        stockQuantity: Number.parseInt(formData.stockQuantity),
        lowStockThreshold: Number.parseInt(formData.lowStockThreshold),
        description: formData.description,
        supplier: formData.supplier,
        barcode: formData.barcode,
      }

      if (editProduct) {
        productStorage.update(editProduct.id, productData)
      } else {
        productStorage.add(productData)
      }

      setFormData({
        sku: "",
        name: "",
        category: "",
        brand: "",
        unit: "",
        purchasePrice: "",
        sellingPrice: "",
        stockQuantity: "",
        lowStockThreshold: "",
        description: "",
        supplier: "",
        barcode: "",
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editProduct ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {editProduct ? "Update the product information below" : "Fill in the product details below"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="PRD-001" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Wireless Mouse"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Select value={formData.brand} onValueChange={(value) => handleSelectChange("brand", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.shortName} value={unit.shortName}>
                      {unit.name} ({unit.shortName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="1234567890123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (৳) *</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="200.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (৳) *</Label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="299.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert *</Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                placeholder="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={formData.supplier} onValueChange={(value) => handleSelectChange("supplier", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editProduct ? (
                    "Update Product"
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </>
                  )}
                </>
              )}
            </Button>
            {editProduct && onCancel && (
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
