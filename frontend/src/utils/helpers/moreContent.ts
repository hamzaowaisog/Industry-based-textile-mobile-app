import {
  BarChartIcon,
  BellIcon,
  BoxIcon,
  CloudIcon,
  FileTextIcon,
  ReceiptIcon,
  RefreshIcon,
  SettingsIcon,
  ShoppingBagIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
} from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { AppConstants } from '@constants/appConstants';
import type { MoreItemConfig } from '../../types/notifications.types';

const S = AppConstants.SCREENS.MAIN;

export const MORE_ITEMS: MoreItemConfig[] = [
  { key: 'notifications', labelKey: 'more.notifications', Icon: BellIcon,         color: colors.danger,        destination: 'NotificationCenter' },
  { key: 'orders',        labelKey: 'more.orders',        Icon: ShoppingBagIcon,  color: colors.primary,       destination: S.ORDERS_STACK },
  { key: 'products',      labelKey: 'more.products',      Icon: BoxIcon,          color: colors.primary,       destination: S.PRODUCTS_STACK },
  { key: 'purchases',     labelKey: 'more.purchases',     Icon: TruckIcon,      color: colors.warning,      destination: S.PURCHASES_STACK },
  { key: 'invoices',      labelKey: 'more.invoices',      Icon: FileTextIcon,   color: colors.violet,       destination: S.INVOICES_STACK },
  { key: 'expenses',      labelKey: 'more.expenses',      Icon: ReceiptIcon,    color: colors.success,      destination: S.EXPENSES_STACK },
  { key: 'stock',         labelKey: 'more.stockMovements', Icon: RefreshIcon,   color: colors.primary,      destination: S.STOCK_STACK },
  { key: 'transactions',  labelKey: 'more.transactions',  Icon: WalletIcon,     color: colors.warning,      destination: S.LEDGER_STACK },
  { key: 'reports',       labelKey: 'more.reports',       Icon: BarChartIcon,   color: colors.success,      destination: S.REPORTS_STACK, adminOnly: true, tag: 'Admin' },
  { key: 'users',         labelKey: 'more.users',         Icon: UsersIcon,      color: colors.violet,       destination: S.USERS_STACK,   adminOnly: true, tag: 'Admin' },
  { key: 'sync',          labelKey: 'more.syncStatus',    Icon: CloudIcon,      color: colors.primary,      destination: S.SETTINGS },
  { key: 'settings',      labelKey: 'more.settings',      Icon: SettingsIcon,   color: colors.textSecondary, destination: S.SETTINGS },
];
