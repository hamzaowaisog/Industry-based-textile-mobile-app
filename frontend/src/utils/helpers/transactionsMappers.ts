import type { TransactionDto, TransactionSummaryDto } from '@api/models';

import type {
  TransactionDetail,
  TransactionRow,
  TransactionSummary,
} from '../../types/transactions.types';

export const mapApiTransactionToRow = (t: TransactionDto): TransactionRow => ({
  id: t.id ?? 0,
  clientName: t.clientName ?? '',
  billNo: t.billNo ?? null,
  billNos: t.billNos ?? [],
  transTypeId: t.transTypeId ?? 0,
  transTypeName: t.transTypeName ?? '',
  transCategoryId: t.transCategoryId ?? 0,
  transCategoryName: t.transCategoryName ?? '',
  transModeName: t.transModeName ?? '',
  amount: t.amount ?? 0,
  transDate: t.transDate ?? '',
  source: t.source ?? '',
});

export const mapApiTransactionSummary = (s: TransactionSummaryDto): TransactionSummary => ({
  totalCredit: s.totalCredit ?? 0,
  totalDebit: s.totalDebit ?? 0,
});

export const mapApiTransactionDetail = (t: TransactionDto): TransactionDetail => ({
  id: t.id ?? 0,
  clientName: t.clientName ?? '',
  billNo: t.billNo ?? null,
  billNos: t.billNos ?? [],
  userName: t.userName ?? '',
  orderId: t.orderId ?? null,
  purchaseId: t.purchaseId ?? null,
  transTypeId: t.transTypeId ?? 0,
  transTypeName: t.transTypeName ?? '',
  transModeId: t.transModeId ?? 0,
  transModeName: t.transModeName ?? '',
  transCategoryId: t.transCategoryId ?? 0,
  transCategoryName: t.transCategoryName ?? '',
  amount: t.amount ?? 0,
  transDate: t.transDate ?? '',
  notes: t.notes ?? '',
  source: t.source ?? '',
  isManual: t.isManual ?? false,
});
