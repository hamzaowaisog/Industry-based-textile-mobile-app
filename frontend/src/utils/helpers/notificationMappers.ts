import { colors } from '@theme/colors';

import {
  BarChartIcon,
  BellIcon,
  BoxIcon,
  CreditCardIcon,
  FileTextIcon,
  ReceiptIcon,
  RefreshIcon,
  ShoppingBagIcon,
  TruckIcon,
} from '@constants/svgAssets';

import type { NotificationIconConfig } from '../../types/notifications.types';

const NOTIFICATION_ICON_MAP: Record<string, NotificationIconConfig> = {
  order_created: { Icon: ShoppingBagIcon, color: colors.primary },
  order_delivered: { Icon: ShoppingBagIcon, color: colors.primary },
  order_cancelled: { Icon: ShoppingBagIcon, color: colors.primary },
  purchase_delivered: { Icon: TruckIcon, color: colors.warning },
  payment_received: { Icon: CreditCardIcon, color: colors.success },
  payment_paid: { Icon: CreditCardIcon, color: colors.success },
  payment_reversed: { Icon: CreditCardIcon, color: colors.success },
  invoice_issued: { Icon: FileTextIcon, color: '#7C3AED' },
  invoice_overdue: { Icon: FileTextIcon, color: colors.danger },
  expense_approved: { Icon: ReceiptIcon, color: colors.warning },
  low_stock: { Icon: BoxIcon, color: colors.danger },
  stock_movement_created: { Icon: BoxIcon, color: colors.primary },
  stock_movement_in: { Icon: BoxIcon, color: colors.success },
  stock_movement_out: { Icon: BoxIcon, color: colors.danger },
  purchase_created: { Icon: TruckIcon, color: colors.warning },
  purchase_received: { Icon: TruckIcon, color: colors.warning },
  purchase_cancelled: { Icon: TruckIcon, color: colors.danger },
  purchase_status_updated: { Icon: TruckIcon, color: colors.warning },
  order_status_updated: { Icon: ShoppingBagIcon, color: colors.primary },
  sync_complete: { Icon: RefreshIcon, color: '#A855F7' },
  sync_partial: { Icon: RefreshIcon, color: colors.warning },
  sync_failed: { Icon: RefreshIcon, color: colors.danger },
};

export const getNotificationIcon = (type: string): NotificationIconConfig =>
  NOTIFICATION_ICON_MAP[type] ?? { Icon: BellIcon, color: colors.primary };
