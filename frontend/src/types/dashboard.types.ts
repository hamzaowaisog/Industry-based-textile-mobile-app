export type RecentOrder = {
  orderId: number;
  clientName: string;
  total: number;
  statusName: string;
  orderDate: string;
};

export type RecentPurchase = {
  purchaseId: number;
  supplierName: string;
  total: number;
  statusName: string;
  purchaseDate: string;
};

export type DashboardSummary = {
  asOf: string;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  thisMonthPurchases: number;
  thisMonthExpenses: number;
  thisMonthNetProfit: number;
  totalOutstanding: number;
  todayOrdersCount: number;
  todayOrdersTotal: number;
  pendingOrdersCount: number;
  unallocatedPaymentsCount: number;
  lowStockCount: number;
  overdueInvoicesCount: number;
  recentOrders: RecentOrder[];
  recentPurchases: RecentPurchase[];
};

export type MonthlyOverviewItem = {
  month: string;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
};

import type { ComponentType, ReactNode } from 'react';
import type { SyncPhase } from './store.types';

export type RevenueTrend = { pct: number; up: boolean };

export type StatCardConfig = {
  tint: string;
  Icon: ComponentType<{ size: number; color: string }>;
  label: string;
  value: string;
  sub: string;
};

export type QuickActionConfig = {
  labelKey: string;
  color: string;
  Icon: ComponentType<{ size: number; color: string }>;
};

export type SyncPhaseConfig = {
  key: string;
  labelKey: string;
  subKey: string;
  subCount?: number;
  active: boolean;
  done: boolean;
};

export type SyncHeroState = {
  heroBg: string;
  heroIconColor: string;
  progressColor: string;
  titleKey: string;
  titleCount?: number;
  subKey: string;
  subTime?: string;
};

export type FinancialCellProps = {
  label: string;
  value: string;
  borderRight?: boolean;
  borderBottom?: boolean;
  padLeft?: boolean;
  padTop?: boolean;
  valueColor?: string;
  trend?: RevenueTrend | null;
  trendVsLabel?: string;
};

export type OrderRowProps = {
  order: RecentOrder;
  isLast: boolean;
};

export type PurchaseRowProps = {
  purchase: RecentPurchase;
  isLast: boolean;
};

export type StatCardProps = {
  tint: string;
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  trend?: number;
};

export type GiftedBarItem = {
  value: number;
  frontColor: string;
  label?: string;
  labelTextStyle?: object;
  labelWidth?: number;
  barWidth?: number;
  spacing?: number;
};

export type QuickAction = {
  label: string;
  color: string;
  icon: ReactNode;
  onPress: () => void;
};

export type BarChartProps = {
  data: MonthlyOverviewItem[];
};

export type SkeletonBlockProps = {
  width?: number;
  height: number;
  borderRadius?: number;
  flex?: number;
  stretch?: boolean;
};

export type SyncStatusBarProps = {
  isOnline: boolean;
  isSyncing: boolean;
  onSync: () => void;
};

export type SyncBottomSheetProps = {
  isSyncing: boolean;
  syncPhase: SyncPhase;
  pendingCount: number;
  pendingChanges: import('./db.types').PendingChange[];
  lastSyncedAt: string | null;
};

export type DashboardComponentProps = {
  isOnline: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  summary: DashboardSummary | null;
  monthlyOverview: MonthlyOverviewItem[];
  userName: string;
  onOpenDrawer: () => void;
  onSync: () => void;
  onNewOrder: () => void;
  onViewAllOrders: () => void;
};
