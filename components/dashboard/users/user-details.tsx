"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Mail, Phone, Shield, User, Clock } from "lucide-react"
import { User as UserType, Role, Status } from "@/types/user"
import { formatDate } from "@/lib/units"

interface UserDetailsProps {
  user: UserType
}

export function UserDetails({ user }: UserDetailsProps) {
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

  const formatStatus = (status: Status) => {
    return status === Status.active ? (
      <Badge className="bg-green-500 text-white">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">ID: {user.userID}</span>
            </div>
            {formatRole(user.role)}
            {formatStatus(user.status)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            {user.userSid && `SID: ${user.userSid}`}
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{user.userID}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <div className="mt-1">{formatRole(user.role)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{formatStatus(user.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <div className="mt-1">{formatStatus(user.status)}</div>
                  </div>
                  {user.userSid && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">System ID</p>
                      <p className="font-mono text-sm">{user.userSid}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created</span>
                  </div>
                  <span className="font-medium">
                    {user.createdAt ? formatDate(user.createdAt, true) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last Updated</span>
                  </div>
                  <span className="font-medium">
                    {user.updatedAt ? formatDate(user.updatedAt, true) : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Permissions Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className={`p-4 rounded-lg border ${user.role === Role.Owner ? 'bg-purple-50 border-purple-200' : 'bg-gray-50'}`}>
                <h4 className="font-medium mb-2">Owner</h4>
                <p className="text-sm text-muted-foreground">
                  Full system access, can manage everything
                </p>
              </div>
              <div className={`p-4 rounded-lg border ${user.role === Role.Admin ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                <h4 className="font-medium mb-2">Admin</h4>
                <p className="text-sm text-muted-foreground">
                  Full system access except owner permissions
                </p>
              </div>
              <div className={`p-4 rounded-lg border ${user.role === Role.Manager ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                <h4 className="font-medium mb-2">Manager</h4>
                <p className="text-sm text-muted-foreground">
                  Can manage staff, products, and sales
                </p>
              </div>
              <div className={`p-4 rounded-lg border ${user.role === Role.Staff ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <h4 className="font-medium mb-2">Staff</h4>
                <p className="text-sm text-muted-foreground">
                  Can process sales and view products
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}