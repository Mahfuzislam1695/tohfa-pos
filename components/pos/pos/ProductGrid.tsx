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
                        {/* <Input
                            placeholder="Search products by name, SKU, or barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        /> */}

                        <Input
                            placeholder="Search products by name, SKU, or barcode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            onFocus={(e) => {
                                // Select all text when focused
                                e.target.select();
                            }}
                            onKeyDown={(e) => {
                                // If user presses Esc, clear the search
                                if (e.key === 'Escape') {
                                    setSearchQuery('');
                                }
                            }}
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



///----barcode solutio -2

// import { useState, useEffect, useRef } from "react";
// import { Search, Filter, Package, Barcode } from "lucide-react";

// // Add this state near your other states
// const [barcodeMode, setBarcodeMode] = useState(false);
// const [lastScannedTime, setLastScannedTime] = useState(0);
// const barcodeTimeoutRef = useRef<NodeJS.Timeout>();

// // Add this effect to handle barcode scanning
// useEffect(() => {
//     if (barcodeMode && searchQuery.length >= 8) {
//         // Clear any existing timeout
//         if (barcodeTimeoutRef.current) {
//             clearTimeout(barcodeTimeoutRef.current);
//         }

//         // Set timeout to detect when barcode scanning is complete
//         barcodeTimeoutRef.current = setTimeout(() => {
//             // This assumes barcode scanning is done (scanners typically finish within 100-200ms)
//             console.log("Scanned barcode:", searchQuery);

//             // Here you would typically search for the product
//             // For now, just log it

//             // Clear the search after processing
//             setTimeout(() => setSearchQuery(''), 100);
//         }, 200); // Adjust this timeout based on your scanner speed
//     }

//     return () => {
//         if (barcodeTimeoutRef.current) {
//             clearTimeout(barcodeTimeoutRef.current);
//         }
//     };
// }, [searchQuery, barcodeMode]);

// // In your component
// <div className="flex-1 relative">
//     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//     <Input
//         placeholder={barcodeMode ? "Scan barcode now..." : "Search products by name, SKU, or barcode..."}
//         value={searchQuery}
//         onChange={(e) => {
//             setSearchQuery(e.target.value);
//         }}
//         className="pl-10"
//         autoFocus={barcodeMode}
//         onFocus={(e) => {
//             if (barcodeMode) {
//                 e.target.select();
//             }
//         }}
//     />
//     <button
//         type="button"
//         onClick={() => {
//             setBarcodeMode(!barcodeMode);
//             setSearchQuery('');
//         }}
//         className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${barcodeMode ? 'bg-primary text-primary-foreground' : 'bg-muted'
//             }`}
//         title={barcodeMode ? "Exit barcode mode" : "Enter barcode scanning mode"}
//     >
//         <Barcode className="h-4 w-4" />
//     </button>
// </div>


//Solution 3: Smart Barcode Detection with Auto-Clear-recomend

// import { useState, useEffect, useRef } from "react";

// // Custom hook for barcode scanning
// function useBarcodeScanner(inputValue: string, onBarcodeScanned: (barcode: string) => void) {
//     const timeoutRef = useRef<NodeJS.Timeout>();
//     const lastValueRef = useRef('');

//     useEffect(() => {
//         // Only process if we have input
//         if (!inputValue) return;

//         // Clear any existing timeout
//         if (timeoutRef.current) {
//             clearTimeout(timeoutRef.current);
//         }

//         // Set a timeout to detect when scanning is complete
//         // Barcode scanners typically input very quickly (100-200ms for entire code)
//         timeoutRef.current = setTimeout(() => {
//             // Check if this looks like a barcode
//             // Most barcodes are numeric and have specific lengths
//             const isLikelyBarcode = /^\d{8,14}$/.test(inputValue);

//             if (isLikelyBarcode && inputValue !== lastValueRef.current) {
//                 lastValueRef.current = inputValue;
//                 onBarcodeScanned(inputValue);
//             }
//         }, 100); // Adjust timeout based on scanner speed

