import type { StatusStyle, TabConfig } from '@types/clients.types';

import { AppConstants } from '@constants/appConstants';
import { colors } from '@theme/colors';

const T = AppConstants.CLIENT_TABS;

export const CUSTOMER_TABS: TabConfig[] = [
  { id: T.ORDERS, labelKey: 'clients.tabOrders' },
  { id: T.PAYMENTS, labelKey: 'clients.tabPayments' },
  { id: T.INVOICES, labelKey: 'clients.tabInvoices' },
  { id: T.TRANSACTIONS, labelKey: 'clients.tabTransactions' },
];

export const SUPPLIER_TABS: TabConfig[] = [
  { id: T.PURCHASES, labelKey: 'clients.tabPurchases' },
  { id: T.PAYMENTS, labelKey: 'clients.tabPayments' },
  { id: T.INVOICES, labelKey: 'clients.tabInvoices' },
  { id: T.TRANSACTIONS, labelKey: 'clients.tabTransactions' },
];

const STATUS_COLORS: Record<string, StatusStyle> = {
  Pending: { bg: colors.warningLight, fg: colors.warning },
  InProgress: { bg: colors.primaryLight, fg: colors.primary },
  InProgressed: { bg: colors.primaryLight, fg: colors.primary },
  Delivered: { bg: colors.successLight, fg: colors.success },
  Cancelled: { bg: colors.dangerLight, fg: colors.danger },
};

export const getStatusStyle = (s?: string | null): StatusStyle =>
  STATUS_COLORS[s ?? ''] ?? { bg: colors.bgAlt, fg: colors.textSecondary };
