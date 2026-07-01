import type { ComponentType } from 'react';

import { colors } from '@theme/colors';

import { AppConstants } from '../../constants/appConstants';
import { ArrowDownIcon, ArrowUpIcon } from '../../constants/svgAssets';
import type { IconProps } from '../../types/icon.types';
import type { PaymentDirectionTab } from '../../types/payments.types';

export type PaymentDirectionConfig = {
  bg: string;
  fg: string;
};

export const PAYMENT_DIRECTION_CONFIG: Record<number, PaymentDirectionConfig> = {
  [AppConstants.PAYMENT_DIRECTION.RECEIVED]: {
    bg: colors.successLight,
    fg: colors.success,
  },
  [AppConstants.PAYMENT_DIRECTION.PAID]: {
    bg: colors.warningLight,
    fg: colors.warning,
  },
};

export const getPaymentDirectionConfig = (directionId: number): PaymentDirectionConfig =>
  PAYMENT_DIRECTION_CONFIG[directionId] ?? {
    bg: colors.surface,
    fg: colors.textSecondary,
  };

export const PAYMENT_DIRECTION_TAB_ID_MAP: Record<PaymentDirectionTab, number | null> = {
  all: null,
  received: AppConstants.PAYMENT_DIRECTION.RECEIVED,
  paid: AppConstants.PAYMENT_DIRECTION.PAID,
};

export const PAYMENT_DIRECTION_TABS: { id: PaymentDirectionTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'payments.tabs.all' },
  { id: 'received', labelKey: 'payments.tabs.received' },
  { id: 'paid', labelKey: 'payments.tabs.paid' },
];

export const PAYMENT_DIRECTION_ICONS: Record<number, ComponentType<IconProps>> = {
  [AppConstants.PAYMENT_DIRECTION.RECEIVED]: ArrowDownIcon,
  [AppConstants.PAYMENT_DIRECTION.PAID]: ArrowUpIcon,
};

export const isPaymentReceived = (directionId: number): boolean =>
  directionId === AppConstants.PAYMENT_DIRECTION.RECEIVED;

export const getPaymentDirectionColor = (directionId: number): string =>
  isPaymentReceived(directionId) ? colors.success : colors.warning;

export const getPaymentDirectionLightColor = (directionId: number): string =>
  isPaymentReceived(directionId) ? colors.successLight : colors.warningLight;
