import { eq } from 'drizzle-orm';

import type { SyncPurchaseDto } from '@api/models';

import { generateUUID } from '@utils/helpers/uuid';

import type {
  InsertPurchase,
  InsertPurchaseLine,
  LocalPurchase,
  LocalPurchaseLine,
  LocalPurchaseWithLines,
} from '../../types/db.types';
import { db } from '../index';
import { purchaseLines, purchases } from '../schema';

export const insertManyPurchases = (records: SyncPurchaseDto[]): void => {
  if (!records.length) return;
  for (const r of records) {
    const values: InsertPurchase = {
      localId: r.localId ?? generateUUID(),
      serverId: r.serverId ?? null,
      supplierServerId: r.supplierId ?? null,
      statusId: r.statusId ?? 1,
      paymentTypeId: r.paymentTypeId ?? 1,
      purchaseDate: r.purchaseDate ?? new Date().toISOString().slice(0, 10),
      notes: r.notes ?? null,
      totalAmount: 0,
      isSynced: true,
      createdAt: r.createdAt ?? null,
    };
    const result = db.insert(purchases).values(values).run();
    const insertedId = result.lastInsertRowId as number;

    if (r.purchaseLines?.length) {
      const lines: InsertPurchaseLine[] = r.purchaseLines.map((l) => ({
        purchaseId: insertedId,
        productServerId: l.productId ?? null,
        qty: l.qty ?? 0,
        unitCost: l.unitCost ?? 0,
      }));
      db.insert(purchaseLines).values(lines).run();
    }
  }
};

export const insertPurchase = (
  data: Omit<InsertPurchase, 'id' | 'localId' | 'isSynced'>,
  lines: Omit<InsertPurchaseLine, 'id' | 'purchaseId'>[],
): string => {
  const localId = generateUUID();
  const result = db
    .insert(purchases)
    .values({ ...data, localId, isSynced: false } as InsertPurchase)
    .run();
  const insertedId = result.lastInsertRowId as number;
  if (lines.length) {
    db.insert(purchaseLines)
      .values(lines.map((l) => ({ ...l, purchaseId: insertedId }) as InsertPurchaseLine))
      .run();
  }
  return localId;
};

export const getAllPurchases = (): LocalPurchase[] => db.select().from(purchases).all();

export const getPurchaseWithLines = (localId: string): LocalPurchaseWithLines | null => {
  const purchase = db
    .select()
    .from(purchases)
    .where(eq(purchases.localId, localId))
    .limit(1)
    .all()[0];
  if (!purchase) return null;
  const lines = db
    .select()
    .from(purchaseLines)
    .where(eq(purchaseLines.purchaseId, purchase.id))
    .all();
  return { ...purchase, lines };
};

export const getPurchaseLinesByPurchaseId = (purchaseId: number): LocalPurchaseLine[] =>
  db.select().from(purchaseLines).where(eq(purchaseLines.purchaseId, purchaseId)).all();
