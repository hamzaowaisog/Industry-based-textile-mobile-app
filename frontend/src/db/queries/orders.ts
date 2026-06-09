import { desc, eq, inArray } from 'drizzle-orm';

import type { SyncOrderDto } from '@api/models';
import type {
  InsertOrder,
  InsertOrderLine,
  LocalOrder,
  LocalOrderLine,
  LocalOrderWithLines,
} from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';
import { toISODate } from '@utils/helpers/dateConvert';

import { db } from '../index';
import { getPaidAmountForOrder } from './paymentAllocations';
import { orderLines, orders } from '../schema';

export const insertManyOrders = (records: SyncOrderDto[]): void => {
  if (!records.length) return;
  const serverIds = records.map((r) => r.serverId).filter((id): id is number => id != null);
  if (serverIds.length) {
    const existingIds = db.select({ id: orders.id }).from(orders).where(inArray(orders.serverId, serverIds)).all().map((o) => o.id);
    if (existingIds.length) db.delete(orderLines).where(inArray(orderLines.orderId, existingIds)).run();
    db.delete(orders).where(inArray(orders.serverId, serverIds)).run();
  }
  for (const r of records) {
    const values: InsertOrder = {
      localId: r.localId ?? generateUUID(),
      serverId: r.serverId ?? null,
      userId: r.userId ?? null,
      clientServerId: r.clientId ?? null,
      statusId: r.statusId ?? 1,
      paymentTypeId: r.paymentTypeId ?? 1,
      orderDate: toISODate(r.orderDate) ?? new Date().toISOString().slice(0, 10),
      notes: r.notes ?? null,
      totalAmount: 0,
      isSynced: true,
      createdAt: toISODate(r.createdAt) ?? null,
      version: r.version ?? 0,
      updatedAt: r.updatedAt ?? null,
    };
    const result = db.insert(orders).values(values).run();
    const insertedId = result.lastInsertRowId as number;

    if (r.orderLines?.length) {
      const lines: InsertOrderLine[] = r.orderLines.map((l) => ({
        orderId: insertedId,
        productServerId: l.productId ?? null,
        qty: l.qty ?? 0,
        unitPrice: l.unitPrice ?? 0,
      }));
      db.insert(orderLines).values(lines).run();
    }
  }
};

export const insertOrder = (
  data: Omit<InsertOrder, 'id' | 'localId' | 'isSynced'>,
  lines: Omit<InsertOrderLine, 'id' | 'orderId'>[],
): string => {
  const localId = generateUUID();
  const result = db.insert(orders).values({ ...data, localId, isSynced: false } as InsertOrder).run();
  const insertedId = result.lastInsertRowId as number;
  if (lines.length) {
    db.insert(orderLines)
      .values(lines.map((l) => ({ ...l, orderId: insertedId }) as InsertOrderLine))
      .run();
  }
  return localId;
};

export const getAllOrders = (): LocalOrder[] => db.select().from(orders).all();

export const getOrderWithLines = (localId: string): LocalOrderWithLines | null => {
  const order = db.select().from(orders).where(eq(orders.localId, localId)).limit(1).all()[0];
  if (!order) return null;
  const lines = db.select().from(orderLines).where(eq(orderLines.orderId, order.id)).all();
  return { ...order, lines };
};

export const getOrderLinesByOrderId = (orderId: number): LocalOrderLine[] =>
  db.select().from(orderLines).where(eq(orderLines.orderId, orderId)).all();

export type LocalOrderWithPaid = LocalOrder & { amountPaid: number };

export const getOrdersByClientServerId = (clientServerId: number): LocalOrderWithPaid[] => {
  const rows = db.select().from(orders).where(eq(orders.clientServerId, clientServerId)).orderBy(desc(orders.orderDate)).all();
  return rows.map((order) => {
    const lines = db.select().from(orderLines).where(eq(orderLines.orderId, order.id)).all();
    const total = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    const amountPaid = order.serverId ? getPaidAmountForOrder(order.serverId) : 0;
    return { ...order, totalAmount: total > 0 ? total : (order.totalAmount ?? 0), amountPaid };
  });
};
