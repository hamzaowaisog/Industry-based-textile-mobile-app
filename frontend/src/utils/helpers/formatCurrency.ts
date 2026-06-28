import { AppConstants } from '@constants/appConstants';

export const formatAmount = (amount: number): string =>
  Math.abs(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 });

export const formatPKR = (amount: number): string =>
  AppConstants.APP.CURRENCY + ' ' + formatAmount(amount);
