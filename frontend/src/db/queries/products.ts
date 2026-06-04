import { eq } from 'drizzle-orm';

import type { SyncProductDto } from '@api/models';
import type { InsertProduct, LocalProduct } from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';

import { db } from '../index';
import { products } from '../schema';

export const insertManyProducts = (records: SyncProductDto[]): void => {
  if (!records.length) return;
  const values: InsertProduct[] = records.map((r) => ({
    localId: r.localId ?? generateUUID(),
    serverId: r.serverId ?? r.id ?? null,
    name: r.name ?? '',
    sku: r.sku ?? null,
    unit: r.unit ?? null,
    defaultCost: r.defaultCost ?? null,
    defaultPrice: r.defaultPrice ?? null,
    quantity: r.quantity ?? 0,
    averageCost: r.averageCost ?? null,
    averagePrice: r.averagePrice ?? null,
    costChangeCount: r.costChangeCount ?? 0,
    priceChangeCount: r.priceChangeCount ?? 0,
    totalQuantitySold: r.totalQuantitySold ?? 0,
    totalQuantityPurchased: r.totalQuantityPurchased ?? 0,
    reorderLevel: r.reorderLevel ?? null,
    isActive: r.isActive ?? true,
    isSynced: true,
    version: r.version ?? 0,
    updatedAt: r.updatedAt ?? null,
  }));
  db.insert(products).values(values).run();
};

export const insertProduct = (data: Omit<InsertProduct, 'id' | 'localId' | 'isSynced'>): string => {
  const localId = generateUUID();
  db.insert(products).values({ ...data, localId, isSynced: false } as InsertProduct).run();
  return localId;
};

export const getAllProducts = (): LocalProduct[] => db.select().from(products).all();

export const getProductByLocalId = (localId: string): LocalProduct | null => {
  const rows = db.select().from(products).where(eq(products.localId, localId)).limit(1).all();
  return rows[0] ?? null;
};

export const getProductByServerId = (serverId: number): LocalProduct | null => {
  const rows = db.select().from(products).where(eq(products.serverId, serverId)).limit(1).all();
  return rows[0] ?? null;
};
