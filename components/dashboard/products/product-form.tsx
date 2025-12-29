"use client"

import { useEffect } from "react"
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

interface ProductFormProps {
  editItem?: any
  onSuccess?: () => void
  onCancel?: () => void
}

// Create units array from PREDEFINED_UNITS for the select dropdown
// Use 'name' as value since backend expects full unit names
const UNITS = PREDEFINED_UNITS.map(unit => ({
  value: unit.name,  // Using full name as value to match backend enum
  label: `${unit.name} (${unit.shortName})`
}))

// Sort units alphabetically for better UX
UNITS.sort((a, b) => a.label.localeCompare(b.label))

const productSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50, "SKU must be less than 50 characters"),
  name: z.string().min(1, "Product name is required").max(200, "Product name must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  barcode: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      barcode: "",
      purchasePrice: "0",
      sellingPrice: "0",
      taxRate: "",
      stockQuantity: "0",
      lowStockThreshold: "5",
      unit: "Piece", // Default to "Piece" (full name)
      categoryID: "",
      brandID: "",
      reorderPoint: "",
      location: "",
      notes: "",
    }
  })

  const formValues = watch()

  console.log("formValues", formValues);


  const { mutate: createProduct, isPending: isCreating } = usePost(
    "/products",
    (data: any) => {
      if (data?.statusCode >= 200 && data?.statusCode < 300) {
        // toast.success("Product created successfully!")
        reset()
        // Invalidate product queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["products"] })
        onSuccess?.()
      } else {
        toast.error(data?.message || "Failed to save product")
      }
    },
    (error: any) => {
      toast.error(error?.message || "Failed to save product")
    }
  )

  const { mutate: updateProduct, isPending: isUpdating } = usePatch(
    `/products/${editItem?.productID}`,
    (data: any) => {
      if (data?.statusCode >= 200 && data?.statusCode < 300) {
        toast.success("Product updated successfully!")
        reset()
        // Invalidate product queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["products"] })
        onSuccess?.()
      } else {
        toast.error(data?.message || "Failed to update product")
      }
    },
    (error: any) => {
      toast.error(error?.message || "Failed to update product")
    }
  )

  useEffect(() => {
    if (editItem) {
      console.log("Setting edit item data:", editItem)

      // Set all form values from editItem
      const fields = [
        'sku', 'name', 'description', 'barcode', 'location', 'notes'
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

      // Set select fields - ensure they're strings
      if (editItem.categoryID !== undefined) {
        console.log("Setting categoryID:", editItem.categoryID.toString())
        setValue('categoryID', editItem.categoryID.toString())
      }

      if (editItem.brandID !== undefined) {
        console.log("Setting brandID:", editItem.brandID?.toString() || "")
        setValue('brandID', editItem.brandID?.toString() || "")
      }

      // Set unit value
      if (editItem.unit !== undefined) {
        console.log("Setting unit:", editItem.unit)
        setValue('unit', editItem.unit)
      }
    } else {
      reset({
        sku: "",
        name: "",
        description: "",
        barcode: "",
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

  // Additional useEffect to debug and ensure selects are properly set
  useEffect(() => {
    if (editItem && categories.length > 0 && brands.length > 0) {
      console.log("Categories loaded, current form values:", {
        categoryID: formValues.categoryID,
        brandID: formValues.brandID,
        unit: formValues.unit,
        categories: categories.map(c => ({ id: c.categoryID, name: c.name })),
        brands: brands.map(b => ({ id: b.brandID, name: b.name }))
      })
    }
  }, [categories, brands, editItem, formValues])

  const onSubmit = (data: ProductFormData) => {
    // Prepare data for API submission
    const dataToSubmit = {
      sku: data.sku,
      name: data.name,
      description: data.description || undefined,
      barcode: data.barcode || undefined,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      taxRate: data.taxRate || undefined,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
      unit: data.unit, // This will be the full unit name like "Piece", "Kilogram"
      categoryID: data.categoryID,
      brandID: data.brandID || undefined,
      reorderPoint: data.reorderPoint || undefined,
      location: data.location || undefined,
      notes: data.notes || undefined,
    }

    console.log("Submitting product data:", dataToSubmit)

    if (editItem?.productID) {
      updateProduct(dataToSubmit)
    } else {
      createProduct(dataToSubmit)
    }
  }

  const isLoading = isCreating || isUpdating || categoriesLoading || brandsLoading

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editItem ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {editItem ? "Update the product information below" : "Fill in the product details below"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Debug information - remove in production */}
          <div className="hidden">
            <p>CategoryID: {formValues.categoryID}</p>
            <p>BrandID: {formValues.brandID}</p>
            <p>Unit: {formValues.unit}</p>
            <p>Categories Loaded: {categories.length}</p>
            <p>Brands Loaded: {brands.length}</p>
          </div>

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


            {!editItem && <><div className="space-y-2">
              <Label htmlFor="categoryID">Category *</Label>
              <Select
                value={formValues.categoryID?.toString() || ""}
                onValueChange={(value) => setValue("categoryID", value)}
                disabled={isLoading || categoriesLoading}
              >
                <SelectTrigger className={errors.categoryID ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category">
                    {formValues.categoryID
                      ? categories.find(c => c.categoryID.toString() === formValues.categoryID)?.name
                      : "Select category"
                    }
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

              {/* Brand (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="brandID">Brand</Label>
                <Select
                  value={formValues.brandID?.toString() || ""}
                  onValueChange={(value) => setValue("brandID", value)}
                  disabled={isLoading || brandsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand (optional)">
                      {formValues.brandID
                        ? brands.find(b => b.brandID.toString() === formValues.brandID)?.name
                        : "Select brand (optional)"
                      }
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

              {/* Unit */}
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formValues.unit}
                  onValueChange={(value) => setValue("unit", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select unit">
                      {formValues.unit
                        ? UNITS.find(u => u.value === formValues.unit)?.label
                        : "Select unit"
                      }
                    </SelectValue>
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
              </div></>}

            {/* Category */}


            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                {...register("barcode")}
                placeholder="123456789012"
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
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                {...register("taxRate")}
                placeholder="7.5"
                disabled={isLoading}
              />
            </div>

            {/* Reorder Point */}
            <div className="space-y-2">
              <Label htmlFor="reorderPoint">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                {...register("reorderPoint")}
                placeholder="10"
                disabled={isLoading}
              />
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
          <div className="space-y-2">
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
          </div>

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
                  Processing...
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
  )
}
// "use client"

// import { useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Loader2, Plus } from "lucide-react"
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

// interface ProductFormProps {
//   editItem?: any
//   onSuccess?: () => void
//   onCancel?: () => void
// }

// // Create units array from PREDEFINED_UNITS for the select dropdown
// // Use 'name' as value since backend expects full unit names
// const UNITS = PREDEFINED_UNITS.map(unit => ({
//   value: unit.name,  // Using full name as value to match backend enum
//   label: `${unit.name} (${unit.shortName})`
// }))

// // Sort units alphabetically for better UX
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

// export function ProductForm({ editItem, onSuccess, onCancel }: ProductFormProps) {
//   const queryClient = useQueryClient()
//   const { categories, isLoading: categoriesLoading } = useCategoriesDropdown()
//   const { brands, isLoading: brandsLoading } = useBrandsDropdown()

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//     watch,
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
//       unit: "Piece", // Default to "Piece" (full name)
//       categoryID: "",
//       brandID: "",
//       reorderPoint: "",
//       location: "",
//       notes: "",
//     }
//   })

//   const formValues = watch()

//   console.log("formValues", formValues);


//   const { mutate: createProduct, isPending: isCreating } = usePost(
//     "/products",
//     (data: any) => {
//       if (data?.statusCode >= 200 && data?.statusCode < 300) {
//         // toast.success("Product created successfully!")
//         reset()
//         // Invalidate product queries to refresh data
//         queryClient.invalidateQueries({ queryKey: ["products"] })
//         onSuccess?.()
//       } else {
//         toast.error(data?.message || "Failed to save product")
//       }
//     },
//     (error: any) => {
//       toast.error(error?.message || "Failed to save product")
//     }
//   )

//   const { mutate: updateProduct, isPending: isUpdating } = usePatch(
//     `/products/${editItem?.productID}`,
//     (data: any) => {
//       if (data?.statusCode >= 200 && data?.statusCode < 300) {
//         toast.success("Product updated successfully!")
//         reset()
//         // Invalidate product queries to refresh data
//         queryClient.invalidateQueries({ queryKey: ["products"] })
//         onSuccess?.()
//       } else {
//         toast.error(data?.message || "Failed to update product")
//       }
//     },
//     (error: any) => {
//       toast.error(error?.message || "Failed to update product")
//     }
//   )

//   useEffect(() => {
//     if (editItem) {
//       console.log("Setting edit item data:", editItem)

//       // Set all form values from editItem
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

//       // Set select fields - ensure they're strings
//       if (editItem.categoryID !== undefined) {
//         console.log("Setting categoryID:", editItem.categoryID.toString())
//         setValue('categoryID', editItem.categoryID.toString())
//       }

//       if (editItem.brandID !== undefined) {
//         console.log("Setting brandID:", editItem.brandID?.toString() || "")
//         setValue('brandID', editItem.brandID?.toString() || "")
//       }

//       // Set unit value
//       if (editItem.unit !== undefined) {
//         console.log("Setting unit:", editItem.unit)
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

//   // Additional useEffect to debug and ensure selects are properly set
//   useEffect(() => {
//     if (editItem && categories.length > 0 && brands.length > 0) {
//       console.log("Categories loaded, current form values:", {
//         categoryID: formValues.categoryID,
//         brandID: formValues.brandID,
//         unit: formValues.unit,
//         categories: categories.map(c => ({ id: c.categoryID, name: c.name })),
//         brands: brands.map(b => ({ id: b.brandID, name: b.name }))
//       })
//     }
//   }, [categories, brands, editItem, formValues])

//   const onSubmit = (data: ProductFormData) => {
//     // Prepare data for API submission
//     const dataToSubmit = {
//       sku: data.sku,
//       name: data.name,
//       description: data.description || undefined,
//       barcode: data.barcode || undefined,
//       purchasePrice: data.purchasePrice,
//       sellingPrice: data.sellingPrice,
//       taxRate: data.taxRate || undefined,
//       stockQuantity: data.stockQuantity,
//       lowStockThreshold: data.lowStockThreshold,
//       unit: data.unit, // This will be the full unit name like "Piece", "Kilogram"
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

//   const isLoading = isCreating || isUpdating || categoriesLoading || brandsLoading

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{editItem ? "Edit Product" : "Add New Product"}</CardTitle>
//         <CardDescription>
//           {editItem ? "Update the product information below" : "Fill in the product details below"}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           {/* Debug information - remove in production */}
//           <div className="hidden">
//             <p>CategoryID: {formValues.categoryID}</p>
//             <p>BrandID: {formValues.brandID}</p>
//             <p>Unit: {formValues.unit}</p>
//             <p>Categories Loaded: {categories.length}</p>
//             <p>Brands Loaded: {brands.length}</p>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2">
//             {/* SKU */}
//             <div className="space-y-2">
//               <Label htmlFor="sku">SKU *</Label>
//               <Input
//                 id="sku"
//                 {...register("sku")}
//                 placeholder="PROD-001"
//                 disabled={isLoading}
//                 className={errors.sku ? "border-red-500" : ""}
//               />
//               {errors.sku && (
//                 <p className="text-sm text-red-500 mt-1">{errors.sku.message}</p>
//               )}
//             </div>

//             {/* Product Name */}
//             <div className="space-y-2">
//               <Label htmlFor="name">Product Name *</Label>
//               <Input
//                 id="name"
//                 {...register("name")}
//                 placeholder="Premium Notebook"
//                 disabled={isLoading}
//                 className={errors.name ? "border-red-500" : ""}
//               />
//               {errors.name && (
//                 <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
//               )}
//             </div>

//             {/* Category */}
//             <div className="space-y-2">
//               <Label htmlFor="categoryID">Category *</Label>
//               <Select
//                 value={formValues.categoryID?.toString() || ""}
//                 onValueChange={(value) => setValue("categoryID", value)}
//                 disabled={isLoading || categoriesLoading}
//               >
//                 <SelectTrigger className={errors.categoryID ? "border-red-500" : ""}>
//                   <SelectValue placeholder="Select category">
//                     {formValues.categoryID
//                       ? categories.find(c => c.categoryID.toString() === formValues.categoryID)?.name
//                       : "Select category"
//                     }
//                   </SelectValue>
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categoriesLoading ? (
//                     <SelectItem value="loading" disabled>
//                       Loading categories...
//                     </SelectItem>
//                   ) : categories.length === 0 ? (
//                     <SelectItem value="empty" disabled>
//                       No categories available
//                     </SelectItem>
//                   ) : (
//                     categories.map((category) => (
//                       <SelectItem key={category.categoryID} value={category.categoryID.toString()}>
//                         {category.name}
//                       </SelectItem>
//                     ))
//                   )}
//                 </SelectContent>
//               </Select>
//               {errors.categoryID && (
//                 <p className="text-sm text-red-500 mt-1">{errors.categoryID.message}</p>
//               )}
//             </div>

//             {/* Brand (Optional) */}
//             <div className="space-y-2">
//               <Label htmlFor="brandID">Brand</Label>
//               <Select
//                 value={formValues.brandID?.toString() || ""}
//                 onValueChange={(value) => setValue("brandID", value)}
//                 disabled={isLoading || brandsLoading}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select brand (optional)">
//                     {formValues.brandID
//                       ? brands.find(b => b.brandID.toString() === formValues.brandID)?.name
//                       : "Select brand (optional)"
//                     }
//                   </SelectValue>
//                 </SelectTrigger>
//                 <SelectContent>
//                   {brandsLoading ? (
//                     <SelectItem value="loading" disabled>
//                       Loading brands...
//                     </SelectItem>
//                   ) : brands.length === 0 ? (
//                     <SelectItem value="empty" disabled>
//                       No brands available
//                     </SelectItem>
//                   ) : (
//                     brands.map((brand) => (
//                       <SelectItem key={brand.brandID} value={brand.brandID.toString()}>
//                         {brand.name}
//                       </SelectItem>
//                     ))
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Unit */}
//             <div className="space-y-2">
//               <Label htmlFor="unit">Unit *</Label>
//               <Select
//                 value={formValues.unit}
//                 onValueChange={(value) => setValue("unit", value)}
//                 disabled={isLoading}
//               >
//                 <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
//                   <SelectValue placeholder="Select unit">
//                     {formValues.unit
//                       ? UNITS.find(u => u.value === formValues.unit)?.label
//                       : "Select unit"
//                     }
//                   </SelectValue>
//                 </SelectTrigger>
//                 <SelectContent>
//                   {UNITS.map((unit) => (
//                     <SelectItem key={unit.value} value={unit.value}>
//                       {unit.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {errors.unit && (
//                 <p className="text-sm text-red-500 mt-1">{errors.unit.message}</p>
//               )}
//               <p className="text-xs text-muted-foreground">
//                 Format: Name (Short Code)
//               </p>
//             </div>

//             {/* Barcode */}
//             <div className="space-y-2">
//               <Label htmlFor="barcode">Barcode</Label>
//               <Input
//                 id="barcode"
//                 {...register("barcode")}
//                 placeholder="123456789012"
//                 disabled={isLoading}
//               />
//             </div>

//             {/* Purchase Price */}
//             <div className="space-y-2">
//               <Label htmlFor="purchasePrice">Purchase Price *</Label>
//               <Input
//                 id="purchasePrice"
//                 type="number"
//                 step="0.01"
//                 {...register("purchasePrice")}
//                 placeholder="10.50"
//                 disabled={isLoading}
//                 className={errors.purchasePrice ? "border-red-500" : ""}
//               />
//               {errors.purchasePrice && (
//                 <p className="text-sm text-red-500 mt-1">{errors.purchasePrice.message}</p>
//               )}
//             </div>

//             {/* Selling Price */}
//             <div className="space-y-2">
//               <Label htmlFor="sellingPrice">Selling Price *</Label>
//               <Input
//                 id="sellingPrice"
//                 type="number"
//                 step="0.01"
//                 {...register("sellingPrice")}
//                 placeholder="15.99"
//                 disabled={isLoading}
//                 className={errors.sellingPrice ? "border-red-500" : ""}
//               />
//               {errors.sellingPrice && (
//                 <p className="text-sm text-red-500 mt-1">{errors.sellingPrice.message}</p>
//               )}
//             </div>

//             {/* Stock Quantity */}
//             <div className="space-y-2">
//               <Label htmlFor="stockQuantity">Stock Quantity *</Label>
//               <Input
//                 id="stockQuantity"
//                 type="number"
//                 {...register("stockQuantity")}
//                 placeholder="100"
//                 disabled={isLoading}
//                 className={errors.stockQuantity ? "border-red-500" : ""}
//               />
//               {errors.stockQuantity && (
//                 <p className="text-sm text-red-500 mt-1">{errors.stockQuantity.message}</p>
//               )}
//             </div>

//             {/* Low Stock Threshold */}
//             <div className="space-y-2">
//               <Label htmlFor="lowStockThreshold">Low Stock Threshold *</Label>
//               <Input
//                 id="lowStockThreshold"
//                 type="number"
//                 {...register("lowStockThreshold")}
//                 placeholder="5"
//                 disabled={isLoading}
//                 className={errors.lowStockThreshold ? "border-red-500" : ""}
//               />
//               {errors.lowStockThreshold && (
//                 <p className="text-sm text-red-500 mt-1">{errors.lowStockThreshold.message}</p>
//               )}
//             </div>

//             {/* Tax Rate */}
//             <div className="space-y-2">
//               <Label htmlFor="taxRate">Tax Rate (%)</Label>
//               <Input
//                 id="taxRate"
//                 type="number"
//                 step="0.01"
//                 {...register("taxRate")}
//                 placeholder="7.5"
//                 disabled={isLoading}
//               />
//             </div>

//             {/* Reorder Point */}
//             <div className="space-y-2">
//               <Label htmlFor="reorderPoint">Reorder Point</Label>
//               <Input
//                 id="reorderPoint"
//                 type="number"
//                 {...register("reorderPoint")}
//                 placeholder="10"
//                 disabled={isLoading}
//               />
//             </div>

//             {/* Location */}
//             <div className="space-y-2">
//               <Label htmlFor="location">Storage Location</Label>
//               <Input
//                 id="location"
//                 {...register("location")}
//                 placeholder="Aisle 3, Shelf B"
//                 disabled={isLoading}
//               />
//             </div>
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               {...register("description")}
//               placeholder="Enter product description..."
//               rows={3}
//               disabled={isLoading}
//               className={errors.description ? "border-red-500" : ""}
//             />
//             {errors.description && (
//               <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
//             )}
//             <p className="text-xs text-muted-foreground">
//               {formValues.description?.length || 0}/1000 characters
//             </p>
//           </div>

//           {/* Notes */}
//           <div className="space-y-2">
//             <Label htmlFor="notes">Additional Notes</Label>
//             <Textarea
//               id="notes"
//               {...register("notes")}
//               placeholder="Enter any additional notes..."
//               rows={2}
//               disabled={isLoading}
//               className={errors.notes ? "border-red-500" : ""}
//             />
//             {errors.notes && (
//               <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
//             )}
//             <p className="text-xs text-muted-foreground">
//               {formValues.notes?.length || 0}/1000 characters
//             </p>
//           </div>

//           <div className="flex gap-3 pt-4">
//             {editItem && onCancel && (
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={onCancel}
//                 disabled={isLoading}
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//             )}
//             <Button
//               type="submit"
//               disabled={isLoading}
//               className={`${editItem && onCancel ? 'flex-1' : 'w-full'}`}
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   {editItem ? (
//                     "Update Product"
//                   ) : (
//                     <>
//                       <Plus className="mr-2 h-4 w-4" />
//                       Add Product
//                     </>
//                   )}
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }