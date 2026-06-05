export type DashboardSummary = {
  asOf: string;
  // Financials
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  thisMonthPurchases: number;
  thisMonthExpenses: number;
  thisMonthNetProfit: number;
  totalOutstanding: number;
  // Operations
  todayOrdersCount: number;
  todayOrdersTotal: number;
  pendingOrdersCount: number;
  unallocatedPaymentsCount: number;
  // Alerts
  lowStockCount: number;
  overdueInvoicesCount: number;
  // Recent orders
  recentOrders: {
    orderId: number;
    clientName: string;
    total: number;
    statusName: string;
    orderDate: string;
  }[];
};

export type MonthlyOverviewItem = {
  month: string;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
};

export type DashboardComponentProps = {
  isOnline: boolean;
  isLoading: boolean;
  summary: DashboardSummary | null;
  monthlyOverview: MonthlyOverviewItem[];
  onLogout: () => void;
  onOpenDrawer: () => void;
};