//         return () => {
//             if (timeoutRef.current) {
//                 clearTimeout(timeoutRef.current);
//             }
//         };
//     }, [inputValue, onBarcodeScanned]);
// }

// // In your ProductGrid component
// export function ProductGrid({
//     searchQuery,
//     setSearchQuery,
//     // ... other props
// }: ProductGridProps) {
//     const [scanMode, setScanMode] = useState(false);
//     const inputRef = useRef<HTMLInputElement>(null);

//     // Use the barcode scanner hook
//     useBarcodeScanner(searchQuery, (barcode) => {
//         // Handle the scanned barcode
//         console.log("Scanned barcode:", barcode);

//         // Here you would typically:
//         // 1. Search for product with this barcode
//         // 2. Add to cart if found
//         // 3. Clear the input

//         // Clear after processing
//         setTimeout(() => {
//             setSearchQuery('');
//             if (scanMode && inputRef.current) {
//                 inputRef.current.focus();
//             }
//         }, 100);
//     });

//     return (
//         <div className="flex-1 flex flex-col overflow-hidden">
//             {/* Search & Filters */}
//             <div className="border-b border-border bg-card px-6 py-4">
//                 <div className="flex gap-4">
//                     <div className="flex-1 relative">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                         <Input
//                             ref={inputRef}
//                             placeholder={scanMode ? "Scan barcode now..." : "Search products by name, SKU, or barcode..."}
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="pl-10"
//                             onKeyDown={(e) => {
//                                 // Quick clear with Escape
//                                 if (e.key === 'Escape') {
//                                     setSearchQuery('');
//                                 }
//                                 // Enter barcode mode with Ctrl+B
//                                 if (e.ctrlKey && e.key === 'b') {
//                                     e.preventDefault();
//                                     setScanMode(!scanMode);
//                                     setSearchQuery('');
//                                 }
//                             }}
//                             onFocus={(e) => {
//                                 if (scanMode) {
//                                     e.target.select();
//                                 }
//                             }}
//                             autoFocus={scanMode}
//                         />
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setScanMode(!scanMode);
//                                 setSearchQuery('');
//                                 setTimeout(() => {
//                                     if (inputRef.current) {
//                                         inputRef.current.focus();
//                                     }
//                                 }, 10);
//                             }}
//                             className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${scanMode
//                                 ? 'bg-primary text-primary-foreground'
//                                 : 'bg-muted hover:bg-muted/80'
//                                 }`}
//                             title={scanMode ? "Exit barcode scanning mode (Ctrl+B)" : "Enter barcode scanning mode (Ctrl+B)"}
//                         >
//                             <Barcode className="h-4 w-4" />
//                         </button>
//                     </div>

//                     {/* Show scan mode indicator */}
//                     {scanMode && (
//                         <Badge
//                             variant="default"
//                             className="animate-pulse bg-green-600 hover:bg-green-700 cursor-pointer"
//                             onClick={() => setScanMode(false)}
//                         >
//                             Scanning Mode
//                         </Badge>
//                     )}

//                     {/* Rest of your filters */}
//                     {/* ... */}
//                 </div>

//                 {/* Instructions for scan mode */}
//                 {scanMode && (
//                     <div className="mt-2 text-xs text-muted-foreground">
//                         Scan a barcode to automatically add product to cart. Press ESC or click the barcode icon to exit.
//                     </div>
//                 )}
//             </div>

//             {/* Rest of your component */}
//             {/* ... */}
//         </div>
//     );
// }

//Solution 4: Simple Auto-Clear Approach

{/* <Input
  placeholder="Search products by name, SKU, or barcode..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="pl-10"
  autoFocus
  onFocus={(e) => {
    // Clear the input when focused
    setSearchQuery('');
    e.target.select();
  }}
  onBlur={(e) => {
    // Optional: Restore search if user didn't type anything
    if (!e.target.value && searchQuery) {
      setTimeout(() => e.target.focus(), 100);
    }
  }}
/> */}