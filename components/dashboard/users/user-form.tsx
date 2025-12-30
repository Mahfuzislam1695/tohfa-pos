"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Eye, EyeOff } from "lucide-react"
import { usePost } from "@/hooks/usePost"
import { usePatch } from "@/hooks/usePatch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { Role, Status } from "@/types/user"

interface UserFormProps {
    editItem?: any
    onSuccess?: () => void
    onCancel?: () => void
}

const userSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    phone: z.string()
        .min(10, "Phone number must be at least 10 characters")
        .max(30, "Phone number must be at most 30 characters"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(255, "Password must be at most 255 characters")
        .optional()
        .or(z.literal('')),
    role: z.nativeEnum(Role, {
        errorMap: () => ({ message: "Role is required" })
    }),
    status: z.nativeEnum(Status).optional(),
})

type UserFormData = z.infer<typeof userSchema>

export function UserForm({ editItem, onSuccess, onCancel }: UserFormProps) {
    const queryClient = useQueryClient()
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        trigger,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            role: Role.Customer,
            // status: Status.active,
        }
    })

    const formValues = watch()

    const { mutate: createUser, isPending: isCreating } = usePost(
        "/users",
        (data: any) => {
            setIsSubmitting(false)

            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                toast.success("User created successfully!")
                reset()
                queryClient.invalidateQueries({ queryKey: ["users"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to create user")
            }
        },
        (error: any) => {
            setIsSubmitting(false)
            toast.error(error?.message || "Failed to create user")
        }
    )

    const { mutate: updateUser, isPending: isUpdating } = usePatch(
        `/users/${editItem?.userID}`,
        (data: any) => {
            setIsSubmitting(false)

            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                toast.success("User updated successfully!")
                reset()
                queryClient.invalidateQueries({ queryKey: ["users"] })
                onSuccess?.()
            } else {
                toast.error(data?.message || "Failed to update user")
            }
        },
        (error: any) => {
            setIsSubmitting(false)
            toast.error(error?.message || "Failed to update user")
        }
    )

    useEffect(() => {
        if (editItem) {
            setValue("name", editItem.name)
            setValue("email", editItem.email)
            setValue("phone", editItem.phone)
            setValue("role", editItem.role)
            setValue("status", editItem.status)
            setValue("password", "") // Clear password field for editing
        }
    }, [editItem, setValue])

    const onSubmit = async (data: UserFormData) => {
        // Validate all fields
        const isValid = await trigger()
        if (!isValid) {
            toast.error("Please fix all errors before submitting")
            return
        }

        setIsSubmitting(true)

        // Prepare data for submission
        const dataToSubmit: any = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            // status: data.status,
        }

        // Only include password if provided (for create or update)
        if (data.password && data.password.trim() !== "") {
            dataToSubmit.password = data.password
        }

        if (editItem?.userID) {
            updateUser(dataToSubmit)
        } else {
            // For new users, password is required
            if (!data.password || data.password.trim() === "") {
                toast.error("Password is required for new users")
                setIsSubmitting(false)
                return
            }
            createUser(dataToSubmit)
        }
    }

    const isLoading = isCreating || isUpdating || isSubmitting

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editItem ? "Edit User" : "Add New User"}</CardTitle>
                <CardDescription>
                    {editItem ? "Update user information and permissions" : "Create a new user account"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder="John Doe"
                                disabled={isLoading}
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                placeholder="john.doe@example.com"
                                disabled={isLoading}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                {...register("phone")}
                                placeholder="+8801750256844"
                                disabled={isLoading}
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Format: +880XXXXXXXXXX or (+880) X XXXXXXXXX
                            </p>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                                value={formValues.role}
                                onValueChange={(value) => setValue("role", value as Role)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(Role).map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
                            )}
                        </div>

                        {/* Status (only for edit) */}
                        {editItem && (
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formValues.status}
                                    onValueChange={(value) => setValue("status", value as Status)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(Status).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Password */}
                        <div className={`space-y-2 ${editItem ? "" : "md:col-span-2"}`}>
                            <Label htmlFor="password">
                                {editItem ? "Password (leave blank to keep current)" : "Password *"}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder={editItem ? "••••••••" : "Enter password"}
                                    disabled={isLoading}
                                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                            )}
                            {!editItem && (
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 8 characters long
                                </p>
                            )}
                        </div>
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
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {editItem ? (
                                        "Update User"
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add User
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