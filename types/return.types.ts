export enum ReturnStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export enum ReturnType {
    FULL_RETURN = 'FULL_RETURN',
    PARTIAL_RETURN = 'PARTIAL_RETURN',
    EXCHANGE = 'EXCHANGE'
}

export enum ReturnReason {
    DEFECTIVE_PRODUCT = 'DEFECTIVE_PRODUCT',
    WRONG_ITEM = 'WRONG_ITEM',
    DAMAGED = 'DAMAGED',
    NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
    SIZE_ISSUE = 'SIZE_ISSUE',
    COLOR_ISSUE = 'COLOR_ISSUE',
    QUALITY_ISSUE = 'QUALITY_ISSUE',
    CUSTOMER_CHANGE_MIND = 'CUSTOMER_CHANGE_MIND',
    LATE_DELIVERY = 'LATE_DELIVERY',
    OTHER = 'OTHER'
}

export interface ReturnItem {
    returnItemID: number
    returnItemSid: string
    sellItemID: number
    quantity: number
    unitPrice: number
    refundAmount?: number
    reason: ReturnReason
    condition?: string
    notes?: string
    isRestocked: boolean
    restockedAt?: string
    createdAt: string
    sellItem: {
        sellItemID: number
        productID: number
        productName: string
        productSku: string
        quantity: number
        unitPrice: number
    }
}

export interface ProductReturn {
    returnID: number
    returnSid: string
    returnNumber: string
    sellID: number
    returnType: ReturnType
    returnReason: ReturnReason
    status: ReturnStatus
    customerName?: string
    customerPhone?: string
    refundAmount?: number
    restockingFee?: number
    totalAmount?: number
    exchangeForProductID?: number
    exchangeQuantity?: number
    description?: string
    attachments?: string
    processedByID?: number
    createdAt: string
    updatedAt: string
    processedAt?: string
    sell: {
        sellID: number
        invoiceNumber: string
        total: number
        createdAt: string
    }
    exchangeForProduct?: {
        productID: number
        productSid: string
        sku: string
        name: string
    }
    processedBy?: {
        userID: number
        name: string
        email: string
    }
    returnItems: ReturnItem[]
}

export interface SaleWithReturnInfo {
    sellID: number
    invoiceNumber: string
    total: number
    createdAt: string
    customerName?: string
    customerPhone?: string
    sellItems: Array<{
        sellItemID: number
        productID: number
        productName: string
        productSku: string
        quantity: number
        unitPrice: number
        subtotal: number
        returnedQuantity: number
        availableForReturn: number
    }>
    returns: Array<{
        returnID: number
        returnNumber: string
        returnType: ReturnType
        status: ReturnStatus
        refundAmount?: number
        createdAt: string
        returnItems: Array<{
            quantity: number
            sellItemID: number
        }>
    }>
}