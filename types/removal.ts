export enum RemovalReason {
    EXPIRED = 'EXPIRED',
    DAMAGED = 'DAMAGED',
    BROKEN = 'BROKEN',
    DEFECTIVE = 'DEFECTIVE',
    STOLEN = 'STOLEN',
    LOST = 'LOST',
    SAMPLE = 'SAMPLE',
    QUALITY_ISSUE = 'QUALITY_ISSUE',
    RECALL = 'RECALL',
    WASTE = 'WASTE',
    DONATION = 'DONATION',
    EMPLOYEE_USE = 'EMPLOYEE_USE',
    TESTING = 'TESTING',
    DEMONSTRATION = 'DEMONSTRATION',
    SHOWROOM_DISPLAY = 'SHOWROOM_DISPLAY',
    PROMOTIONAL = 'PROMOTIONAL',
    MANUFACTURER_DEFECT = 'MANUFACTURER_DEFECT',
    SHIPPING_DAMAGE = 'SHIPPING_DAMAGE',
    STORAGE_DAMAGE = 'STORAGE_DAMAGE',
    NATURAL_DISASTER = 'NATURAL_DISASTER',
    OTHER = 'OTHER'
}

export interface RemovalResponseDto {
    removalID: number;
    removalSid: string;
    productID: number;
    reason: RemovalReason;
    quantity: number;
    estimatedLoss?: number;
    batchId?: number;
    expiryDate?: string;
    damageDescription?: string;
    notes?: string;
    batchDetails?: any;
    createdAt: string;
    updatedAt: string;
    removedBy?: {
        userID: number;
        name: string;
        email: string;
    };
    product?: {
        productID: number;
        sku: string;
        name: string;
        sellingPrice: number;
        stockQuantity: number;
        unit?: string;
    };
    totalLoss: number;
}

export interface RemovalStatisticsDto {
    totalRemovals: number;
    totalQuantity: number;
    totalLoss: number;
    monthlyRemovals: Array<{
        month: string;
        count: number;
        quantity: number;
        loss: number;
    }>;
    reasonBreakdown: Record<RemovalReason, number>;
    productBreakdown: Array<{
        productID: number;
        productName: string;
        count: number;
        quantity: number;
        loss: number;
    }>;
    recentRemovals: Array<{
        removalID: number;
        productName: string;
        quantity: number;
        reason: RemovalReason;
        date: string;
    }>;
}

export interface CreateRemovalDto {
    productID: number;
    reason: RemovalReason;
    quantity: number;
    batchId?: number;
    expiryDate?: string;
    damageDescription?: string;
    estimatedLoss?: number;
    notes?: string;
    batchDetails?: string;
}

export interface UpdateRemovalDto {
    reason?: RemovalReason;
    quantity?: number;
    estimatedLoss?: number;
    damageDescription?: string;
    notes?: string;
    isRestocked?: boolean;
}

export interface RemovalFilters {
    startDate?: Date;
    endDate?: Date;
    reason?: RemovalReason;
    productId?: number;
    minLoss?: number;
    maxLoss?: number;
}