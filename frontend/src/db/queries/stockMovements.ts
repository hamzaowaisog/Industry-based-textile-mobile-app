import { eq, inArray } from 'drizzle-orm';

import type { SyncStockMovementDto } from '@api/models';
import type { InsertStockMovement, LocalStockMovement } from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';
import { toISODate } from '@utils/helpers/dateConvert';

import { db } from '../index';
import { stockMovements } from '../schema';

export const insertManyStockMovements = (records: SyncStockMovementDto[]): void => {
  if (!records.length) return;
  const serverIds = records.map((r) => r.serverId).filter((id): id is number => id != null);
  if (serverIds.length) db.delete(stockMovements).where(inArray(stockMovements.serverId, serverIds)).run();
  const values: InsertStockMovement[] = records.map((r) => ({
    localId: r.localId ?? generateUUID(),
    serverId: r.serverId ?? null,
    productServerId: r.productId ?? null,
    movementTypeId: r.movementTypeId ?? 1,
    movementSourceId: r.movementSourceId ?? 3,
    qty: r.qty ?? 0,
    unitCost: r.unitCost ?? null,
    unitPrice: r.unitPrice ?? null,
    averageCostAtMovement: (r as any).averageCostAtMovement ?? null,
    averagePriceAtMovement: (r as any).averagePriceAtMovement ?? null,
    movementDate: toISODate(r.movementDate) ?? new Date().toISOString().slice(0, 10),
    isSynced: true,
    version: r.version ?? 0,
    updatedAt: r.updatedAt ?? null,
  }));
  db.insert(stockMovements).values(values).run();
};

export const insertStockMovement = (
  data: Omit<InsertStockMovement, 'id' | 'localId' | 'isSynced'>,
): string => {
  const localId = generateUUID();
  db.insert(stockMovements)
    .values({ ...data, localId, isSynced: false } as InsertStockMovement)
    .run();
  return localId;
};

export const getAllStockMovements = (): LocalStockMovement[] =>
  db.select().from(stockMovements).all();

export const getStockMovementByLocalId = (localId: string): LocalStockMovement | null => {
  const rows = db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.localId, localId))
    .limit(1)
    .all();
  return rows[0] ?? null;
};
