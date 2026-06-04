import type { SyncTransactionDto } from '@api/models';
import type { LocalTransaction } from '../../types/db.types';
import { toISODate } from '@utils/helpers/dateConvert';

import { db } from '../index';
import { transactions } from '../schema';

export const insertManyTransactions = (records: SyncTransactionDto[]): void => {
  if (!records.length) return;
  const values = records.map((r) => ({
    localId: r.localId ?? null,
    serverId: r.serverId ?? r.id ?? 0,
    clientId: r.clientId ?? null,
    orderId: r.orderId ?? null,
    purchaseId: r.purchaseId ?? null,
    invoiceId: (r as any).invoiceId ?? null,
    userId: r.userId ?? null,
    transTypeId: r.transTypeId ?? null,
    transModeId: r.transModeId ?? null,
    transCategoryId: r.transCategoryId ?? null,
    amount: r.amount ?? 0,
    transDate: toISODate(r.transDate) ?? null,
    notes: r.notes ?? null,
    version: r.version ?? 0,
    updatedAt: r.updatedAt ?? null,
  }));
  db.insert(transactions).values(values).run();
};

export const getAllTransactions = (): LocalTransaction[] => db.select().from(transactions).all();
