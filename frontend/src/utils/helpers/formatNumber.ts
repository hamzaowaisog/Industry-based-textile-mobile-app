export const formatCompactNumber = (n: number): string =>
  n >= 1000000
    ? `${(n / 1000000).toFixed(1)}M`
    : n >= 1000
      ? `${(n / 1000).toFixed(0)}K`
      : String(n);
