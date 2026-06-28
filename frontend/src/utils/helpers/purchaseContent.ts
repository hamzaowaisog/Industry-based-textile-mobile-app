import type { ComponentType } from 'react';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { AlertIcon, CheckIcon, ClockIcon, TruckIcon } from '@constants/svgAssets';

import type { IconProps } from '@types/icon.types';
import type { PurchaseStatusConfig, PurchaseStatusTab } from '@types/purchases.types';

export const PURCHASE_STATUS_CONFIG: Record<number, PurchaseStatusConfig> = {
  [AppConstants.PURCHASE_STATUS.PENDING]: {
    bg: colors.warningLight,
    fg: colors.warning,
  },
  [AppConstants.PURCHASE_STATUS.IN_PROGRESS]: {
    bg: colors.primaryLight,
    fg: colors.primary,
  },
  [AppConstants.PURCHASE_STATUS.DELIVERED]: {
    bg: colors.successLight,
    fg: colors.success,
  },
  [AppConstants.PURCHASE_STATUS.CANCELLED]: {
    bg: colors.dangerLight,
    fg: colors.danger,
  },
};

export const PURCHASE_STATUS_TAB_ID_MAP: Record<PurchaseStatusTab, number | null> = {
  all: null,
  pending: AppConstants.PURCHASE_STATUS.PENDING,
  inprogress: AppConstants.PURCHASE_STATUS.IN_PROGRESS,
  delivered: AppConstants.PURCHASE_STATUS.DELIVERED,
  cancelled: AppConstants.PURCHASE_STATUS.CANCELLED,
};

export const PURCHASE_STATUS_TABS: { id: PurchaseStatusTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'purchases.tabs.all' },
  { id: 'pending', labelKey: 'purchases.tabs.pending' },
  { id: 'inprogress', labelKey: 'purchases.tabs.inProgress' },
  { id: 'delivered', labelKey: 'purchases.tabs.received' },
  { id: 'cancelled', labelKey: 'purchases.tabs.cancelled' },
];

export const getPurchaseStatusConfig = (statusId: number): PurchaseStatusConfig =>
  PURCHASE_STATUS_CONFIG[statusId] ?? { bg: colors.surface, fg: colors.textSecondary };

export const PURCHASE_STATUS_ICONS: Record<number, ComponentType<IconProps>> = {
  [AppConstants.PURCHASE_STATUS.PENDING]: ClockIcon,
  [AppConstants.PURCHASE_STATUS.IN_PROGRESS]: TruckIcon,
  [AppConstants.PURCHASE_STATUS.DELIVERED]: CheckIcon,
  [AppConstants.PURCHASE_STATUS.CANCELLED]: AlertIcon,
};

export const PURCHASE_PROGRESS_STEPS: { id: number; labelKey: string }[] = [
  { id: AppConstants.PURCHASE_STATUS.PENDING, labelKey: 'purchases.status.pending' },
  { id: AppConstants.PURCHASE_STATUS.IN_PROGRESS, labelKey: 'purchases.status.inProgress' },
  { id: AppConstants.PURCHASE_STATUS.DELIVERED, labelKey: 'purchases.status.received' },
];

export const PURCHASE_STATUS_TO_STEP: Record<number, number> = {
  [AppConstants.PURCHASE_STATUS.PENDING]: 0,
  [AppConstants.PURCHASE_STATUS.IN_PROGRESS]: 1,
  [AppConstants.PURCHASE_STATUS.DELIVERED]: 2,
};
