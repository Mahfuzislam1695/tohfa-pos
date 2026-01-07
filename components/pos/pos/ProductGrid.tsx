import { Search, Filter, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUnitByShortName } from "@/lib/units"
import { Product } from "./types"

interface ProductGridProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    selectedCategory: string
    setSelectedCategory: (category: string) => void
    selectedBrand: string
    setSelectedBrand: (brand: string) => void
    categories: { id: string; name: string }[]
    brands: { id: string; name: string }[]
    filteredProducts: Product[]
    isLoadingProducts: boolean
    addToCart: (product: Product) => void
}

export function ProductGrid({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    categories,
    brands,
    filteredProducts,
    isLoadingProducts,
    addToCart,
}: ProductGridProps) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Filters */}
            <div className="border-b border-border bg-card px-6 py-4">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name, SKU, or barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-auto p-6">
                {isLoadingProducts ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading products...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {filteredProducts.map((product) => {
                                const productUnitDef = getUnitByShortName(product.unit)
                                return (
                                    <Card
                                        key={product.productID}
                                        className="p-2 cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => addToCart(product)}
                                    >
                                        <div className="space-y-2 content-center p-2">
                                            <div className="relative h-28 w-auto mx-auto rounded-xl overflow-hidden bg-muted group">
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-12 w-12 text-muted-foreground" />
                                                </div>
                                            </div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-lg font-bold text-primary">৳{product.sellingPrice}</span>
                                                <Badge
                                                    variant={product.isLowStock ? "destructive" : "secondary"}
                                                >
                                                    {product.stockQuantity} {getUnitByShortName(product.unit)?.shortName || product.unit}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                        {filteredProducts.length === 0 && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-muted-foreground">
                                    <p>No products found</p>
                                    <p className="text-sm">Try adjusting your search or filters</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}