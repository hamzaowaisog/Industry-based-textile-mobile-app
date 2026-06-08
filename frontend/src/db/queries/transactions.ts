import { inArray } from 'drizzle-orm';

import type { SyncTransactionDto } from '@api/models';
import type { LocalTransaction } from '../../types/db.types';
import { toISODate } from '@utils/helpers/dateConvert';

import { db } from '../index';
import { transactions } from '../schema';

export const insertManyTransactions = (records: SyncTransactionDto[]): void => {
  if (!records.length) return;
  const serverIds = records.map((r) => r.serverId ?? r.id).filter((id): id is number => id != null);
  if (serverIds.length) db.delete(transactions).where(inArray(transactions.serverId, serverIds)).run();
  const values = records.map((r) => ({
    localId: r.localId ?? null,
    serverId: r.serverId ?? r.id ?? 0,
    clientId: r.clientId ?? null,
    orderId: r.orderId ?? null,
    purchaseId: r.purchaseId ?? null,
    invoiceId: r.invoiceId ?? null,
    userId: r.userId ?? null,
    transTypeId: r.transTypeId ?? null,
    transModeId: r.transModeId ?? null,
    transCategoryId: r.transCategoryId ?? null,
    amount: r.amount ?? 0,
    transDate: toISODate(r.transDate) ?? null,
    notes: r.notes ?? null,
    createdAt: toISODate(r.createdAt) ?? null,
    version: r.version ?? 0,
    updatedAt: r.updatedAt ?? null,
  }));
  db.insert(transactions).values(values).run();
};

export const getAllTransactions = (): LocalTransaction[] => db.select().from(transactions).all();
