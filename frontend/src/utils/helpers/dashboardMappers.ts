import type { LocalDashboardSummary, LocalMonthlyOverviewItem } from '@db/queries/dashboard';

import type { DashboardSummary, MonthlyOverviewItem } from '../../types/dashboard.types';

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
});

export const mapApiMonthly = (months: any[]): MonthlyOverviewItem[] =>
  months.map((m) => ({
    month: m.month,
    totalSales: m.totalSales,
    totalPurchases: m.totalPurchases,
    totalExpenses: m.totalExpenses,
    netProfit: m.netProfit,
  }));

export const mapLocalSummary = (s: LocalDashboardSummary): DashboardSummary => ({
  asOf: s.asOf,
  thisMonthRevenue: s.financials.thisMonthRevenue,
  lastMonthRevenue: s.financials.lastMonthRevenue,
  thisMonthPurchases: s.financials.thisMonthPurchases,
  thisMonthExpenses: s.financials.thisMonthExpenses,
  thisMonthNetProfit: s.financials.thisMonthNetProfit,
  totalOutstanding: s.financials.totalOutstanding,
  todayOrdersCount: s.operations.todayOrdersCount,
  todayOrdersTotal: s.operations.todayOrdersTotal,
  pendingOrdersCount: s.operations.pendingOrdersCount,
  unallocatedPaymentsCount: s.operations.unallocatedPaymentsCount,
  lowStockCount: s.alerts.lowStockCount,
  overdueInvoicesCount: s.alerts.overdueInvoicesCount,
  recentOrders: s.recentOrders,
});

export const mapLocalMonthly = (items: LocalMonthlyOverviewItem[]): MonthlyOverviewItem[] =>
  items.map((i) => ({
    month: i.month,
    totalSales: i.totalSales,
    totalPurchases: i.totalPurchases,
    totalExpenses: i.totalExpenses,
    netProfit: i.netProfit,
  }));
