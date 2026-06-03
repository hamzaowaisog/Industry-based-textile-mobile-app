import { eq } from 'drizzle-orm';

import type { SyncPaymentDto } from '@api/models';
import type { InsertPayment, LocalPayment } from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';

import { db } from '../index';
import { payments } from '../schema';

export const insertManyPayments = (records: SyncPaymentDto[]): void => {
  if (!records.length) return;
  const values: InsertPayment[] = records.map((r) => ({
    localId: r.localId ?? generateUUID(),
    serverId: r.serverId ?? null,
    partyClientServerId: r.partyClientId ?? null,
    paymentDirectionId: r.paymentDirectionId ?? 1,
    transModeId: r.transModeId ?? 1,
    amount: r.amount ?? 0,
    paymentDate: r.paymentDate ?? new Date().toISOString().slice(0, 10),
    notes: r.notes ?? null,
    isSynced: true,
    createdAt: r.createdAt ?? null,
  }));
  db.insert(payments).values(values).run();
};

export const insertPayment = (data: Omit<InsertPayment, 'id' | 'localId' | 'isSynced'>): string => {
  const localId = generateUUID();
  db.insert(payments).values({ ...data, localId, isSynced: false } as InsertPayment).run();
  return localId;
};

export const getAllPayments = (): LocalPayment[] => db.select().from(payments).all();

export const getPaymentByLocalId = (localId: string): LocalPayment | null => {
  const rows = db.select().from(payments).where(eq(payments.localId, localId)).limit(1).all();
  return rows[0] ?? null;
};
