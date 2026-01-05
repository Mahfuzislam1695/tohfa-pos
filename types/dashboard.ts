export enum ReportPeriod {
    TODAY = 'today',
    YESTERDAY = 'yesterday',
    LAST_7_DAYS = 'last7days',
    LAST_30_DAYS = 'last30days',
    THIS_MONTH = 'thisMonth',
    LAST_MONTH = 'lastMonth',
    THIS_QUARTER = 'thisQuarter',
    THIS_YEAR = 'thisYear',
    CUSTOM = 'custom'
}

export interface DashboardStats {
    totalSalesToday: number;
    totalRevenueToday: number;
    totalOrdersToday: number;
    totalProducts: number;
    lowStockProducts: number;
    inventoryValue: number;
    totalCustomers: number;
    newCustomersToday: number;
    pendingOrders: number;
    completedOrdersToday: number;
    totalRemovalsToday: number;
    removalLossToday: number;
    profitMarginToday: number;
}

export interface TopProduct {
    productID: number;
    productName: string;
    sku: string;
    quantitySold: number;
    revenue: number;
    profit: number;
}

export interface RecentSale {
    sellID: number;
    invoiceNumber: string;
    customerName?: string;
    total: number;
    paymentMethod: string;
    createdAt: string;
}

export interface LowStockProduct {
    productID: number;
    productName: string;
    sku: string;
    stockQuantity: number;
    lowStockThreshold: number;
    difference: number;
}

export interface SalesTrend {
    date: string;
    sales: number;
    revenue: number;
    orders: number;
}

export interface CategoryBreakdown {
    categoryID: number;
    categoryName: string;
    revenue: number;
    percentage: number;
}

export interface DashboardData {
    statistics: DashboardStats;
    topProducts: TopProduct[];
    recentSales: RecentSale[];
    lowStockProducts: LowStockProduct[];
    salesTrend: SalesTrend[];
    categoryBreakdown: CategoryBreakdown[];
}

export interface SalesReportSummary {
    totalSales: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalDiscount: number;
    totalTax: number;
    itemsSold: number;
    averageOrderValue: number;
    profitMargin: number;
}

export interface SalesReportItem {
    sellID: number;
    invoiceNumber: string;
    customerName?: string;
    customerPhone?: string;
    total: number;
    subtotal: number;
    discount: number;
    tax: number;
    paymentMethod: string;
    paymentStatus: string;
    itemsCount: number;
    createdAt: string;
}

export interface SalesReportData {
    summary: SalesReportSummary;
    sales: SalesReportItem[];
    topProducts: Array<{
        productID: number;
        productName: string;
        quantity: number;
        revenue: number;
    }>;
    categoryBreakdown: Array<{
        categoryID: number;
        categoryName: string;
        revenue: number;
        percentage: number;
    }>;
    paymentMethodBreakdown: Array<{
        method: string;
        count: number;
        amount: number;
        percentage: number;
    }>;
}

export interface InventoryReportSummary {
    totalProducts: number;
    activeProducts: number;
    totalStockQuantity: number;
    inventoryValue: number;
    potentialRevenue: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    averageStockValue: number;
    inventoryTurnover: number;
}

export interface InventoryReportItem {
    productID: number;
    sku: string;
    name: string;
    stockQuantity: number;
    lowStockThreshold: number;
    purchasePrice: number;
    sellingPrice: number;
    inventoryValue: number;
    potentialRevenue: number;
    profitMargin: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
    categoryName: string;
    brandName?: string;
}

export interface InventoryReportData {
    summary: InventoryReportSummary;
    products: InventoryReportItem[];
    lowStockProducts: InventoryReportItem[];
    outOfStockProducts: InventoryReportItem[];
    categoryBreakdown: Array<{
        categoryID: number;
        categoryName: string;
        productCount: number;
        stockValue: number;
    }>;
}

export interface ProfitLossSummary {
    totalRevenue: number;
    totalCostOfGoodsSold: number;
    grossProfit: number;
    grossProfitMargin: number;
    totalExpenses: number;
    netProfit: number;
    netProfitMargin: number;
    totalRemovalsLoss: number;
    totalReturnsLoss: number;
    operatingProfit: number;
}

export interface ProfitLossData {
    summary: ProfitLossSummary;
    categoryBreakdown: Array<{
        categoryName: string;
        revenue: number;
        cost: number;
        profit: number;
        margin: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        revenue: number;
        cost: number;
        profit: number;
        margin: number;
    }>;
    topProfitableProducts: Array<{
        productID: number;
        productName: string;
        revenue: number;
        profit: number;
        margin: number;
    }>;
    expenseBreakdown: Array<{
        category: string;
        amount: number;
        percentage: number;
    }>;
}

export interface ReportFilters {
    period?: ReportPeriod;
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    brandId?: number;
    paymentMethod?: string;
}