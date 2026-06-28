import type { ComponentType } from 'react';

import { colors } from '@theme/colors';

import { AppConstants } from '../../constants/appConstants';
import { AlertIcon, CheckIcon, ClockIcon, TruckIcon } from '../../constants/svgAssets';
import type { IconProps } from '../../types/icon.types';
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
  { id: 'all', labelKey: 'orders.tabs.all' },
  { id: 'pending', labelKey: 'orders.tabs.pending' },
  { id: 'inprogress', labelKey: 'orders.tabs.inProgress' },
  { id: 'delivered', labelKey: 'orders.tabs.delivered' },
  { id: 'cancelled', labelKey: 'orders.tabs.cancelled' },
];

export const getOrderStatusConfig = (statusId: number): OrderStatusConfig =>
  ORDER_STATUS_CONFIG[statusId] ?? { bg: colors.surface, fg: colors.textSecondary };

export const ORDER_STATUS_ICONS: Record<number, ComponentType<IconProps>> = {
  [AppConstants.ORDER_STATUS.PENDING]: ClockIcon,
  [AppConstants.ORDER_STATUS.IN_PROGRESS]: TruckIcon,
  [AppConstants.ORDER_STATUS.DELIVERED]: CheckIcon,
  [AppConstants.ORDER_STATUS.CANCELLED]: AlertIcon,
};

export const ORDER_PROGRESS_STEPS: { id: number; labelKey: string }[] = [
  { id: AppConstants.ORDER_STATUS.PENDING, labelKey: 'orders.status.pending' },
  { id: AppConstants.ORDER_STATUS.IN_PROGRESS, labelKey: 'orders.status.inProgress' },
  { id: AppConstants.ORDER_STATUS.DELIVERED, labelKey: 'orders.status.delivered' },
];

export const ORDER_STATUS_TO_STEP: Record<number, number> = {
  [AppConstants.ORDER_STATUS.PENDING]: 0,
  [AppConstants.ORDER_STATUS.IN_PROGRESS]: 1,
  [AppConstants.ORDER_STATUS.DELIVERED]: 2,
};
