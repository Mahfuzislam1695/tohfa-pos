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
import { Switch } from "@/components/ui/switch"

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
  const [includeNameInSku, setIncludeNameInSku] = useState(true)
  const [nameCodeLength, setNameCodeLength] = useState(3)

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

  // Function to generate code from any text
  const generateCode = (text: string, length: number = 3): string => {
    if (!text) return ''

    // Remove special characters and convert to uppercase
    const cleanText = text.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase()

    // Strategy 1: Use first letters of each word
    const words = cleanText.split(' ')
    if (words.length > 1) {
      const firstLetters = words.map(w => w[0]).join('')
      return firstLetters.substring(0, Math.min(length, firstLetters.length))
    }

    // Strategy 2: For single word, use first X letters
    if (cleanText.length <= length) {
      return cleanText
    }

    // Strategy 3: Use first 2 letters + last letter for longer words
    if (length === 3) {
      return cleanText.substring(0, 2) + cleanText[cleanText.length - 1]
    }

    // Strategy 4: Use vowels and consonants for better readability
    const vowels = 'AEIOU'
    const consonants = cleanText.replace(/[AEIOU]/gi, '')

    if (consonants.length >= 2 && vowels.length >= 1 && length >= 3) {
      return (consonants.substring(0, 2) + vowels[0]).substring(0, length)
    }

    // Fallback: First X characters
    return cleanText.substring(0, length)
  }

  // Function to generate category code
  const generateCategoryCode = (categoryName: string): string => {
    return generateCode(categoryName, 3) || 'GEN'
  }

  // Function to generate brand code
  const generateBrandCode = (brandName: string): string => {
    return generateCode(brandName, 3) || 'NBR'
  }

  // Function to generate name code
  const generateNameCode = (productName: string): string => {
    if (!productName) return 'PRO'

    // For product names, we can use different strategies
    const words = productName.split(' ')

    // Strategy 1: If name has multiple words, use first letters
    if (words.length > 1) {
      const firstLetters = words.map(w => w[0]).join('')
      return firstLetters.substring(0, Math.min(nameCodeLength, firstLetters.length))
    }

    // Strategy 2: For single word, try to create pronounceable code
    const word = productName.toUpperCase()

    if (nameCodeLength === 3) {
      // Try to create codes like "IPH" for iPhone, "MAC" for MacBook
      if (word.includes('PHONE') || word.includes('IPHONE')) return 'PHN'
      if (word.includes('BOOK') || word.includes('NOTEBOOK')) return 'NBK'
      if (word.includes('LAPTOP')) return 'LTP'
      if (word.includes('TABLET')) return 'TAB'
      if (word.includes('CAMERA')) return 'CAM'
      if (word.includes('PRINTER')) return 'PRT'
      if (word.includes('MONITOR')) return 'MON'
      if (word.includes('KEYBOARD')) return 'KBD'
      if (word.includes('MOUSE')) return 'MOU'
      if (word.includes('HEADPHONE')) return 'HPN'
      if (word.includes('SPEAKER')) return 'SPK'
      if (word.includes('CHARGER')) return 'CHG'
      if (word.includes('CABLE')) return 'CBL'
      if (word.includes('ADAPTER')) return 'ADP'
      if (word.includes('BATTERY')) return 'BAT'

      // Use first 2 letters + last letter for single words
      return word.substring(0, 2) + word[word.length - 1]
    }

    // For longer codes, use more characters
    return generateCode(productName, nameCodeLength)
  }

  // Function to generate SKU with product name included
  const generateSku = (): string => {
    const categoryCode = selectedCategory ? generateCategoryCode(selectedCategory.name) : 'GEN'
    const brandCode = selectedBrand ? generateBrandCode(selectedBrand.name) : 'NBR'
    const nameCode = includeNameInSku && formValues.name ? generateNameCode(formValues.name) : ''

    // Different formats based on preferences
    if (includeNameInSku && nameCode) {
      // Format 1: CAT-PRODCODE-001 (Category-ProductCode-Sequence)
      return `${categoryCode}-${nameCode}-${skuSequence.toString().padStart(3, '0')}`

      // Alternative format if you want to include brand too:
      // return `${categoryCode}-${brandCode}-${nameCode}-${skuSequence.toString().padStart(3, '0')}`
    } else {
      // Format 2: CAT-BRD-001 (Category-Brand-Sequence)
      return `${categoryCode}-${brandCode}-${skuSequence.toString().padStart(3, '0')}`
    }
  }

  // Auto-generate SKU when relevant fields change
  useEffect(() => {
    if (skuFormat === 'auto' && !editItem) {
      const newSku = generateSku()
      setValue('sku', newSku)
    }
  }, [formValues.categoryID, formValues.brandID, formValues.name, skuSequence, skuFormat, includeNameInSku, nameCodeLength, editItem])

  // Suggest SKU formats based on selected category, brand, and product name
  const suggestedSkuFormats = useMemo(() => {
    const suggestions = []

    if (selectedCategory || formValues.name) {
      const catCode = selectedCategory ? generateCategoryCode(selectedCategory.name) : 'CAT'
      const brandCode = selectedBrand ? generateBrandCode(selectedBrand.name) : 'BRD'
      const nameCode = formValues.name ? generateNameCode(formValues.name) : 'PRO'

      // Format 1: CAT-PROD-001 (Category-Product-Sequence) - Most descriptive
      suggestions.push(`${catCode}-${nameCode}-001`)

      // Format 2: CAT-BRD-PROD-001 (Category-Brand-Product-Sequence) - Most detailed
      suggestions.push(`${catCode}-${brandCode}-${nameCode}-001`)

      // Format 3: PROD-COLOR-SIZE (Product-Color-Size) - Good for variants
      if (formValues.name.includes('Red') || formValues.name.includes('Blue') || formValues.name.includes('Black')) {
        const color = formValues.name.includes('Red') ? 'RED' :
          formValues.name.includes('Blue') ? 'BLU' :
            formValues.name.includes('Black') ? 'BLK' : 'COL'
        suggestions.push(`${nameCode}-${color}-SM`)
      }

      // Format 4: CAT-PROD-BRD-001 (Category-Product-Brand-Sequence)
      suggestions.push(`${catCode}-${nameCode}-${brandCode}-001`)

      // Format 5: Year-Month-Product-Sequence
      const today = new Date()
      const yearMonth = `${today.getFullYear().toString().slice(2)}${(today.getMonth() + 1).toString().padStart(2, '0')}`
      suggestions.push(`${yearMonth}-${nameCode}-001`)

      // Format 6: Simple memorable format
      const memorableCode = formValues.name
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 6)
        .toUpperCase()
      if (memorableCode.length >= 4) {
        suggestions.push(`${catCode}-${memorableCode}`)
      }
    }

    return suggestions.slice(0, 5) // Limit to 5 suggestions
  }, [selectedCategory, selectedBrand, formValues.name])

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

  // Handle print completion
  const handlePrintComplete = () => {
    console.log("Print completed")
  }

  const { mutate: createProduct, isPending: isCreating } = usePost(
    "/products",
    (data: any) => {
      setIsSubmitting(false)

      console.log("Create product response:", data)

      if (data?.statusCode >= 200 && data?.statusCode < 300) {
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
        // toast.success("Product updated successfully!")
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
      setIncludeNameInSku(true)
    }
  }, [editItem, setValue, reset])

  const onSubmit = async (data: ProductFormData) => {
    console.log("Form submitted with data:", data)

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

    console.log("Submitting product data:", dataToSubmit)

    if (editItem?.productID) {
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
              {/* SKU Section - Full width */}
              {!editItem && (
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sku" className="text-base">
                      Product SKU (Stock Keeping Unit) *
                      <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary">
                        <Sparkles className="h-3 w-3" />
                        High Uniqueness & Presentability
                      </span>
                    </Label>
                    {!editItem && (
                      <div className="flex items-center gap-2">
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

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="sku"
                        {...register("sku")}
                        placeholder={skuFormat === 'auto' ? generateSku() : "Enter custom SKU"}
                        disabled={isLoading || skuFormat === 'auto'}
                        className={`font-mono text-lg ${errors.sku ? "border-red-500" : ""}`}
                        value={formValues.sku}
                        onChange={(e) => setValue('sku', e.target.value.toUpperCase())}
                      />
                    </div>
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
                  </div>

                  {errors.sku && (
                    <p className="text-sm text-red-500 mt-1">{errors.sku.message}</p>
                  )}

                  {/* SKU Generation Settings */}
                  {!editItem && skuFormat === 'auto' && (
                    <div className="mt-4 p-3 bg-muted rounded-md space-y-3 hidden">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">Include Product Name in SKU</p>
                          <p className="text-xs text-muted-foreground">
                            Makes SKU more descriptive and unique
                          </p>
                        </div>
                        <Switch
                          checked={includeNameInSku}
                          onCheckedChange={setIncludeNameInSku}
                        />
                      </div>

                      {includeNameInSku && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Name Code Length</p>
                          <div className="flex gap-2">
                            {[2, 3, 4, 5].map((length) => (
                              <Badge
                                key={length}
                                variant={nameCodeLength === length ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setNameCodeLength(length)}
                              >
                                {length} chars
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Current name code: {generateNameCode(formValues.name) || 'Enter name above'}
                          </p>
                        </div>
                      )}

                      {/* Current SKU Breakdown */}
                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold mb-2">Current SKU Breakdown:</p>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-background p-2 rounded">
                            <div className="font-bold">Category</div>
                            <div className="font-mono">{generateCategoryCode(selectedCategory?.name || 'General')}</div>
                          </div>
                          {includeNameInSku && (
                            <div className="bg-background p-2 rounded">
                              <div className="font-bold">Product</div>
                              <div className="font-mono">{generateNameCode(formValues.name) || '---'}</div>
                            </div>
                          )}
                          {!includeNameInSku && selectedBrand && (
                            <div className="bg-background p-2 rounded">
                              <div className="font-bold">Brand</div>
                              <div className="font-mono">{generateBrandCode(selectedBrand.name)}</div>
                            </div>
                          )}
                          <div className="bg-background p-2 rounded">
                            <div className="font-bold">Sequence</div>
                            <div className="font-mono">{skuSequence.toString().padStart(3, '0')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggested Formats */}
                  {!editItem && formValues.name && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">Suggested SKU Formats for "{formValues.name.substring(0, 20)}..."</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSkuFormats.map((suggestion, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="font-mono text-sm cursor-pointer hover:bg-secondary/80 hover:scale-105 transition-transform"
                            onClick={() => {
                              setValue('sku', suggestion)
                              if (skuFormat === 'auto') setSkuFormat('manual')
                            }}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                </div>)}

              {/* Product Name - Right after SKU */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="iPhone 15 Pro Max 256GB"
                  disabled={isLoading}
                  className={errors.name ? "border-red-500" : ""}
                  onBlur={() => {
                    // Auto-generate name-based SKU when name changes
                    if (skuFormat === 'auto' && includeNameInSku && formValues.name) {
                      setValue('sku', generateSku())
                    }
                  }}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
                {formValues.name && includeNameInSku && (
                  <p className="text-xs text-muted-foreground">
                    Name code: <code className="bg-muted px-1 rounded font-mono">{generateNameCode(formValues.name)}</code>
                  </p>
                )}
              </div>

              {/* Barcode */}
              {/* {editItem && (
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="barcode"
                      defaultValue={editItem.barcode || ""}
                      placeholder="Generated from SKU"
                      disabled={true}
                      className="font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Barcode is automatically generated from SKU
                  </p>
                </div>
              )} */}

              {/* Category */}
              {!editItem && (<div className="space-y-2">
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
                {selectedCategory && (
                  <p className="text-xs text-muted-foreground">
                    Category code: <code className="bg-muted px-1 rounded font-mono">{generateCategoryCode(selectedCategory.name)}</code>
                  </p>
                )}
              </div>)}


              {/* Brand */}
              {!editItem && (
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
                  {selectedBrand && (
                    <p className="text-xs text-muted-foreground">
                      Brand code: <code className="bg-muted px-1 rounded font-mono">{generateBrandCode(selectedBrand.name)}</code>
                    </p>
                  )}
                </div>)}

              {/* Rest of the form fields remain the same */}
              {!editItem && (
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
                </div>)}

              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Aisle 3, Shelf B"
                  disabled={isLoading}
                />
              </div>

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
// import { BarcodePrint } from "./barcode-print"

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

//   // State for barcode printing
//   const [showPrintDialog, setShowPrintDialog] = useState(false)
//   const [printData, setPrintData] = useState({
//     productName: "",
//     productSku: "",
//     barcode: "",
//     productPrice: "",
//     sellingPrice: ""
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)

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

//   // Handle print dialog close
//   const handlePrintDialogClose = () => {
//     setShowPrintDialog(false)
//     // Call onSuccess after printing dialog is closed
//     onSuccess?.()
//   }

//   // Handle print completion
//   const handlePrintComplete = () => {
//     console.log("Print completed")
//   }

//   // Update the ProductForm success handler
//   const { mutate: createProduct, isPending: isCreating } = usePost(
//     "/products",
//     (data: any) => {
//       setIsSubmitting(false)

//       console.log("Create product response:", data)

//       if (data?.statusCode >= 200 && data?.statusCode < 300) {
//         // toast.success("Product created successfully!")

//         // Get barcode from backend response
//         const barcode = data.data?.barcode
//         const productName = data.data?.name
//         const productSku = data.data?.sku

//         console.log("Backend generated barcode:", barcode)

//         // Reset form
//         reset()
//         queryClient.invalidateQueries({ queryKey: ["products"] })

//         // Show print dialog if barcode was generated
//         if (barcode) {
//           setPrintData({
//             productName: productName || formValues.name,
//             productSku: productSku || formValues.sku,
//             barcode,
//             sellingPrice: (formValues.sellingPrice?.toString() || "0")
//           })
//           setShowPrintDialog(true)
//         } else {
//           // If no barcode, just call success
//           onSuccess?.()
//         }
//       } else {
//         toast.error(data?.message || "Failed to save product")
//         // onSuccess?.() // Still call onSuccess to close modal
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
//         'sku', 'name', 'description', 'location', 'notes'
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

//     // DO NOT include barcode in request - backend will generate it
//     const dataToSubmit = {
//       sku: data.sku,
//       name: data.name,
//       description: data.description || undefined,
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

//     console.log("Submitting product data (no barcode):", dataToSubmit)

//     if (editItem?.productID) {
//       // For updates, send barcode if it exists
//       if (editItem.barcode) {
//         dataToSubmit.barcode = editItem.barcode
//       }
//       updateProduct(dataToSubmit)
//     } else {
//       createProduct(dataToSubmit)
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

//               {/* Barcode will be generated by backend - show only in edit mode */}
//               {editItem && (
//                 <div className="space-y-2">
//                   <Label htmlFor="barcode">Barcode</Label>
//                   <div className="flex items-center gap-2">
//                     <Input
//                       id="barcode"
//                       defaultValue={editItem.barcode || ""}
//                       placeholder="Generated by system"
//                       disabled={true}
//                       className="font-mono"
//                     />
//                     <span className="text-xs text-muted-foreground">
//                       (Auto-generated)
//                     </span>
//                   </div>
//                   <p className="text-xs text-muted-foreground">
//                     Barcode is automatically generated by the system
//                   </p>
//                 </div>
//               )}

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
//               {/* <div className="space-y-2">
//                 <Label htmlFor="taxRate">Tax Rate (%)</Label>
//                 <Input
//                   id="taxRate"
//                   type="number"
//                   step="0.01"
//                   {...register("taxRate")}
//                   placeholder="7.5"
//                   disabled={isLoading}
//                 />
//               </div> */}

//               {/* Reorder Point */}
//               {/* <div className="space-y-2">
//                 <Label htmlFor="reorderPoint">Reorder Point</Label>
//                 <Input
//                   id="reorderPoint"
//                   type="number"
//                   {...register("reorderPoint")}
//                   placeholder="10"
//                   disabled={isLoading}
//                 />
//               </div> */}


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
//             {/* <div className="space-y-2">
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
//             </div> */}

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

//       {/* Reusable Barcode Print Component */}
//       <BarcodePrint
//         open={showPrintDialog}
//         onOpenChange={handlePrintDialogClose}
//         productName={printData.productName}
//         productSku={printData.productSku}
//         barcode={printData.barcode}
//         productPrice={printData.sellingPrice}
//         onPrintComplete={handlePrintComplete}
//       />
//     </>
//   )
// }