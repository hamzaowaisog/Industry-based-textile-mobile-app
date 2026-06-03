import type { SyncStockMovementDto } from '@api/models';
import type { InsertStockMovement, LocalStockMovement } from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';

import { db } from '../index';
import { stockMovements } from '../schema';

export const insertManyStockMovements = (records: SyncStockMovementDto[]): void => {
  if (!records.length) return;
  const values: InsertStockMovement[] = records.map((r) => ({
    localId: r.localId ?? generateUUID(),
    serverId: r.serverId ?? null,
    productServerId: r.productId ?? null,
    movementTypeId: r.movementTypeId ?? 1,
    movementSourceId: r.movementSourceId ?? 3,
    qty: r.qty ?? 0,
    unitCost: r.unitCost ?? null,
    unitPrice: r.unitPrice ?? null,
    movementDate: r.movementDate ?? new Date().toISOString().slice(0, 10),
    isSynced: true,
  }));
  db.insert(stockMovements).values(values).run();
};

export const getAllStockMovements = (): LocalStockMovement[] =>
  db.select().from(stockMovements).all();
