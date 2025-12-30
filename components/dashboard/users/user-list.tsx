"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { useDelete } from "@/hooks/useDelete"
import { Role, Status } from "@/types/user"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserDetails } from "./user-details"

interface UserListProps {
    onEdit?: (user: any) => void
    refresh?: number
}

export function UserList({ onEdit, refresh }: UserListProps) {
    const {
        users,
        meta,
        isLoading,
        searchTerm,
        currentPage,
        itemsPerPage,
        setSearchTerm,
        setCurrentPage,
        setItemsPerPage,
        refetch
    } = useUsers()


    console.log("Users:", users);


    const [viewingUser, setViewingUser] = useState<any>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    // Delete mutation
    const { mutate: deleteUser, isPending: isDeleting } = useDelete(
        "/users",
        ["users"],
        {
            successMessage: "User deleted successfully!",
            errorMessage: "Failed to delete user",
            onSuccess: () => {
                refetch()
            }
        }
    )

    // Debounce search input
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeout = setTimeout(() => {
            setCurrentPage(1)
        }, 500)

        setSearchTimeout(timeout)

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTerm])

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        const newLimit = parseInt(value)
        setItemsPerPage(newLimit)
        setCurrentPage(1)
    }

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Handle delete
    const handleDelete = (id: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return
        deleteUser(id)
    }

    // Calculate statistics
    const statistics = {
        total: users.length,
        active: users.filter(u => u.status === Status.active).length,
        owners: users.filter(u => u.role === Role.Owner).length,
        admins: users.filter(u => u.role === Role.Admin).length,
        managers: users.filter(u => u.role === Role.Manager).length,
        staff: users.filter(u => u.role === Role.Staff).length,
        customers: users.filter(u => u.role === Role.Customer).length,
    }

    // Format role badge
    const formatRole = (role: Role) => {
        const colors = {
            [Role.Owner]: "bg-purple-500",
            [Role.Admin]: "bg-red-500",
            [Role.Manager]: "bg-blue-500",
            [Role.Staff]: "bg-green-500",
            [Role.Customer]: "bg-gray-500"
        }

        return (
            <Badge className={`${colors[role]} text-white`}>
                {role}
            </Badge>
        )
    }

    // Format status badge
    const formatStatus = (status: Status) => {
        return status === Status.active ? (
            <Badge className="bg-green-500 text-white">Active</Badge>
        ) : (
            <Badge variant="secondary">Inactive</Badge>
        )
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.admins + statistics.owners}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.staff + statistics.managers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.customers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription>Manage system users and their access levels</CardDescription>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                        disabled={isLoading}
                                    />
                                </div>

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
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {isLoading && users.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border mb-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                                                    {searchTerm ? `No users found matching "${searchTerm}"` : `No users found`}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => (
                                                <TableRow key={user.userID}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{user.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ID: {user.userID}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.phone}</TableCell>
                                                    <TableCell>
                                                        {formatRole(user.role)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatStatus(user.status)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setViewingUser(user)
                                                                    setIsViewDialogOpen(true)
                                                                }}
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                            {onEdit && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => onEdit(user)}
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(user.userID)}
                                                                className="text-destructive hover:text-destructive"
                                                                title="Delete"
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {meta.totalPages > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                                        {Math.min(currentPage * itemsPerPage, meta.totalItems)} of{" "}
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
                                            </Button>

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
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* View User Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="w-[80vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {viewingUser && (
                        <UserDetails user={viewingUser} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}