import { colors } from '@theme/colors';

import { AppConstants } from '../../constants/appConstants';
import type { OrderStatusConfig, OrderStatusTab } from '../../types/orders.types';

export const ORDER_STATUS_CONFIG: Record<number, OrderStatusConfig> = {
  [AppConstants.ORDER_STATUS.PENDING]: {
    bg: colors.warningLight,
    fg: colors.warning,
  },
  [AppConstants.ORDER_STATUS.IN_PROGRESS]: {
    bg: colors.primaryLight,
    fg: colors.primary,
  },
  [AppConstants.ORDER_STATUS.DELIVERED]: {
    bg: colors.successLight,
    fg: colors.success,
  },
  [AppConstants.ORDER_STATUS.CANCELLED]: {
    bg: colors.dangerLight,
    fg: colors.danger,
  },
};

export const STATUS_TAB_ID_MAP: Record<OrderStatusTab, number | null> = {
  all: null,
  pending: AppConstants.ORDER_STATUS.PENDING,
  inprogress: AppConstants.ORDER_STATUS.IN_PROGRESS,
  delivered: AppConstants.ORDER_STATUS.DELIVERED,
  cancelled: AppConstants.ORDER_STATUS.CANCELLED,
};

export const ORDER_STATUS_TABS: { id: OrderStatusTab; labelKey: string }[] = [
  { id: 'all',        labelKey: 'orders.tabs.all' },
  { id: 'pending',    labelKey: 'orders.tabs.pending' },
  { id: 'inprogress', labelKey: 'orders.tabs.inProgress' },
  { id: 'delivered',  labelKey: 'orders.tabs.delivered' },
  { id: 'cancelled',  labelKey: 'orders.tabs.cancelled' },
];

export const getOrderStatusConfig = (statusId: number): OrderStatusConfig =>
  ORDER_STATUS_CONFIG[statusId] ?? { bg: colors.surface, fg: colors.textSecondary };
