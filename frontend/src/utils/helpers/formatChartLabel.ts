/** Splits "May 2026" / "Rabi I 1448" into two lines (year on the second). */
export const formatTwoLineMonthYearLabel = (monthLabel: string): string => {
  const lastSpace = monthLabel.lastIndexOf(' ');
  if (lastSpace <= 0) return monthLabel;
  return `${monthLabel.slice(0, lastSpace)}\n${monthLabel.slice(lastSpace + 1)}`;
};
