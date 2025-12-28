"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { userStorage, type User } from "@/lib/localStorage"
import { Loader2, UserIcon, Lock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Profile() {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        phone: "",
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    useEffect(() => {
        // Get current logged-in user (in production, you'd get this from auth context)
        const users = userStorage.getAll()
        const currentUser = users[0] // For demo, using first user
        if (currentUser) {
            setUser(currentUser)
            setProfileForm({
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
            })
        }
    }, [])

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (user) {
                userStorage.update(user.id, {
                    name: profileForm.name,
                    email: profileForm.email,
                    phone: profileForm.phone,
                })
                setMessage({ type: "success", text: "Profile updated successfully!" })
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update profile" })
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (!user) {
                setMessage({ type: "error", text: "User not found" })
                return
            }

            if (passwordForm.currentPassword !== user.password) {
                setMessage({ type: "error", text: "Current password is incorrect" })
                return
            }

            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setMessage({ type: "error", text: "New passwords do not match" })
                return
            }

            if (passwordForm.newPassword.length < 6) {
                setMessage({ type: "error", text: "Password must be at least 6 characters" })
                return
            }

            userStorage.update(user.id, {
                password: passwordForm.newPassword,
            })

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })

            setMessage({ type: "success", text: "Password changed successfully!" })
        } catch (error) {
            setMessage({ type: "error", text: "Failed to change password" })
        } finally {
            setLoading(false)
        }
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
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input value={user?.role || ""} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Input value={user?.status || ""} disabled />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
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
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
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
