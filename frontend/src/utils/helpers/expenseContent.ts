import { colors } from '@theme/colors';

export const EXPENSE_CATEGORY_COLORS: string[] = [
  colors.primary,
  colors.success,
  colors.warning,
  colors.violet,
  colors.danger,
];

export const EXPENSE_CATEGORY_LIGHT_COLORS: string[] = [
  colors.primaryLight,
  colors.successLight,
  colors.warningLight,
  colors.violetLight,
  colors.dangerLight,
];

export const getExpenseCategoryColor = (expenseTypeId: number): string =>
  EXPENSE_CATEGORY_COLORS[expenseTypeId % EXPENSE_CATEGORY_COLORS.length];

export const getExpenseCategoryLightColor = (expenseTypeId: number): string =>
  EXPENSE_CATEGORY_LIGHT_COLORS[expenseTypeId % EXPENSE_CATEGORY_LIGHT_COLORS.length];
