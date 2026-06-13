import { colors } from '@theme/colors';

import type {
  DashboardSummary,
  GiftedBarItem,
  MonthlyOverviewItem,
  RevenueTrend,
} from '../../types/dashboard.types';

export const mapApiSummary = (d: any): DashboardSummary => ({
  asOf: d.asOf ?? '',
  thisMonthRevenue: d.financials?.thisMonthRevenue ?? 0,
  lastMonthRevenue: d.financials?.lastMonthRevenue ?? 0,
  thisMonthPurchases: d.financials?.thisMonthPurchases ?? 0,
  thisMonthExpenses: d.financials?.thisMonthExpenses ?? 0,
  thisMonthNetProfit: d.financials?.thisMonthNetProfit ?? 0,
  totalOutstanding: d.financials?.totalOutstanding ?? 0,
  todayOrdersCount: d.operations?.todayOrdersCount ?? 0,
  todayOrdersTotal: d.operations?.todayOrdersTotal ?? 0,
  pendingOrdersCount: d.operations?.pendingOrdersCount ?? 0,
  unallocatedPaymentsCount: d.operations?.unallocatedPaymentsCount ?? 0,
  lowStockCount: d.alerts?.lowStockCount ?? 0,
  overdueInvoicesCount: d.alerts?.overdueInvoicesCount ?? 0,
  recentOrders: (d.recentOrders ?? []).map((o: any) => ({
    orderId: o.orderId,
    clientName: o.clientName,
    total: o.total,
    statusName: o.statusName,
    orderDate: o.orderDate,
  })),
  recentPurchases: (d.recentPurchases ?? []).map((p: any) => ({
    purchaseId: p.purchaseId,
    supplierName: p.supplierName,
    total: p.total,
    statusName: p.statusName,
    purchaseDate: p.purchaseDate,
  })),
});

export const mapApiMonthly = (months: any[]): MonthlyOverviewItem[] =>
  months.map((m) => ({
    month: m.month,
    totalSales: m.totalSales,
    totalPurchases: m.totalPurchases,
    totalExpenses: m.totalExpenses,
    netProfit: m.netProfit,
  }));

export const computeRevenueTrend = (thisMonth: number, lastMonth: number): RevenueTrend | null => {
  if (lastMonth <= 0) return null;
  const raw = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  return { pct: Math.abs(raw), up: raw >= 0 };
};

export const mapMonthlyToBarData = (items: MonthlyOverviewItem[]): GiftedBarItem[] =>
  items.slice(-6).flatMap((m, i, arr) => [
    {
      value: m.totalSales,
      frontColor: colors.primary,
      label: m.month,
      labelWidth: 44,
      labelTextStyle: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: colors.textSecondary,
        textAlign: 'center' as const,
      },
      barWidth: 10,
      spacing: 2,
    },
    {
      value: m.totalPurchases,
      frontColor: colors.warning,
      barWidth: 10,
      spacing: 2,
    },
    {
      value: m.totalExpenses,
      frontColor: colors.danger,
      barWidth: 10,
      spacing: i === arr.length - 1 ? 2 : 20,
    },
  ]);
