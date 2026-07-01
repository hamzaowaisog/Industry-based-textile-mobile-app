import { AppConstants } from '@constants/appConstants';

export const formatAmount = (amount: number): string =>
  Math.abs(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 });

export const formatPKR = (amount: number): string =>
  AppConstants.APP.CURRENCY + ' ' + formatAmount(amount);

export const formatAmountInput = (raw: string): string => {
  if (!raw) return '';
  const [intPart, decPart] = raw.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};
