import {
  AlertIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  ShoppingBagIcon,
  TruckIcon,
  WalletIcon,
} from '@constants/svgAssets';
import { AppConstants } from '@constants/appConstants';
import { colors } from '@theme/colors';
import { formatCompactNumber as fmt } from '@utils/helpers/formatNumber';
import type { DashboardSummary, QuickActionConfig, StatCardConfig } from '../../types/dashboard.types';

export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  Pending:      { bg: colors.warningLight, fg: colors.warning },
  InProgressed: { bg: colors.primaryLight, fg: colors.primary },
  Delivered:    { bg: colors.successLight, fg: colors.success },
  Cancelled:    { bg: colors.dangerLight,  fg: colors.danger  },
};

export const getStatusStyle = (name: string): { bg: string; fg: string } =>
  STATUS_COLORS[name] ?? { bg: colors.bgAlt, fg: colors.textSecondary };

export const getStatCardConfigs = (
  summary: DashboardSummary,
  t: (key: string) => string,
): StatCardConfig[] => [
  {
    tint: colors.primary,
    Icon: ShoppingBagIcon,
    label: t('dashboard.statTodayOrders'),
    value: String(summary.todayOrdersCount),
    sub: `${AppConstants.CURRENCY.PREFIX}${fmt(summary.todayOrdersTotal)}`,
  },
  {
    tint: colors.warning,
    Icon: WalletIcon,
    label: t('dashboard.statOutstanding'),
    value: `${AppConstants.CURRENCY.PREFIX}${fmt(summary.totalOutstanding)}`,
    sub: t('dashboard.fromClients'),
  },
  {
    tint: colors.violet,
    Icon: CreditCardIcon,
    label: t('dashboard.statPendingPmts'),
    value: String(summary.unallocatedPaymentsCount),
    sub: t('dashboard.unallocated'),
  },
  {
    tint: colors.success,
    Icon: ClockIcon,
    label: t('dashboard.statPendingOrders'),
    value: String(summary.pendingOrdersCount),
    sub: t('dashboard.ordersUnit'),
  },
  {
    tint: colors.danger,
    Icon: AlertIcon,
    label: t('dashboard.statLowStock'),
    value: String(summary.lowStockCount),
    sub: t('dashboard.belowReorder'),
  },
  {
    tint: colors.danger,
    Icon: FileTextIcon,
    label: t('dashboard.statOverdueInvs'),
    value: String(summary.overdueInvoicesCount),
    sub: t('dashboard.invoicesUnit'),
  },
];

export const QUICK_ACTION_CONFIGS: QuickActionConfig[] = [
  { labelKey: 'dashboard.newOrder',    color: colors.primary, Icon: ShoppingBagIcon },
  { labelKey: 'dashboard.payment',     color: colors.success, Icon: CreditCardIcon },
  { labelKey: 'dashboard.newPurchase', color: colors.warning, Icon: TruckIcon },
  { labelKey: 'dashboard.invoice',     color: colors.violet,  Icon: FileTextIcon },
];
