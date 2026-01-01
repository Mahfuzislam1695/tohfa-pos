
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Package, RefreshCw, User, FileText, ArrowLeftRight, CheckCircle, XCircle } from "lucide-react"
import { ReturnStatus, ReturnType, ProductReturn } from "@/types/return.types"
import { formatDate } from "@/lib/units"
import { usePost } from "@/hooks/usePost"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

interface ReturnDetailsProps {
  returnData: ProductReturn
}

export function ReturnDetails({ returnData }: ReturnDetailsProps) {

  console.log("returnData", returnData);

  const queryClient = useQueryClient()

  const { mutate: approveReturn, isPending: isApproving } = usePost(
    `/returns/${returnData?.returnID}/approve`,
    (data: any) => {
      if (data?.success) {
        toast.success("Return approved successfully!")
        queryClient.invalidateQueries({ queryKey: ["returns"] })
      }
    },
    (error: any) => {
      toast.error(error?.message || "Failed to approve return")
    }
  )

  const { mutate: completeReturn, isPending: isCompleting } = usePost(
    `/returns/${returnData?.returnID}/complete`,
    (data: any) => {
      if (data?.success) {
        toast.success("Return completed successfully!")
        queryClient.invalidateQueries({ queryKey: ["returns"] })
      }
    },
    (error: any) => {
      toast.error(error?.message || "Failed to complete return")
    }
  )

  const { mutate: rejectReturn, isPending: isRejecting } = usePost(
    `/returns/${returnData?.returnID}/reject`,
    (data: any) => {
      if (data?.success) {
        toast.success("Return rejected successfully!")
        queryClient.invalidateQueries({ queryKey: ["returns"] })
      }
    },
    (error: any) => {
      toast.error(error?.message || "Failed to reject return")
    }
  )

  const getStatusIcon = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.PENDING:
        return <RefreshCw className="h-4 w-4 text-yellow-500" />
      case ReturnStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case ReturnStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case ReturnStatus.REJECTED:
        return <XCircle className="h-4 w-4 text-red-500" />
      case ReturnStatus.CANCELLED:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const totalItems = returnData?.returnItems?.reduce((sum, item) => sum + item.quantity, 0)
  const totalRefund = returnData?.returnItems?.reduce((sum, item) => sum + (item.refundAmount || item.unitPrice * item.quantity), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{returnData?.returnNumber}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getStatusIcon(returnData?.status)}
              {returnData?.status}
            </Badge>
            <Badge variant={returnData?.returnType === ReturnType.EXCHANGE ? "default" : "secondary"}>
              {returnData?.returnType.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">
              {returnData?.returnItems.length} items
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        {returnData?.status === ReturnStatus.PENDING && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => approveReturn({})}
              disabled={isApproving}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => rejectReturn({ reason: "Rejected by admin" })}
              disabled={isRejecting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {returnData?.status === ReturnStatus.APPROVED && (
          <Button
            size="sm"
            onClick={() => completeReturn({})}
            disabled={isCompleting}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete
          </Button>
        )}
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Sale Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Original Sale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{returnData?.sell.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sale Date</p>
                  <p className="font-medium">{formatDate(returnData?.sell.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sale Amount</p>
                  <p className="font-medium">৳{parseFloat(returnData?.sell.total || "0").toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return Reason</p>
                  <p className="font-medium">{returnData?.returnReason.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{returnData?.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{returnData?.customerPhone || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Information */}
          {returnData?.returnType === ReturnType.EXCHANGE && returnData?.exchangeForProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5" />
                  Exchange Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{returnData?.exchangeForProduct.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {returnData?.exchangeForProduct.sku}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Qty: {returnData?.exchangeQuantity || 1}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{returnData.description || "No description"}</p>
              </div>
              {returnData.processedBy && (
                <div>
                  <p className="text-sm text-muted-foreground">Processed By</p>
                  <p className="font-medium">{returnData.processedBy.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Refundable</span>
                  <span className="font-medium">৳{totalRefund.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Restocking Fee</span>
                  <span className="font-medium text-destructive">-৳{returnData.restockingFee?.toFixed(2) || "0.00"}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Refund Amount</span>
                  <span className="text-xl font-bold">৳{returnData.refundAmount?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Returned Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Returned Items ({totalItems} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Refund</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnData.returnItems.map((item) => (
                      <TableRow key={item.returnItemID}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.sellItem.productName}</span>
                            <span className="text-xs text-muted-foreground">
                              SKU: {item.sellItem.productSku}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{item.quantity}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">৳{item.unitPrice.toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-emerald-600">
                            ৳{(item.refundAmount || item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.condition || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isRestocked ? "default" : "secondary"}>
                            {item.isRestocked ? "Restocked" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(returnData.createdAt)}</span>
                </div>
                {returnData.processedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Processed</span>
                    <span className="font-medium">{formatDate(returnData.processedAt)}</span>
                  </div>
                )}
                {returnData.updatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formatDate(returnData.updatedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}