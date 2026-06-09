import { eq, inArray } from 'drizzle-orm';

import type { InsertPaymentAllocation, LocalPaymentAllocation } from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';

import { db } from '../index';
import { paymentAllocations } from '../schema';

export const insertManyPaymentAllocations = (records: any[]): void => {
  if (!records.length) return;
  const serverIds = records.map((r) => r.serverId ?? r.id).filter((id): id is number => id != null);
  if (serverIds.length) db.delete(paymentAllocations).where(inArray(paymentAllocations.serverId, serverIds)).run();
  const values: InsertPaymentAllocation[] = records.map((r) => ({
    localId: r.localId ?? generateUUID(),
    serverId: r.serverId ?? r.id ?? null,
    paymentServerId: r.paymentId > 0 ? r.paymentId : null,
    paymentLocalId: r.paymentLocalId ?? null,
    orderServerId: r.orderId ?? null,
    purchaseServerId: r.purchaseId ?? null,
    invoiceServerId: r.invoiceId ?? null,
    allocatedAmount: r.allocatedAmount ?? 0,
    isSynced: true,
    version: r.version ?? 0,
    updatedAt: r.updatedAt ?? null,
  }));
  db.insert(paymentAllocations).values(values).run();
};

export const insertPaymentAllocation = (
  data: Omit<InsertPaymentAllocation, 'id' | 'localId' | 'isSynced'>,
): string => {
  const localId = generateUUID();
  db.insert(paymentAllocations)
    .values({ ...data, localId, isSynced: false } as InsertPaymentAllocation)
    .run();
  return localId;
};

export const getAllPaymentAllocations = (): LocalPaymentAllocation[] =>
  db.select().from(paymentAllocations).all();

export const getPaymentAllocationByLocalId = (localId: string): LocalPaymentAllocation | null => {
  const rows = db
    .select()
    .from(paymentAllocations)
    .where(eq(paymentAllocations.localId, localId))
    .limit(1)
    .all();
  return rows[0] ?? null;
};

export const getPaymentAllocationsByPaymentServerId = (
  paymentServerId: number,
): LocalPaymentAllocation[] =>
  db
    .select()
    .from(paymentAllocations)
    .where(eq(paymentAllocations.paymentServerId, paymentServerId))
    .all();

export const getPaymentAllocationsByPaymentLocalId = (
  paymentLocalId: string,
): LocalPaymentAllocation[] =>
  db
    .select()
    .from(paymentAllocations)
    .where(eq(paymentAllocations.paymentLocalId, paymentLocalId))
    .all();

export const getPaidAmountForOrder = (orderServerId: number): number =>
  db
    .select()
    .from(paymentAllocations)
    .where(eq(paymentAllocations.orderServerId, orderServerId))
    .all()
    .reduce((sum, a) => sum + a.allocatedAmount, 0);

export const getPaidAmountForPurchase = (purchaseServerId: number): number =>
  db
    .select()
    .from(paymentAllocations)
    .where(eq(paymentAllocations.purchaseServerId, purchaseServerId))
    .all()
    .reduce((sum, a) => sum + a.allocatedAmount, 0);
