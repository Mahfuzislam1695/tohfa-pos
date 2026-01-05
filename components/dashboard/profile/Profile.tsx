"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, UserIcon, Lock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useGet } from "@/hooks/useGet"
import { usePatch } from "@/hooks/usePatch"
import { usePost } from "@/hooks/usePost"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"

// Form validation schemas
const profileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().min(10, "Phone number must be at least 10 characters").max(30, "Phone number must be at most 30 characters"),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(255, "Password must be at most 255 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function Profile() {
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [originalData, setOriginalData] = useState<ProfileFormData | null>(null)
    const queryClient = useQueryClient()

    // Get user profile
    const { data: userData, isLoading: isLoadingProfile, refetch: refetchProfile } = useGet<any>(
        "/users/profile",
        ["userProfile"],
        {
            enabled: true,
        }
    )

    // Profile form
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
        reset: resetProfile,
        watch: watchProfile,
        control: controlProfile,
        getValues: getProfileValues,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        }
    })

    // Password form
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
        reset: resetPassword,
        watch: watchPassword,
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        }
    })

    // Load user data into form when fetched
    useEffect(() => {
        if (userData) {
            const user = userData
            const initialData = {
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            }
            setOriginalData(initialData)
            resetProfile(initialData)
        }
    }, [userData, resetProfile])

    // Update profile mutation
    const { mutate: updateProfile, isPending: isUpdatingProfile } = usePatch(
        (userData?.userID) ? `/users/${userData.userID}` : "",
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                // toast.success("Profile updated successfully!")
                setMessage({ type: "success", text: "Profile updated successfully!" })
                // Update original data with new values
                const currentValues = getProfileValues()
                setOriginalData(currentValues)
                refetchProfile()
                queryClient.invalidateQueries({ queryKey: ["userProfile"] })
            } else {
                toast.error(data?.message || "Failed to update profile")
                setMessage({ type: "error", text: data?.message || "Failed to update profile" })
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to update profile")
            setMessage({ type: "error", text: error?.message || "Failed to update profile" })
        }
    )

    // Change password mutation
    const { mutate: changePassword, isPending: isChangingPassword } = usePost(
        "/users/change-password",
        (data: any) => {
            if (data?.statusCode >= 200 && data?.statusCode < 300) {
                // toast.success("Password changed successfully!")
                setMessage({ type: "success", text: "Password changed successfully!" })
                resetPassword()
            } else {
                toast.error(data?.message || "Failed to change password")
                setMessage({ type: "error", text: data?.message || "Failed to change password" })
            }
        },
        (error: any) => {
            toast.error(error?.message || "Failed to change password")
            setMessage({ type: "error", text: error?.message || "Failed to change password" })
        }
    )

    const onProfileSubmit = (data: ProfileFormData) => {
        if (!userData?.userID) {
            toast.error("User ID not found")
            return
        }

        if (!originalData) {
            toast.error("Original data not loaded")
            return
        }

        // Create update object with only changed fields
        const updateData: any = {}

        if (data.name !== originalData.name) {
            updateData.name = data.name
        }

        if (data.email !== originalData.email) {
            updateData.email = data.email
        }

        if (data.phone !== originalData.phone) {
            updateData.phone = data.phone
        }

        // If nothing changed, show message and return
        if (Object.keys(updateData).length === 0) {
            toast.info("No changes detected")
            setMessage({ type: "success", text: "No changes to update" })
            return
        }
        updateProfile(updateData)
    }

    const onPasswordSubmit = (data: PasswordFormData) => {
        const passwordData = {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        }
        
        changePassword(passwordData)
    }

    if (isLoadingProfile) {
        return (
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Profile Settings</h1>
                    <p className="text-muted-foreground mt-1">Loading profile...</p>
                </div>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Profile Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account information and security</p>
            </div>

            {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    {message.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="profile">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="password">
                        <Lock className="h-4 w-4 mr-2" />
                        Password
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        {...registerProfile("name")}
                                        placeholder="Enter your full name"
                                        disabled={isUpdatingProfile}
                                        className={profileErrors.name ? "border-red-500" : ""}
                                    />
                                    {profileErrors.name && (
                                        <p className="text-sm text-red-500 mt-1">{profileErrors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...registerProfile("email")}
                                        placeholder="Enter your email address"
                                        disabled={isUpdatingProfile}
                                        className={profileErrors.email ? "border-red-500" : ""}
                                    />
                                    {profileErrors.email && (
                                        <p className="text-sm text-red-500 mt-1">{profileErrors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        {...registerProfile("phone")}
                                        placeholder="Enter your phone number"
                                        disabled={isUpdatingProfile}
                                        className={profileErrors.phone ? "border-red-500" : ""}
                                    />
                                    {profileErrors.phone && (
                                        <p className="text-sm text-red-500 mt-1">{profileErrors.phone.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input
                                        value={userData?.role || ""}
                                        disabled
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Input
                                        value={userData?.status || ""}
                                        disabled
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Member Since</Label>
                                    <Input
                                        value={userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ""}
                                        disabled
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                >
                                    {isUpdatingProfile ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password *</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        {...registerPassword("currentPassword")}
                                        placeholder="Enter your current password"
                                        disabled={isChangingPassword}
                                        className={passwordErrors.currentPassword ? "border-red-500" : ""}
                                    />
                                    {passwordErrors.currentPassword && (
                                        <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password *</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...registerPassword("newPassword")}
                                        placeholder="Enter new password"
                                        disabled={isChangingPassword}
                                        className={passwordErrors.newPassword ? "border-red-500" : ""}
                                    />
                                    {passwordErrors.newPassword && (
                                        <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Password must be at least 8 characters long
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        {...registerPassword("confirmPassword")}
                                        placeholder="Confirm new password"
                                        disabled={isChangingPassword}
                                        className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isChangingPassword}
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Changing Password...
                                        </>
                                    ) : (
                                        "Change Password"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}