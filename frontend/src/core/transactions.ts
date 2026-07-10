import {
  transactionGetAll,
  transactionGetById,
  transactionGetSummary,
} from '@api/generated/transaction/transaction';
import type { TransactionDto, TransactionDtoPagedList, TransactionSummaryDto } from '@api/models';

import { parseApiResponse } from '@utils/helpers/apiResponse';
import {
  mapApiTransactionDetail,
  mapApiTransactionSummary,
  mapApiTransactionToRow,
} from '@utils/helpers/transactionsMappers';

import type {
  TransactionDetail,
  TransactionRow,
  TransactionSummary,
} from '../types/transactions.types';

export const fetchTransactionsPageAsync = async (
  page: number,
  pageSize: number,
): Promise<{ items: TransactionRow[]; hasNextPage: boolean }> => {
  try {
    const res = await transactionGetAll({ page, pageSize });
    const r = parseApiResponse<TransactionDtoPagedList>(res, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false };
    return {
      items: (r.data.items ?? []).map(mapApiTransactionToRow),
      hasNextPage: !!r.data.hasNextPage,
    };
  } catch {
    return { items: [], hasNextPage: false };
  }
};

export const fetchTransactionsSummaryAsync = async (): Promise<TransactionSummary> => {
  try {
    const res = await transactionGetSummary();
    const r = parseApiResponse<TransactionSummaryDto>(res, '');
    if (!r.success || !r.data) return { totalCredit: 0, totalDebit: 0 };
    return mapApiTransactionSummary(r.data);
  } catch {
    return { totalCredit: 0, totalDebit: 0 };
  }
};

export const fetchTransactionDetailAsync = async (
  transactionId: number,
): Promise<TransactionDetail | null> => {
  try {
    const res = await transactionGetById(transactionId);
    const r = parseApiResponse<TransactionDto>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiTransactionDetail(r.data);
  } catch {
    return null;
  }
};
