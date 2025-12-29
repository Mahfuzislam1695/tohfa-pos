"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories } from "@/hooks/use-categories"
import { useBrands } from "@/hooks/use-brands"
import { useDelete } from "@/hooks/useDelete"

interface SetupListProps {
  type: "category" | "brand"
  onEdit: (item: any) => void
  refresh?: number
}

export function SetupList({ type, onEdit, refresh }: SetupListProps) {
  // Use custom hook for data
  const categoriesHook = type === "category" ? useCategories() : null
  const brandsHook = type === "brand" ? useBrands() : null

  const hook = categoriesHook || brandsHook

  const items = hook?.categories || hook?.brands || []
  const meta = hook?.meta
  const isLoading = hook?.isLoading || false
  const searchTerm = hook?.searchTerm || ""
  const currentPage = hook?.currentPage || 1
  const itemsPerPage = hook?.itemsPerPage || 10
  const setSearchTerm = hook?.setSearchTerm || (() => { })
  const setCurrentPage = hook?.setCurrentPage || (() => { })
  const setItemsPerPage = hook?.setItemsPerPage || (() => { })
  const refetch = hook?.refetch || (() => { })

  // Delete mutation
  const { mutate: deleteItem, isPending: isDeleting } = useDelete(
    `/${type}s`,
    [type + "s", currentPage, itemsPerPage, searchTerm],
    {
      successMessage: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`,
      errorMessage: `Failed to delete ${type}`,
      onSuccess: () => {
        refetch()
      }
    }
  )

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    const newLimit = parseInt(value)
    setItemsPerPage(newLimit)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search input with debounce (already handled in hook)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // The debounce in the hook will handle this
      e.currentTarget.blur()
    }
  }

  // Calculate serial number based on page and index
  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * itemsPerPage + index + 1
  }

  const handleDelete = (id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    deleteItem(id)
  }

  const getColumns = () => {
    return ["SL", "Name", "Description", "Status", "Actions"]
  }

  const renderRow = (item: any, index: number) => {
    return (
      <>
        <TableCell className="font-medium text-center">{getSerialNumber(index)}</TableCell>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell className="max-w-md truncate">{item.description || "-"}</TableCell>
        <TableCell>
          <Badge variant={item.isActive ? "default" : "secondary"}>
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
      </>
    )
  }

  if (!hook) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid type specified
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All {type.charAt(0).toUpperCase() + type.slice(1)}s</CardTitle>
              <CardDescription>
                {meta ? (
                  <>Showing {meta.itemCount} of {meta.totalItems} {type}s (Page {meta.currentPage} of {meta.totalPages})</>
                ) : (
                  `Manage your ${type}s`
                )}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${type}s...`}
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-10"
                // disabled={isLoading}
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs text-muted-foreground">
                    {isLoading ? "Searching..." : "Press Enter or wait"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
            {searchTerm && (
              <div className="text-sm text-muted-foreground">
                Search results for: "<span className="font-medium">{searchTerm}</span>"
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && items.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="rounded-md border mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    {getColumns().map((col) => (
                      <TableHead key={col} className={col === "SL" ? "text-center w-16" : ""}>
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && !isLoading ? (
                    <TableRow>
                      <TableCell colSpan={getColumns().length} className="text-center text-muted-foreground h-32">
                        {searchTerm ? `No ${type}s found matching "${searchTerm}"` : `No ${type}s found`}
                      </TableCell>
                    </TableRow>
                  ) : items.length > 0 ? (
                    items.map((item, index) => (
                      <TableRow key={item[`${type}ID`] || item.id}>
                        {renderRow(item, index)}
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(item)}
                              disabled={isDeleting || isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item[`${type}ID`] || item.id)}
                              disabled={isDeleting || isLoading}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : null}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * meta.itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * meta.itemsPerPage, meta.totalItems)} of{" "}
                  {meta.totalItems} entries
                </div>

                {meta.totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        let pageNum
                        if (meta.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= meta.totalPages - 2) {
                          pageNum = meta.totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isLoading}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === meta.totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}