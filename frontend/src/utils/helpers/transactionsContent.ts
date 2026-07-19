import type { ComponentType } from 'react';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  CreditCardIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  TruckIcon,
  WalletIcon,
} from '@constants/svgAssets';

import type { IconProps } from '../../types/icon.types';

const { SALES, PURCHASES, OFFICE_EXPENSES, HOME_EXPENSES, CASH_IN, CASH_OUT, BANK_IN, BANK_OUT } =
  AppConstants.TRANS_CATEGORY;

export const TRANS_CATEGORY_ICONS: Record<number, ComponentType<IconProps>> = {
  [SALES]: ShoppingBagIcon,
  [PURCHASES]: TruckIcon,
  [OFFICE_EXPENSES]: ReceiptIcon,
  [HOME_EXPENSES]: ReceiptIcon,
  [CASH_IN]: WalletIcon,
  [CASH_OUT]: WalletIcon,
  [BANK_IN]: CreditCardIcon,
  [BANK_OUT]: CreditCardIcon,
};

export const getTransTypeColor = (transTypeId: number): string =>
  transTypeId === AppConstants.TRANS_TYPE.CREDIT ? colors.success : colors.danger;

export const getTransTypeLightColor = (transTypeId: number): string =>
  transTypeId === AppConstants.TRANS_TYPE.CREDIT ? colors.successLight : colors.dangerLight;

export const getTransTypeSign = (transTypeId: number): string =>
  transTypeId === AppConstants.TRANS_TYPE.CREDIT ? '+' : '−';

export const TRANS_CATEGORY_FILTERS: { id: number | null; labelKey: string }[] = [
  { id: null, labelKey: 'common.all' },
  { id: OFFICE_EXPENSES, labelKey: 'transactions.categories.officeExpenses' },
  { id: HOME_EXPENSES, labelKey: 'transactions.categories.homeExpenses' },
  { id: CASH_IN, labelKey: 'transactions.categories.cashIn' },
  { id: CASH_OUT, labelKey: 'transactions.categories.cashOut' },
  { id: BANK_IN, labelKey: 'transactions.categories.bankIn' },
  { id: BANK_OUT, labelKey: 'transactions.categories.bankOut' },
];
