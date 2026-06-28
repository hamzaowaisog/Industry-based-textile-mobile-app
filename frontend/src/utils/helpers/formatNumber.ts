import { AppConstants } from '@constants/appConstants';

const { THOUSAND, MILLION, DECIMALS_COMPACT, DECIMALS_ROUND } = AppConstants.NUMBER;

export const formatCompactNumber = (n: number): string =>
  n >= MILLION
    ? `${(n / MILLION).toFixed(DECIMALS_COMPACT)}M`
    : n >= THOUSAND
      ? `${(n / THOUSAND).toFixed(DECIMALS_ROUND)}K`
      : String(n);
