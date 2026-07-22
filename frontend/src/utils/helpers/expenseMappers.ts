import type { ExpenseDto } from '@api/models';

import type {
  ExpenseCategorySlice,
  ExpenseDetail,
  ExpenseMonthSummary,
  ExpenseRow,
} from '../../types/expenses.types';

export const mapApiExpenseToRow = (e: ExpenseDto): ExpenseRow => ({
  id: e.id ?? 0,
  expenseTypeId: e.expenseTypeId ?? 0,
  expenseTypeName: e.expenseTypeName ?? '',
  transModeId: e.transModeId ?? 1,
  transModeName: e.transModeName ?? '',
  transCategoryName: e.transCategoryName ?? '',
  amount: e.amount ?? 0,
  expenseDate: e.expenseDate ?? '',
  expenseDateHijriDisplay: e.expenseDateHijriDisplay ?? null,
  notes: e.notes ?? null,
});

export const mapApiExpenseDetail = (e: ExpenseDto): ExpenseDetail => ({
  id: e.id ?? 0,
  expenseTypeId: e.expenseTypeId ?? 0,
  expenseTypeName: e.expenseTypeName ?? '',
  transModeId: e.transModeId ?? 1,
  transModeName: e.transModeName ?? '',
  transCategoryId: e.transCategoryId ?? null,
  transCategoryName: e.transCategoryName ?? '',
  transactionId: e.transactionId ?? null,
  amount: e.amount ?? 0,
  expenseDate: e.expenseDate ?? '',
  expenseDateHijriDisplay: e.expenseDateHijriDisplay ?? null,
  notes: e.notes ?? null,
  recordedByName: e.recordedByName ?? null,
  createdAt: e.createdAt ?? null,
});

export const buildExpenseMonthSummary = (expenses: ExpenseRow[]): ExpenseMonthSummary => {
  const byCategory = new Map<number, { name: string; amount: number }>();
  let total = 0;
  expenses.forEach((e) => {
    total += e.amount;
    const existing = byCategory.get(e.expenseTypeId);
    byCategory.set(e.expenseTypeId, {
      name: e.expenseTypeName,
      amount: (existing?.amount ?? 0) + e.amount,
    });
  });
  const categories: ExpenseCategorySlice[] = Array.from(byCategory.entries())
    .map(([expenseTypeId, { name, amount }]) => ({ expenseTypeId, name, amount }))
    .sort((a, b) => b.amount - a.amount);
  return { total, entryCount: expenses.length, categories };
};
