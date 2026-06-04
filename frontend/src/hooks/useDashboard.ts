import { useEffect, useState } from 'react';

import { useDashboardGetMonthlyOverview, useDashboardGetSummary } from '@api/generated/dashboard/dashboard';
import { useTranslation } from 'react-i18next';

import { useSyncStore } from '@stores/syncStore';

import { logoutAsync } from '../core/auth';
import { computeDashboardSummary, computeMonthlyOverview } from '../db/queries/dashboard';
import { showError, showSuccess } from '../utils/toast';
import type { DashboardSummary, MonthlyOverviewItem } from '../types/dashboard.types';

const mapApiSummary = (d: any): DashboardSummary => ({
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

const mapLocalSummary = (s: ReturnType<typeof computeDashboardSummary>): DashboardSummary => ({
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

const mapLocalMonthly = (items: ReturnType<typeof computeMonthlyOverview>): MonthlyOverviewItem[] =>
  items.map((i) => ({
    month: i.month,
    totalSales: i.totalSales,
    totalPurchases: i.totalPurchases,
    totalExpenses: i.totalExpenses,
    netProfit: i.netProfit,
  }));

export const useDashboard = () => {
  const { t } = useTranslation();
  const isOnline = useSyncStore((s) => s.isOnline);
  const [offlineSummary, setOfflineSummary] = useState<DashboardSummary | null>(null);
  const [offlineMonthly, setOfflineMonthly] = useState<MonthlyOverviewItem[]>([]);

  const summaryQuery = useDashboardGetSummary({ query: { enabled: isOnline } });
  const monthlyQuery = useDashboardGetMonthlyOverview(undefined, { query: { enabled: isOnline } });

  // Load offline data via useEffect (not during render)
  useEffect(() => {
    if (!isOnline) {
      const local = computeDashboardSummary();
      setOfflineSummary(mapLocalSummary(local));
      setOfflineMonthly(mapLocalMonthly(computeMonthlyOverview()));
    }
  }, [isOnline]);

  // Online data
  const apiSummary = (summaryQuery.data as any)?.data ?? summaryQuery.data;
  const onlineSummary = apiSummary ? mapApiSummary(apiSummary) : null;

  const apiMonthly = (monthlyQuery.data as any)?.data ?? monthlyQuery.data;
  const onlineMonthly: MonthlyOverviewItem[] = (apiMonthly?.months ?? []).map((m: any) => ({
    month: m.month,
    totalSales: m.totalSales,
    totalPurchases: m.totalPurchases,
    totalExpenses: m.totalExpenses,
    netProfit: m.netProfit,
  }));

  const summary = isOnline ? onlineSummary : offlineSummary;
  const monthlyOverview = isOnline ? onlineMonthly : offlineMonthly;

  const onLogout = async () => {
    const result = await logoutAsync();
    if (!result.success) {
      showError(t('auth.logout'), result.error ?? t('auth.logoutFailed'));
    } else {
      showSuccess(t('auth.logout'), t('auth.logout'));
    }
  };

  return {
    isOnline,
    isLoading: isOnline && (summaryQuery.isLoading || monthlyQuery.isLoading),
    summary,
    monthlyOverview,
    onLogout,
  };
};
