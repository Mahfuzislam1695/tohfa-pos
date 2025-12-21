"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search } from "lucide-react"

interface SetupListProps {
  type: "category" | "brand" | "unit" | "supplier"
  onEdit: (item: any) => void
  refresh?: number
}

export function SetupList({ type, onEdit, refresh }: SetupListProps) {
  const [items, setItems] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState<any[]>([])

  useEffect(() => {
    loadItems()
  }, [type, refresh])

  useEffect(() => {
    if (searchQuery) {
      const filtered = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredItems(filtered)
    } else {
      setFilteredItems(items)
    }
  }, [searchQuery, items])

  const loadItems = async () => {
    const { categoryStorage, brandStorage, unitStorage, supplierStorage } = await import("@/lib/localStorage")

    let data: any[] = []
    switch (type) {
      case "category":
        data = categoryStorage.getAll()
        break
      case "brand":
        data = brandStorage.getAll()
        break
      case "unit":
        data = unitStorage.getAll()
        break
      case "supplier":
        data = supplierStorage.getAll()
        break
    }
    setItems(data)
    setFilteredItems(data)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    const { categoryStorage, brandStorage, unitStorage, supplierStorage } = await import("@/lib/localStorage")

    switch (type) {
      case "category":
        categoryStorage.delete(id)
        break
      case "brand":
        brandStorage.delete(id)
        break
      case "unit":
        unitStorage.delete(id)
        break
      case "supplier":
        supplierStorage.delete(id)
        break
    }
    loadItems()
  }

  const getColumns = () => {
    switch (type) {
      case "category":
      case "brand":
        return ["Name", "Description", "Actions"]
      case "unit":
        return ["Name", "Short Name", "Actions"]
      case "supplier":
        return ["Name", "Contact Person", "Email", "Phone", "Actions"]
      default:
        return []
    }
  }

  const renderRow = (item: any) => {
    switch (type) {
      case "category":
      case "brand":
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="max-w-md truncate">{item.description || "-"}</TableCell>
          </>
        )
      case "unit":
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{item.shortName}</Badge>
            </TableCell>
          </>
        )
      case "supplier":
        return (
          <>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.contactPerson}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>{item.phone}</TableCell>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All {type.charAt(0).toUpperCase() + type.slice(1)}s</CardTitle>
            <CardDescription>
              Manage your {type}s. Total: {filteredItems.length}
            </CardDescription>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {getColumns().map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={getColumns().length} className="text-center text-muted-foreground">
                    No {type}s found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    {renderRow(item)}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
