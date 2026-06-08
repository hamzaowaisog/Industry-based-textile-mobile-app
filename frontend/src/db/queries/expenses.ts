import { eq, inArray } from 'drizzle-orm';

import type { SyncExpenseDto } from '@api/models';
import type { InsertExpense, LocalExpense } from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';
import { toISODate } from '@utils/helpers/dateConvert';

import { db } from '../index';
import { expenses } from '../schema';

export const insertManyExpenses = (records: SyncExpenseDto[]): void => {
  if (!records.length) return;
  const serverIds = records.map((r) => r.serverId).filter((id): id is number => id != null);
  if (serverIds.length) db.delete(expenses).where(inArray(expenses.serverId, serverIds)).run();
  const values: InsertExpense[] = records.map((r) => ({
    localId: r.localId ?? generateUUID(),
    serverId: r.serverId ?? null,
    expenseTypeId: r.expenseTypeId ?? 1,
    amount: r.amount ?? 0,
    transModeId: r.transModeId ?? 1,
    transCategoryId: r.transCategoryId ?? null,
    expenseDate: toISODate(r.expenseDate) ?? new Date().toISOString().slice(0, 10),
    notes: r.notes ?? null,
    isSynced: true,
    createdAt: toISODate(r.createdAt) ?? null,
    version: r.version ?? 0,
    updatedAt: r.updatedAt ?? null,
  }));
  db.insert(expenses).values(values).run();
};

export const insertExpense = (data: Omit<InsertExpense, 'id' | 'localId' | 'isSynced'>): string => {
  const localId = generateUUID();
  db.insert(expenses).values({ ...data, localId, isSynced: false } as InsertExpense).run();
  return localId;
};

export const getAllExpenses = (): LocalExpense[] => db.select().from(expenses).all();

export const getExpenseByLocalId = (localId: string): LocalExpense | null => {
  const rows = db.select().from(expenses).where(eq(expenses.localId, localId)).limit(1).all();
  return rows[0] ?? null;
};
