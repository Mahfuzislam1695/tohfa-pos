// product-form.tsx (updated)
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react"
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
  sku: z.string().min(1, "SKU is required").max(50, "SKU must be less than 50 characters"),
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

  // Handle print dialog close
  const handlePrintDialogClose = () => {
    setShowPrintDialog(false)
    // Call onSuccess after printing dialog is closed
    onSuccess?.()
  }

  // Handle print completion
  const handlePrintComplete = () => {
    console.log("Print completed")
  }

  // Update the ProductForm success handler
  const { mutate: createProduct, isPending: isCreating } = usePost(
    "/products",
    (data: any) => {
      setIsSubmitting(false)

      console.log("Create product response:", data)

      if (data?.statusCode >= 200 && data?.statusCode < 300) {
        // toast.success("Product created successfully!")

        // Get barcode from backend response
        const barcode = data.data?.barcode
        const productName = data.data?.name
        const productSku = data.data?.sku

        console.log("Backend generated barcode:", barcode)

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
          // If no barcode, just call success
          onSuccess?.()
        }
      } else {
        toast.error(data?.message || "Failed to save product")
        // onSuccess?.() // Still call onSuccess to close modal
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
        toast.success("Product updated successfully!")
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
      console.log("Setting edit item data:", editItem)

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
    }
  }, [editItem, setValue, reset])

  const onSubmit = async (data: ProductFormData) => {
    console.log("Form submitted with data:", data)

    // Validate all fields before submission
    const isValid = await trigger()
    if (!isValid) {
      toast.error("Please fix all errors before submitting")
      return
    }

    setIsSubmitting(true)

    // DO NOT include barcode in request - backend will generate it
    const dataToSubmit = {
      sku: data.sku,
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

    console.log("Submitting product data (no barcode):", dataToSubmit)

    if (editItem?.productID) {
      // For updates, send barcode if it exists
      if (editItem.barcode) {
        dataToSubmit.barcode = editItem.barcode
      }
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
              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  {...register("sku")}
                  placeholder="PROD-001"
                  disabled={isLoading}
                  className={errors.sku ? "border-red-500" : ""}
                />
                {errors.sku && (
                  <p className="text-sm text-red-500 mt-1">{errors.sku.message}</p>
                )}
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Premium Notebook"
                  disabled={isLoading}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Barcode will be generated by backend - show only in edit mode */}
              {editItem && (
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="barcode"
                      defaultValue={editItem.barcode || ""}
                      placeholder="Generated by system"
                      disabled={true}
                      className="font-mono"
                    />
                    <span className="text-xs text-muted-foreground">
                      (Auto-generated)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Barcode is automatically generated by the system
                  </p>
                </div>
              )}

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="categoryID">Category *</Label>
                <Select
                  value={formValues.categoryID?.toString() || ""}
                  onValueChange={(value) => setValue("categoryID", value)}
                  disabled={isLoading || categoriesLoading}
                >
                  <SelectTrigger className={errors.categoryID ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
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

              {/* Brand (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="brandID">Brand</Label>
                <Select
                  value={formValues.brandID?.toString() || ""}
                  onValueChange={(value) => setValue("brandID", value)}
                  disabled={isLoading || brandsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand (optional)" />
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

              {/* Unit */}
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
                <p className="text-xs text-muted-foreground">
                  Format: Name (Short Code)
                </p>
              </div>



{/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Aisle 3, Shelf B"
                  disabled={isLoading}
                />
              </div>

              {/* Purchase Price */}
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

              {/* Stock Quantity */}
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

              {/* Tax Rate */}
              {/* <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  {...register("taxRate")}
                  placeholder="7.5"
                  disabled={isLoading}
                />
              </div> */}

              {/* Reorder Point */}
              {/* <div className="space-y-2">
                <Label htmlFor="reorderPoint">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  {...register("reorderPoint")}
                  placeholder="10"
                  disabled={isLoading}
                />
              </div> */}

              
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
              <p className="text-xs text-muted-foreground">
                {formValues.description?.length || 0}/1000 characters
              </p>
            </div>

            {/* Notes */}
            {/* <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Enter any additional notes..."
                rows={2}
                disabled={isLoading}
                className={errors.notes ? "border-red-500" : ""}
              />
              {errors.notes && (
                <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formValues.notes?.length || 0}/1000 characters
              </p>
            </div> */}

            <div className="flex gap-3 pt-4">
              {editItem && onCancel && (
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
                className={`${editItem && onCancel ? 'flex-1' : 'w-full'}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSubmitting ? "Creating Product..." : "Processing..."}
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

      {/* Reusable Barcode Print Component */}
      <BarcodePrint
        open={showPrintDialog}
        onOpenChange={handlePrintDialogClose}
        productName={printData.productName}
        productSku={printData.productSku}
        barcode={printData.barcode}
        productPrice={printData.sellingPrice}
        onPrintComplete={handlePrintComplete}
      />
    </>
  )
}




// "use client"

// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Loader2, Plus, Printer, X } from "lucide-react"
// import { usePost } from "@/hooks/usePost"
// import { usePatch } from "@/hooks/usePatch"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import * as z from "zod"
// import { toast } from "react-toastify"
// import { useQueryClient } from "@tanstack/react-query"
// import { useCategoriesDropdown } from "@/hooks/use-categories-dropdown"
// import { useBrandsDropdown } from "@/hooks/use-brands-dropdown"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { PREDEFINED_UNITS } from "@/lib/units"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Badge } from "@/components/ui/badge"

// interface ProductFormProps {
//   editItem?: any
//   onSuccess?: () => void
//   onCancel?: () => void
// }

// // Create units array from PREDEFINED_UNITS for the select dropdown
// const UNITS = PREDEFINED_UNITS.map(unit => ({
//   value: unit.name,
//   label: `${unit.name} (${unit.shortName})`
// }))

// UNITS.sort((a, b) => a.label.localeCompare(b.label))

// const productSchema = z.object({
//   sku: z.string().min(1, "SKU is required").max(50, "SKU must be less than 50 characters"),
//   name: z.string().min(1, "Product name is required").max(200, "Product name must be less than 200 characters"),
//   description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
//   barcode: z.string().optional(),
//   purchasePrice: z.string().min(0, "Purchase price must be a positive number")
//     .transform((val) => parseFloat(val))
//     .refine((val) => val >= 0, "Purchase price must be a positive number"),
//   sellingPrice: z.string().min(0, "Selling price must be a positive number")
//     .transform((val) => parseFloat(val))
//     .refine((val) => val >= 0, "Selling price must be a positive number"),
//   taxRate: z.string().optional()
//     .transform((val) => val ? parseFloat(val) : undefined)
//     .refine((val) => val === undefined || val >= 0, "Tax rate must be a positive number"),
//   stockQuantity: z.string().min(0, "Stock quantity must be a positive number")
//     .transform((val) => parseInt(val))
//     .refine((val) => val >= 0, "Stock quantity must be a positive number"),
//   lowStockThreshold: z.string().min(0, "Low stock threshold must be a positive number")
//     .transform((val) => parseInt(val))
//     .refine((val) => val >= 0, "Low stock threshold must be a positive number"),
//   unit: z.string().min(1, "Unit is required"),
//   categoryID: z.string().min(1, "Category is required")
//     .transform((val) => parseInt(val)),
//   brandID: z.string().optional()
//     .transform((val) => val ? parseInt(val) : undefined),
//   reorderPoint: z.string().optional()
//     .transform((val) => val ? parseInt(val) : undefined)
//     .refine((val) => val === undefined || val >= 0, "Reorder point must be a positive number"),
//   location: z.string().max(200, "Location must be less than 200 characters").optional(),
//   notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
// })

// type ProductFormData = z.infer<typeof productSchema>

// // Generate unique barcode based on SKU, name, and timestamp
// function generateUniqueBarcode(sku: string, name: string): string {
//   const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
//   const skuPart = sku.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
//   const namePart = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()

//   // Create a unique code (max 20 chars)
//   const barcode = `${skuPart}${namePart}${timestamp}`

//   // Ensure it's exactly 12 digits (standard barcode length)
//   const paddedBarcode = barcode.padEnd(12, '0').slice(0, 12)

//   return paddedBarcode
// }

// export function ProductForm({ editItem, onSuccess, onCancel }: ProductFormProps) {
//   const queryClient = useQueryClient()
//   const { categories, isLoading: categoriesLoading } = useCategoriesDropdown()
//   const { brands, isLoading: brandsLoading } = useBrandsDropdown()

//   // State for barcode printing
//   const [showPrintDialog, setShowPrintDialog] = useState(false)
//   const [printQuantity, setPrintQuantity] = useState(1)
//   const [generatedBarcode, setGeneratedBarcode] = useState("")
//   const [productNameForPrint, setProductNameForPrint] = useState("")
//   const [productSkuForPrint, setProductSkuForPrint] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)


//   console.log("showPrintDialog", showPrintDialog);


//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//     watch,
//     trigger,
//   } = useForm<ProductFormData>({
//     resolver: zodResolver(productSchema),
//     defaultValues: {
//       sku: "",
//       name: "",
//       description: "",
//       barcode: "",
//       purchasePrice: "0",
//       sellingPrice: "0",
//       taxRate: "",
//       stockQuantity: "0",
//       lowStockThreshold: "5",
//       unit: "Piece",
//       categoryID: "",
//       brandID: "",
//       reorderPoint: "",
//       location: "",
//       notes: "",
//     }
//   })

//   const formValues = watch()

//   console.log("formValues", formValues);

//   // Auto-generate barcode when SKU or name changes
//   useEffect(() => {
//     if (!editItem && formValues.sku && formValues.name) {
//       const barcode = generateUniqueBarcode(formValues.sku, formValues.name)
//       setValue("barcode", barcode)
//       setGeneratedBarcode(barcode)
//     }
//   }, [formValues.sku, formValues.name, editItem, setValue])

//   // Update the ProductForm success handler
//   const { mutate: createProduct, isPending: isCreating } = usePost(
//     "/products",
//     (data: any) => {
//       setIsSubmitting(false)

//       console.log("Create product response:", data)

//       if (data?.statusCode >= 200 && data?.statusCode < 300) {
//         toast.success("Product created successfully!")

//         // Store values for printing dialog BEFORE resetting form
//         const currentSku = formValues.sku
//         const currentName = formValues.name
//         const currentBarcode = formValues.barcode || generateUniqueBarcode(currentSku, currentName)

//         console.log("Setting print values:", {
//           sku: currentSku,
//           name: currentName,
//           barcode: currentBarcode
//         })

//         setProductNameForPrint(currentName)
//         setProductSkuForPrint(currentSku)
//         setGeneratedBarcode(currentBarcode)

//         // Reset form but DON'T call onSuccess yet
//         reset()
//         queryClient.invalidateQueries({ queryKey: ["products"] })

//         // Show print dialog immediately
//         setShowPrintDialog(true)

//         // DO NOT call onSuccess here - wait for print dialog to close
//         // onSuccess?.()
//       } else {
//         toast.error(data?.message || "Failed to save product")
//       }
//     },
//     (error: any) => {
//       setIsSubmitting(false)
//       console.error("Create product error:", error)
//       toast.error(error?.message || "Failed to save product")
//     }
//   )
//   const { mutate: updateProduct, isPending: isUpdating } = usePatch(
//     `/products/${editItem?.productID}`,
//     (data: any) => {
//       setIsSubmitting(false)

//       if (data?.statusCode >= 200 && data?.statusCode < 300) {
//         toast.success("Product updated successfully!")
//         reset()
//         queryClient.invalidateQueries({ queryKey: ["products"] })
//         onSuccess?.()
//       } else {
//         toast.error(data?.message || "Failed to update product")
//       }
//     },
//     (error: any) => {
//       setIsSubmitting(false)
//       toast.error(error?.message || "Failed to update product")
//     }
//   )

//   useEffect(() => {
//     if (editItem) {
//       console.log("Setting edit item data:", editItem)

//       const fields = [
//         'sku', 'name', 'description', 'barcode', 'location', 'notes'
//       ] as const

//       fields.forEach(field => {
//         if (editItem[field] !== undefined) {
//           setValue(field, editItem[field] || "")
//         }
//       })

//       // Set numeric fields
//       if (editItem.purchasePrice !== undefined) setValue('purchasePrice', editItem.purchasePrice.toString())
//       if (editItem.sellingPrice !== undefined) setValue('sellingPrice', editItem.sellingPrice.toString())
//       if (editItem.taxRate !== undefined) setValue('taxRate', editItem.taxRate?.toString() || "")
//       if (editItem.stockQuantity !== undefined) setValue('stockQuantity', editItem.stockQuantity.toString())
//       if (editItem.lowStockThreshold !== undefined) setValue('lowStockThreshold', editItem.lowStockThreshold.toString())
//       if (editItem.reorderPoint !== undefined) setValue('reorderPoint', editItem.reorderPoint?.toString() || "")

//       // Set select fields
//       if (editItem.categoryID !== undefined) {
//         setValue('categoryID', editItem.categoryID.toString())
//       }

//       if (editItem.brandID !== undefined) {
//         setValue('brandID', editItem.brandID?.toString() || "")
//       }

//       // Set unit value
//       if (editItem.unit !== undefined) {
//         setValue('unit', editItem.unit)
//       }
//     } else {
//       reset({
//         sku: "",
//         name: "",
//         description: "",
//         barcode: "",
//         purchasePrice: "0",
//         sellingPrice: "0",
//         taxRate: "",
//         stockQuantity: "0",
//         lowStockThreshold: "5",
//         unit: "Piece",
//         categoryID: "",
//         brandID: "",
//         reorderPoint: "",
//         location: "",
//         notes: "",
//       })
//     }
//   }, [editItem, setValue, reset])

//   const onSubmit = async (data: ProductFormData) => {
//     console.log("Form submitted with data:", data)

//     // Validate all fields before submission
//     const isValid = await trigger()
//     if (!isValid) {
//       toast.error("Please fix all errors before submitting")
//       return
//     }

//     setIsSubmitting(true)

//     // Generate barcode if not provided
//     if (!data.barcode) {
//       data.barcode = generateUniqueBarcode(data.sku, data.name)
//     }

//     const dataToSubmit = {
//       sku: data.sku,
//       name: data.name,
//       description: data.description || undefined,
//       barcode: data.barcode,
//       purchasePrice: data.purchasePrice,
//       sellingPrice: data.sellingPrice,
//       taxRate: data.taxRate || undefined,
//       stockQuantity: data.stockQuantity,
//       lowStockThreshold: data.lowStockThreshold,
//       unit: data.unit,
//       categoryID: data.categoryID,
//       brandID: data.brandID || undefined,
//       reorderPoint: data.reorderPoint || undefined,
//       location: data.location || undefined,
//       notes: data.notes || undefined,
//     }

//     console.log("Submitting product data:", dataToSubmit)

//     if (editItem?.productID) {
//       updateProduct(dataToSubmit)
//     } else {
//       createProduct(dataToSubmit)
//     }
//   }




//   // Function to handle barcode printing
//   const handlePrintBarcodes = () => {
//     console.log("Printing barcodes:", {
//       quantity: printQuantity,
//       barcode: generatedBarcode,
//       sku: productSkuForPrint
//     });

//     // Get current date for printing
//     const printDate = new Date().toLocaleDateString();

//     const printContent = `
//   <!DOCTYPE html>
//   <html>
//   <head>
//     <title>Print Barcodes - ${productSkuForPrint}</title>
//     <style>
//       @page {
//         size: auto;
//         margin: 0;
//       }
      
//       * {
//         margin: 0;
//         padding: 0;
//         box-sizing: border-box;
//       }

//       body {
//         width: 100%;
//         margin: 0 auto;
//         padding: 0;
//         font-family: sans-serif;
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: flex-start;
//         min-height: min-content;
//         box-sizing: border-box;
//         overflow: hidden;
//       }

//       .barcode-container {
//         width: 100%;
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//       }

//       .barcode-item {
//         width: 100%;
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: flex-start;
//         page-break-inside: avoid;
//         break-inside: avoid;
//         padding: 0;
//       }

//       .product-name {
//         font-size: 10px;
//         font-weight: bold;
//         margin-top: 1px;
//         margin-bottom: 1px;
//         text-align: center;
//         white-space: nowrap;
//         overflow: hidden;
//         text-overflow: ellipsis;
//         width: 95%;
//         line-height: 1.1;
//       }

//       .barcode-svg {
//         width: 95%;
//         height: 32px;
//         display: block;
//       }

//       .sku-text {
//         font-size: 10px;  
//         margin-top: 1px;
//         letter-spacing: 0.5px;
//         line-height: 1;
//         font-weight: 700;
//         text-align: center;
//       }

//       .date-text {
//         font-size: 6px;
//         margin-top: 1px;
//         margin-bottom: 2px;
//         color: #000;
//         line-height: 1;
//         text-align: center;
//       }

//       .barcode-number {
//         font-size: 10px;
//         margin-top: 1px;
//         letter-spacing: 0.5px;
//         font-weight: 700;
//         text-align: center;
//         font-family: 'Courier New', monospace;
//       }

//       /* For thermal printers - no background colors */
//       @media print {
//         body {
//           -webkit-print-color-adjust: exact;
//           print-color-adjust: exact;
//           width: 100%;
//           height: auto;
//         }

//         .barcode-item {
//           page-break-inside: avoid !important;
//           break-inside: avoid !important;
//         }

//         /* Thermal printer optimization */
//         * {
//           color: black !important;
//           background: transparent !important;
//         }
//       }
//     </style>
//   </head>

//   <body>
//     <div class="barcode-container">
//       ${Array.from({ length: printQuantity }).map((_, i) => `
//         <div class="barcode-item">
//           <svg class="barcode-svg" id="barcode-${i}"></svg>
//           <div class="sku-text">SKU: ${productSkuForPrint}</div>
//           <div class="barcode-number">${generatedBarcode}</div>
//           <div class="date-text">${printDate}</div>
//         </div>
//       `).join("")}
//     </div>

//     <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>

//     <script>
//       document.addEventListener('DOMContentLoaded', function() {
//         // Generate barcodes
//         ${Array.from({ length: printQuantity }).map((_, i) => `
//           try {
//             JsBarcode("#barcode-${i}", "${generatedBarcode}", {
//               format: "CODE128",
//               width: 2,
//               height: 40,
//               displayValue: false,
//               margin: 0,
//               background: "transparent",
//               lineColor: "#000000",
//               valid: function(valid) {
//                 if (!valid) {
//                   console.warn("Invalid barcode generated");
//                 }
//               }
//             });
//           } catch (error) {
//             console.error("Barcode generation error:", error);
//           }
//         `).join("")}

//         // Auto-print after a short delay
//         setTimeout(function() {
//           window.print();
//         }, 300);
//       });

//       // Handle after print
//       window.onafterprint = function() {
//         setTimeout(function() {
//           if (!document.hidden) {
//             window.close();
//           }
//         }, 1000);
//       };

//       // Fallback close if onafterprint doesn't fire
//       window.addEventListener('afterprint', function() {
//         setTimeout(function() {
//           window.close();
//         }, 1000);
//       });
//     </script>
//   </body>
//   </html>
//   `;

//     // Open print window
//     const printWindow = window.open("", "_blank");
//     if (!printWindow) {
//       alert("Please allow popups to print barcodes.");
//       return;
//     }

//     printWindow.document.write(printContent);
//     printWindow.document.close();
//   };



//   // Generate barcode on demand
//   const handleGenerateBarcode = () => {
//     if (formValues.sku && formValues.name) {
//       const barcode = generateUniqueBarcode(formValues.sku, formValues.name)
//       setValue("barcode", barcode)
//       toast.success("Barcode generated successfully!")
//     } else {
//       toast.error("Please enter SKU and Product Name first")
//     }
//   }

//   const isLoading = isCreating || isUpdating || categoriesLoading || brandsLoading || isSubmitting

//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle>{editItem ? "Edit Product" : "Add New Product"}</CardTitle>
//           <CardDescription>
//             {editItem ? "Update the product information below" : "Fill in the product details below"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Debug section - remove in production */}
//             <div className="p-2 mb-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
//               <p className="font-bold">Debug Info:</p>
//               <p>Form Values: {JSON.stringify(formValues, null, 2)}</p>
//               <p>Edit Mode: {editItem ? 'Yes' : 'No'}</p>
//               <p>Show Print Dialog: {showPrintDialog ? 'Yes' : 'No'}</p>
//               <p>Generated Barcode: {generatedBarcode}</p>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               {/* SKU */}
//               <div className="space-y-2">
//                 <Label htmlFor="sku">SKU *</Label>
//                 <Input
//                   id="sku"
//                   {...register("sku")}
//                   placeholder="PROD-001"
//                   disabled={isLoading}
//                   className={errors.sku ? "border-red-500" : ""}
//                 />
//                 {errors.sku && (
//                   <p className="text-sm text-red-500 mt-1">{errors.sku.message}</p>
//                 )}
//               </div>

//               {/* Product Name */}
//               <div className="space-y-2">
//                 <Label htmlFor="name">Product Name *</Label>
//                 <Input
//                   id="name"
//                   {...register("name")}
//                   placeholder="Premium Notebook"
//                   disabled={isLoading}
//                   className={errors.name ? "border-red-500" : ""}
//                 />
//                 {errors.name && (
//                   <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
//                 )}
//               </div>

//               {/* Barcode with generate button */}
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="barcode">Barcode</Label>
//                   {!editItem && (
//                     <Button
//                       type="button"
//                       variant="outline"
//                       size="sm"
//                       onClick={handleGenerateBarcode}
//                       disabled={isLoading || !formValues.sku || !formValues.name}
//                     >
//                       Generate
//                     </Button>
//                   )}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     id="barcode"
//                     {...register("barcode")}
//                     placeholder="Auto-generated barcode"
//                     disabled={isLoading}
//                     readOnly={!editItem}
//                     className="flex-1"
//                   />
//                   {formValues.barcode && (
//                     <Badge variant="secondary" className="flex items-center gap-1">
//                       {formValues.barcode.slice(0, 6)}...
//                     </Badge>
//                   )}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   {!editItem ? "Barcode will be auto-generated from SKU and name" : "Edit barcode if needed"}
//                 </p>
//               </div>

//               {/* Category */}
//               <div className="space-y-2">
//                 <Label htmlFor="categoryID">Category *</Label>
//                 <Select
//                   value={formValues.categoryID?.toString() || ""}
//                   onValueChange={(value) => setValue("categoryID", value)}
//                   disabled={isLoading || categoriesLoading}
//                 >
//                   <SelectTrigger className={errors.categoryID ? "border-red-500" : ""}>
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categoriesLoading ? (
//                       <SelectItem value="loading" disabled>
//                         Loading categories...
//                       </SelectItem>
//                     ) : categories.length === 0 ? (
//                       <SelectItem value="empty" disabled>
//                         No categories available
//                       </SelectItem>
//                     ) : (
//                       categories.map((category) => (
//                         <SelectItem key={category.categoryID} value={category.categoryID.toString()}>
//                           {category.name}
//                         </SelectItem>
//                       ))
//                     )}
//                   </SelectContent>
//                 </Select>
//                 {errors.categoryID && (
//                   <p className="text-sm text-red-500 mt-1">{errors.categoryID.message}</p>
//                 )}
//               </div>

//               {/* Brand (Optional) */}
//               <div className="space-y-2">
//                 <Label htmlFor="brandID">Brand</Label>
//                 <Select
//                   value={formValues.brandID?.toString() || ""}
//                   onValueChange={(value) => setValue("brandID", value)}
//                   disabled={isLoading || brandsLoading}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select brand (optional)" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {brandsLoading ? (
//                       <SelectItem value="loading" disabled>
//                         Loading brands...
//                       </SelectItem>
//                     ) : brands.length === 0 ? (
//                       <SelectItem value="empty" disabled>
//                         No brands available
//                       </SelectItem>
//                     ) : (
//                       brands.map((brand) => (
//                         <SelectItem key={brand.brandID} value={brand.brandID.toString()}>
//                           {brand.name}
//                         </SelectItem>
//                       ))
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Unit */}
//               <div className="space-y-2">
//                 <Label htmlFor="unit">Unit *</Label>
//                 <Select
//                   value={formValues.unit}
//                   onValueChange={(value) => setValue("unit", value)}
//                   disabled={isLoading}
//                 >
//                   <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
//                     <SelectValue placeholder="Select unit" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {UNITS.map((unit) => (
//                       <SelectItem key={unit.value} value={unit.value}>
//                         {unit.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.unit && (
//                   <p className="text-sm text-red-500 mt-1">{errors.unit.message}</p>
//                 )}
//                 <p className="text-xs text-muted-foreground">
//                   Format: Name (Short Code)
//                 </p>
//               </div>

//               {/* Purchase Price */}
//               <div className="space-y-2">
//                 <Label htmlFor="purchasePrice">Purchase Price *</Label>
//                 <Input
//                   id="purchasePrice"
//                   type="number"
//                   step="0.01"
//                   {...register("purchasePrice")}
//                   placeholder="10.50"
//                   disabled={isLoading}
//                   className={errors.purchasePrice ? "border-red-500" : ""}
//                 />
//                 {errors.purchasePrice && (
//                   <p className="text-sm text-red-500 mt-1">{errors.purchasePrice.message}</p>
//                 )}
//               </div>

//               {/* Selling Price */}
//               <div className="space-y-2">
//                 <Label htmlFor="sellingPrice">Selling Price *</Label>
//                 <Input
//                   id="sellingPrice"
//                   type="number"
//                   step="0.01"
//                   {...register("sellingPrice")}
//                   placeholder="15.99"
//                   disabled={isLoading}
//                   className={errors.sellingPrice ? "border-red-500" : ""}
//                 />
//                 {errors.sellingPrice && (
//                   <p className="text-sm text-red-500 mt-1">{errors.sellingPrice.message}</p>
//                 )}
//               </div>

//               {/* Stock Quantity */}
//               <div className="space-y-2">
//                 <Label htmlFor="stockQuantity">Stock Quantity *</Label>
//                 <Input
//                   id="stockQuantity"
//                   type="number"
//                   {...register("stockQuantity")}
//                   placeholder="100"
//                   disabled={isLoading}
//                   className={errors.stockQuantity ? "border-red-500" : ""}
//                 />
//                 {errors.stockQuantity && (
//                   <p className="text-sm text-red-500 mt-1">{errors.stockQuantity.message}</p>
//                 )}
//               </div>

//               {/* Low Stock Threshold */}
//               <div className="space-y-2">
//                 <Label htmlFor="lowStockThreshold">Low Stock Threshold *</Label>
//                 <Input
//                   id="lowStockThreshold"
//                   type="number"
//                   {...register("lowStockThreshold")}
//                   placeholder="5"
//                   disabled={isLoading}
//                   className={errors.lowStockThreshold ? "border-red-500" : ""}
//                 />
//                 {errors.lowStockThreshold && (
//                   <p className="text-sm text-red-500 mt-1">{errors.lowStockThreshold.message}</p>
//                 )}
//               </div>

//               {/* Tax Rate */}
//               <div className="space-y-2">
//                 <Label htmlFor="taxRate">Tax Rate (%)</Label>
//                 <Input
//                   id="taxRate"
//                   type="number"
//                   step="0.01"
//                   {...register("taxRate")}
//                   placeholder="7.5"
//                   disabled={isLoading}
//                 />
//               </div>

//               {/* Reorder Point */}
//               <div className="space-y-2">
//                 <Label htmlFor="reorderPoint">Reorder Point</Label>
//                 <Input
//                   id="reorderPoint"
//                   type="number"
//                   {...register("reorderPoint")}
//                   placeholder="10"
//                   disabled={isLoading}
//                 />
//               </div>

//               {/* Location */}
//               <div className="space-y-2">
//                 <Label htmlFor="location">Storage Location</Label>
//                 <Input
//                   id="location"
//                   {...register("location")}
//                   placeholder="Aisle 3, Shelf B"
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             {/* Description */}
//             <div className="space-y-2">
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 {...register("description")}
//                 placeholder="Enter product description..."
//                 rows={3}
//                 disabled={isLoading}
//                 className={errors.description ? "border-red-500" : ""}
//               />
//               {errors.description && (
//                 <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
//               )}
//               <p className="text-xs text-muted-foreground">
//                 {formValues.description?.length || 0}/1000 characters
//               </p>
//             </div>

//             {/* Notes */}
//             <div className="space-y-2">
//               <Label htmlFor="notes">Additional Notes</Label>
//               <Textarea
//                 id="notes"
//                 {...register("notes")}
//                 placeholder="Enter any additional notes..."
//                 rows={2}
//                 disabled={isLoading}
//                 className={errors.notes ? "border-red-500" : ""}
//               />
//               {errors.notes && (
//                 <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
//               )}
//               <p className="text-xs text-muted-foreground">
//                 {formValues.notes?.length || 0}/1000 characters
//               </p>
//             </div>

//             <div className="flex gap-3 pt-4">
//               {editItem && onCancel && (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={onCancel}
//                   disabled={isLoading}
//                   className="flex-1"
//                 >
//                   Cancel
//                 </Button>
//               )}
//               <Button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`${editItem && onCancel ? 'flex-1' : 'w-full'}`}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     {isSubmitting ? "Creating Product..." : "Processing..."}
//                   </>
//                 ) : (
//                   <>
//                     {editItem ? (
//                       "Update Product"
//                     ) : (
//                       <>
//                         <Plus className="mr-2 h-4 w-4" />
//                         Add Product
//                       </>
//                     )}
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>

//       {/* Print Barcode Dialog */}
//       <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Print Barcode Labels</DialogTitle>
//             <DialogDescription>
//               Print barcode labels for the newly created product.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <div className="text-sm font-medium mb-2">Product Information</div>
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <div className="text-gray-600">Product Name:</div>
//                 <div className="font-medium">{productNameForPrint}</div>

//                 <div className="text-gray-600">SKU:</div>
//                 <div className="font-medium">{productSkuForPrint}</div>

//                 <div className="text-gray-600">Barcode:</div>
//                 <div className="font-mono font-bold">{generatedBarcode}</div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="printQuantity">Number of labels to print</Label>
//               <div className="flex items-center gap-4">
//                 <Input
//                   id="printQuantity"
//                   type="number"
//                   min="1"
//                   max="100"
//                   value={printQuantity}
//                   onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
//                   className="w-24"
//                 />
//                 <div className="flex gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setPrintQuantity(prev => Math.max(1, prev - 1))}
//                   >
//                     -
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setPrintQuantity(prev => Math.min(100, prev + 1))}
//                   >
//                     +
//                   </Button>
//                 </div>
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Each page can fit approximately 4 labels
//               </p>
//             </div>

//             <div className="p-4 border rounded-lg">
//               <div className="text-sm font-medium mb-2">Preview</div>
//               <div className="text-center p-4 bg-white border">
//                 <div className="font-bold text-lg">{productNameForPrint}</div>
//                 <div className="text-sm text-gray-600 mb-2">SKU: {productSkuForPrint}</div>
//                 <div className="font-mono text-xl tracking-widest mb-2">{generatedBarcode}</div>
//                 <div className="text-xs text-gray-500">
//                   Generated: {new Date().toLocaleDateString()}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <DialogFooter className="flex gap-2 sm:justify-between">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setShowPrintDialog(false)}
//             >
//               <X className="mr-2 h-4 w-4" />
//               Skip Printing
//             </Button>
//             <Button
//               type="button"
//               onClick={handlePrintBarcodes}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               <Printer className="mr-2 h-4 w-4" />
//               Print {printQuantity} Label{printQuantity > 1 ? 's' : ''}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }