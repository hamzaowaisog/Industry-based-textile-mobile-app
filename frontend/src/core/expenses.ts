import {
  expenseCreate,
  expenseDelete,
  expenseGetAll,
  expenseGetById,
  expenseGetFiltered,
  expenseUpdate,
} from '@api/generated/expense/expense';
import type {
  ExpenseCreateViewModel,
  ExpenseDto,
  ExpenseDtoPagedList,
  ExpenseUpdateViewModel,
} from '@api/models';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import { getCurrentMonthRange } from '@utils/helpers/dateConvert';
import {
  buildExpenseMonthSummary,
  mapApiExpenseDetail,
  mapApiExpenseToRow,
} from '@utils/helpers/expenseMappers';
import i18n from '@utils/i18n';

import type {
  AddExpenseFormValues,
  EditExpenseFormValues,
  ExpenseDetail,
  ExpenseMonthSummary,
  ExpenseRow,
} from '../types/expenses.types';

export const fetchExpensesPageAsync = async (
  page: number,
  pageSize: number,
): Promise<{ items: ExpenseRow[]; hasNextPage: boolean }> => {
  try {
    const res = await expenseGetAll({ page, pageSize });
    const r = parseApiResponse<ExpenseDtoPagedList>(res, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false };
    return {
      items: (r.data.items ?? []).map(mapApiExpenseToRow),
      hasNextPage: !!r.data.hasNextPage,
    };
  } catch {
    return { items: [], hasNextPage: false };
  }
};

export const fetchExpenseMonthSummaryAsync = async (): Promise<ExpenseMonthSummary | null> => {
  try {
    const { from, to } = getCurrentMonthRange();
    const res = await expenseGetFiltered({ dateFrom: from, dateTo: to });
    const r = parseApiResponse<ExpenseDto[]>(res, '');
    if (!r.success || !r.data) return null;
    return buildExpenseMonthSummary(r.data.map(mapApiExpenseToRow));
  } catch {
    return null;
  }
};

export const fetchExpenseDetailAsync = async (expenseId: number): Promise<ExpenseDetail | null> => {
  try {
    const res = await expenseGetById(expenseId);
    const r = parseApiResponse<ExpenseDto>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiExpenseDetail(r.data);
  } catch {
    return null;
  }
};

export const createExpenseAsync = async (
  values: AddExpenseFormValues,
): Promise<{ success: boolean; error?: string; expenseId?: number }> => {
  try {
    const payload: ExpenseCreateViewModel = {
      expenseTypeId: values.expenseTypeId ?? undefined,
      amount: parseFloat(values.amount),
      transModeId: values.transModeId,
      expenseDate: values.expenseDate.trim() || null,
      notes: values.notes.trim() || null,
    };
    const res = await expenseCreate(payload);
    const r = parseApiResponse<ExpenseDto>(res, i18n.t('expenses.add.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, expenseId: r.data?.id };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('expenses.add.errorTitle')),
    };
  }
};

export const updateExpenseAsync = async (
  expenseId: number,
  values: EditExpenseFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: ExpenseUpdateViewModel = {
      amount: parseFloat(values.amount),
      transModeId: values.transModeId,
      expenseDate: values.expenseDate.trim() || null,
      notes: values.notes.trim() || null,
    };
    const res = await expenseUpdate(expenseId, payload);
    const r = parseApiResponse<ExpenseDto>(res, i18n.t('expenses.edit.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('expenses.edit.errorTitle')),
    };
  }
};

export const deleteExpenseAsync = async (
  expenseId: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await expenseDelete(expenseId);
    const r = parseApiResponse(res, i18n.t('expenses.deleteTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('expenses.deleteTitle')),
    };
  }
};
