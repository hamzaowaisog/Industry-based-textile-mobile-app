import { create } from 'zustand';

import { queryClient } from '@api/queryClient';

import { queryKeys } from '@constants/queryKeys';

import {
  createExpenseAsync,
  deleteExpenseAsync,
  fetchExpenseDetailAsync,
  updateExpenseAsync,
} from '../core/expenses';
import type {
  AddExpenseFormValues,
  EditExpenseFormValues,
  ExpenseStore,
} from '../types/expenses.types';

export const useExpenseStore = create<ExpenseStore>((set) => ({
  currentExpense: null,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchExpenseDetail: async (expenseId) => {
    set({ detailLoading: true, currentExpense: null });
    try {
      const detail = await fetchExpenseDetailAsync(expenseId);
      set({ currentExpense: detail, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  createExpense: async (values: AddExpenseFormValues) => {
    set({ submitting: true });
    const result = await createExpenseAsync(values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    }
    return result;
  },

  updateExpense: async (expenseId, values: EditExpenseFormValues) => {
    set({ submitting: true });
    const result = await updateExpenseAsync(expenseId, values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    }
    return result;
  },

  deleteExpense: async (expenseId) => {
    const result = await deleteExpenseAsync(expenseId);
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    }
    return result;
  },

  clearCurrentExpense: () => set({ currentExpense: null }),
  prepareDetailLoad: () => set({ detailLoading: true, currentExpense: null }),
}));
