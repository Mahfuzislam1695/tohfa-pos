"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, RefreshCw, Copy, Sparkles } from "lucide-react"
import { usePost } from "@/hooks/usePost"
import { usePatch } from "@/hooks/usePatch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { useCategoriesDropdown } from "@/hooks/use-categories-dropdown"
import { useBrandsDropdown } from "@/hooks/use-brands-dropdown"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PREDEFINED_UNITS } from "@/lib/units"
import { BarcodePrint } from "./barcode-print"
import { Badge } from "@/components/ui/badge"

interface ProductFormProps {
  editItem?: any
  onSuccess?: () => void
  onCancel?: () => void
}

// Create units array from PREDEFINED_UNITS for the select dropdown
const UNITS = PREDEFINED_UNITS.map(unit => ({
  value: unit.name,
  label: `${unit.name} (${unit.shortName})`
}))

UNITS.sort((a, b) => a.label.localeCompare(b.label))

const productSchema = z.object({
  sku: z.string()
    .min(1, "SKU is required")
    .max(50, "SKU must be less than 50 characters"),
  name: z.string().min(1, "Product name is required").max(200, "Product name must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  purchasePrice: z.string().min(0, "Purchase price must be a positive number")
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, "Purchase price must be a positive number"),
  sellingPrice: z.string().min(0, "Selling price must be a positive number")
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, "Selling price must be a positive number"),
  taxRate: z.string().optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => val === undefined || val >= 0, "Tax rate must be a positive number"),
  stockQuantity: z.string().min(0, "Stock quantity must be a positive number")
    .transform((val) => parseInt(val))
    .refine((val) => val >= 0, "Stock quantity must be a positive number"),
  lowStockThreshold: z.string().min(0, "Low stock threshold must be a positive number")
    .transform((val) => parseInt(val))
    .refine((val) => val >= 0, "Low stock threshold must be a positive number"),
  unit: z.string().min(1, "Unit is required"),
  categoryID: z.string().min(1, "Category is required")
    .transform((val) => parseInt(val)),
  brandID: z.string().optional()
    .transform((val) => val ? parseInt(val) : undefined),
  reorderPoint: z.string().optional()
    .transform((val) => val ? parseInt(val) : undefined)
    .refine((val) => val === undefined || val >= 0, "Reorder point must be a positive number"),
  location: z.string().max(200, "Location must be less than 200 characters").optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export function ProductForm({ editItem, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient()
  const { categories, isLoading: categoriesLoading } = useCategoriesDropdown()
  const { brands, isLoading: brandsLoading } = useBrandsDropdown()

  // State for barcode printing
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [printData, setPrintData] = useState({
    productName: "",
    productSku: "",
    barcode: "",
    productPrice: "",
    sellingPrice: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skuFormat, setSkuFormat] = useState<'auto' | 'manual'>('auto')
  const [skuSequence, setSkuSequence] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      purchasePrice: "0",
      sellingPrice: "0",
      taxRate: "",
      stockQuantity: "0",
      lowStockThreshold: "5",
      unit: "Piece",
      categoryID: "",
      brandID: "",
      reorderPoint: "",
      location: "",
      notes: "",
    }
  })

  const formValues = watch()
  const selectedCategory = categories.find(c => c.categoryID.toString() === formValues.categoryID)
  const selectedBrand = brands.find(b => b.brandID?.toString() === formValues.brandID)

  // Function to generate SKU with product name included
  const generateSku = (): string => {
    // Category: 2-digit zero-padded
    const categoryDigits = selectedCategory ?
      selectedCategory.categoryID.toString().padStart(2, '0') : '01'

    // Brand: 2-digit zero-padded or "00" if no brand
    const brandDigits = selectedBrand ?
      selectedBrand.brandID.toString().padStart(2, '0') : '00'

    // Product code from name
    let productCode = ''
    if (formValues.name) {
      // Extract numbers first (if any)
      const numbersInName = formValues.name.match(/\d+/g)
      const extractedNumber = numbersInName ? numbersInName[0].slice(0, 2) : ''

      // Extract letters from name
      const words = formValues.name
        .replace(/[^a-zA-Z\s]/g, '') // Remove non-letters except spaces
        .split(' ')
        .filter(word => word.length > 0)

      // Build product code
      if (words.length >= 2) {
        // If multiple words, use first letter of first 2-3 words
        productCode = words.slice(0, 3).map(word => word[0]).join('').toUpperCase()
      } else if (words.length === 1 && words[0].length >= 3) {
        // If single word, use first 3 letters
        productCode = words[0].substring(0, 3).toUpperCase()
      } else {
        // Fallback
        productCode = 'PRO'
      }

      // Append extracted number if exists
      if (extractedNumber) {
        productCode = productCode.substring(0, 3 - extractedNumber.length) + extractedNumber
      }

      // Ensure 3 characters exactly
      productCode = productCode.padEnd(3, 'X').substring(0, 3)
    } else {
      productCode = 'PRO'
    }

    // Sequence number (3 digits)
    const sequenceDigits = skuSequence.toString().padStart(3, '0')

    // Final format: 01-00-1FK-001
    return `${categoryDigits}-${brandDigits}-${productCode}-${sequenceDigits}`
  }

  // Auto-generate SKU when relevant fields change (only for new products)
  useEffect(() => {
    if (skuFormat === 'auto' && !editItem) {
      const newSku = generateSku()
      setValue('sku', newSku)
    }
  }, [formValues.categoryID, formValues.brandID, formValues.name, skuSequence, skuFormat, editItem])

  // Copy SKU to clipboard
  const copySkuToClipboard = () => {
    navigator.clipboard.writeText(formValues.sku)
    toast.success("SKU copied to clipboard!")
  }

  // Handle print dialog close
  const handlePrintDialogClose = () => {
    setShowPrintDialog(false)
    onSuccess?.()
  }

  const { mutate: createProduct, isPending: isCreating } = usePost(
    "/products",
    (data: any) => {
      setIsSubmitting(false)

      if (data?.statusCode >= 200 && data?.statusCode < 300) {
        // Get barcode from backend response
        const barcode = data.data?.barcode
        const productName = data.data?.name
        const productSku = data.data?.sku

        // Reset form
        reset()
        queryClient.invalidateQueries({ queryKey: ["products"] })

        // Show print dialog if barcode was generated
        if (barcode) {
          setPrintData({
            productName: productName || formValues.name,
            productSku: productSku || formValues.sku,
            barcode,
            sellingPrice: (formValues.sellingPrice?.toString() || "0")
          })
          setShowPrintDialog(true)
        } else {
          onSuccess?.()
        }
      } else {
        toast.error(data?.message || "Failed to save product")
      }
    },
    (error: any) => {
      setIsSubmitting(false)
      console.error("Create product error:", error)
      toast.error(error?.message || "Failed to save product")
    }
  )

  const { mutate: updateProduct, isPending: isUpdating } = usePatch(
    `/products/${editItem?.productID}`,
    (data: any) => {
      setIsSubmitting(false)

      if (data?.statusCode >= 200 && data?.statusCode < 300) {
        reset()
        queryClient.invalidateQueries({ queryKey: ["products"] })
        onSuccess?.()
      } else {
        toast.error(data?.message || "Failed to update product")
      }
    },
    (error: any) => {
      setIsSubmitting(false)
      toast.error(error?.message || "Failed to update product")
    }
  )

  useEffect(() => {
    if (editItem) {
      // Set all form fields for edit mode
      const fields = [
        'sku', 'name', 'description', 'location', 'notes'
      ] as const

      fields.forEach(field => {
        if (editItem[field] !== undefined) {
          setValue(field, editItem[field] || "")
        }
      })

      // Set numeric fields
      if (editItem.purchasePrice !== undefined) setValue('purchasePrice', editItem.purchasePrice.toString())
      if (editItem.sellingPrice !== undefined) setValue('sellingPrice', editItem.sellingPrice.toString())
      if (editItem.taxRate !== undefined) setValue('taxRate', editItem.taxRate?.toString() || "")
      if (editItem.stockQuantity !== undefined) setValue('stockQuantity', editItem.stockQuantity.toString())
      if (editItem.lowStockThreshold !== undefined) setValue('lowStockThreshold', editItem.lowStockThreshold.toString())
      if (editItem.reorderPoint !== undefined) setValue('reorderPoint', editItem.reorderPoint?.toString() || "")

      // Set select fields
      if (editItem.categoryID !== undefined) {
        setValue('categoryID', editItem.categoryID.toString())
      }

      if (editItem.brandID !== undefined) {
        setValue('brandID', editItem.brandID?.toString() || "")
      }

      // Set unit value
      if (editItem.unit !== undefined) {
        setValue('unit', editItem.unit)
      }

      // Set SKU format to manual for edit mode
      setSkuFormat('manual')
    } else {
      reset({
        sku: "",
        name: "",
        description: "",
        purchasePrice: "0",
        sellingPrice: "0",
        taxRate: "",
        stockQuantity: "0",
        lowStockThreshold: "5",
        unit: "Piece",
        categoryID: "",
        brandID: "",
        reorderPoint: "",
        location: "",
        notes: "",
      })
      setSkuFormat('auto')
    }
  }, [editItem, setValue, reset])

  const onSubmit = async (data: ProductFormData) => {
    const isValid = await trigger()
    if (!isValid) {
      toast.error("Please fix all errors before submitting")
      return
    }

    setIsSubmitting(true)

    const dataToSubmit = {
      sku: data.sku.toUpperCase(),
      name: data.name,
      description: data.description || undefined,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      taxRate: data.taxRate || undefined,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
      unit: data.unit,
      categoryID: data.categoryID,
      brandID: data.brandID || undefined,
      reorderPoint: data.reorderPoint || undefined,
      location: data.location || undefined,
      notes: data.notes || undefined,
    }

    if (editItem?.productID) {
      // For edit mode, SKU is not editable, but category, brand, and purchase price are
      // Remove SKU from update payload
      delete dataToSubmit.sku

      updateProduct(dataToSubmit)
    } else {
      createProduct(dataToSubmit)
    }
  }

  const isLoading = isCreating || isUpdating || categoriesLoading || brandsLoading || isSubmitting

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{editItem ? "Edit Product" : "Add New Product"}</CardTitle>
          <CardDescription>
            {editItem ? "Update the product information below" : "Fill in the product details below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* SKU Section - Only SKU is not editable */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sku" className="text-base">
                  Product SKU *
                  {editItem && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Cannot be changed)
                    </span>
                  )}
                </Label>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="sku"
                      {...register("sku")}
                      placeholder={editItem ? editItem.sku : "Auto-generated SKU"}
                      disabled={isLoading || editItem || skuFormat === 'auto'}
                      className={`font-mono text-lg ${errors.sku ? "border-red-500" : ""}`}
                      value={formValues.sku}
                      onChange={(e) => !editItem && setValue('sku', e.target.value.toUpperCase())}
                    />
                  </div>
                  {!editItem && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copySkuToClipboard}
                        disabled={!formValues.sku}
                        title="Copy SKU"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {skuFormat === 'auto' && !editItem && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setSkuSequence(prev => prev + 1)}
                          title="Generate next SKU"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {errors.sku && (
                  <p className="text-sm text-red-500 mt-1">{errors.sku.message}</p>
                )}

                {/* SKU Generation Settings - Only for new products */}
                {!editItem && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={skuFormat === 'auto' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSkuFormat('auto')}
                    >
                      Auto-generate
                    </Badge>
                    <Badge
                      variant={skuFormat === 'manual' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSkuFormat('manual')}
                    >
                      Manual
                    </Badge>
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="iPhone 15 Pro Max 256GB"
                  disabled={isLoading}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Category - Editable for both new and edit */}
              <div className="space-y-2">
                <Label htmlFor="categoryID">Category *</Label>
                <Select
                  value={formValues.categoryID?.toString() || ""}
                  onValueChange={(value) => setValue("categoryID", value)}
                  disabled={isLoading || categoriesLoading}
                >
                  <SelectTrigger className={errors.categoryID ? "border-red-500" : ""}>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"}>
                      {/* Show selected category name if available */}
                      {formValues.categoryID && selectedCategory && selectedCategory.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No categories available
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.categoryID} value={category.categoryID.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.categoryID && (
                  <p className="text-sm text-red-500 mt-1">{errors.categoryID.message}</p>
                )}
              </div>

              {/* Brand - Editable for both new and edit */}
              <div className="space-y-2">
                <Label htmlFor="brandID">Brand</Label>
                <Select
                  value={formValues.brandID?.toString() || ""}
                  onValueChange={(value) => setValue("brandID", value)}
                  disabled={isLoading || brandsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select brand (optional)"}>
                      {/* Show selected brand name if available */}
                      {formValues.brandID && selectedBrand && selectedBrand.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {brandsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading brands...
                      </SelectItem>
                    ) : brands.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No brands available
                      </SelectItem>
                    ) : (
                      brands.map((brand) => (
                        <SelectItem key={brand.brandID} value={brand.brandID.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit - Editable for both new and edit */}
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formValues.unit}
                  onValueChange={(value) => setValue("unit", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-sm text-red-500 mt-1">{errors.unit.message}</p>
                )}
              </div>

              {/* Storage Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Aisle 3, Shelf B"
                  disabled={isLoading}
                />
              </div>

              {/* Purchase Price - Editable for both new and edit */}
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  {...register("purchasePrice")}
                  placeholder="10.50"
                  disabled={isLoading}
                  className={errors.purchasePrice ? "border-red-500" : ""}
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-red-500 mt-1">{errors.purchasePrice.message}</p>
                )}
              </div>

              {/* Selling Price */}
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  {...register("sellingPrice")}
                  placeholder="15.99"
                  disabled={isLoading}
                  className={errors.sellingPrice ? "border-red-500" : ""}
                />
                {errors.sellingPrice && (
                  <p className="text-sm text-red-500 mt-1">{errors.sellingPrice.message}</p>
                )}
              </div>

              {/* Stock Quantity - Only for new products */}
              {!editItem && (
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    {...register("stockQuantity")}
                    placeholder="100"
                    disabled={isLoading}
                    className={errors.stockQuantity ? "border-red-500" : ""}
                  />
                  {errors.stockQuantity && (
                    <p className="text-sm text-red-500 mt-1">{errors.stockQuantity.message}</p>
                  )}
                </div>
              )}

              {/* Low Stock Threshold */}
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold *</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  {...register("lowStockThreshold")}
                  placeholder="5"
                  disabled={isLoading}
                  className={errors.lowStockThreshold ? "border-red-500" : ""}
                />
                {errors.lowStockThreshold && (
                  <p className="text-sm text-red-500 mt-1">{errors.lowStockThreshold.message}</p>
                )}
              </div>

            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter product description..."
                rows={3}
                disabled={isLoading}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>


            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className={`${onCancel ? 'flex-1' : 'w-full'}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSubmitting ? (editItem ? "Updating Product..." : "Creating Product...") : "Processing..."}
                  </>
                ) : (
                  <>
                    {editItem ? (
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
            </div>
          </form>
        </CardContent>
      </Card>

      <BarcodePrint
        open={showPrintDialog}
        onOpenChange={handlePrintDialogClose}
        productName={printData.productName}
        productSku={printData.productSku}
        barcode={printData.barcode}
        productPrice={printData.sellingPrice}
        onPrintComplete={() => console.log("Print completed")}
      />
    </>
  )
}
