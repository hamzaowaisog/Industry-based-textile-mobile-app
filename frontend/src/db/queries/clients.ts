import { eq } from 'drizzle-orm';

import type { SyncClientDto } from '@api/models';
import type { InsertClient, LocalClient } from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';
import { toISODate } from '@utils/helpers/dateConvert';

import { db } from '../index';
import { clients } from '../schema';

export const insertManyClients = (records: SyncClientDto[]): void => {
  if (!records.length) return;
  const values: InsertClient[] = records.map((r) => ({
    localId: r.localId ?? generateUUID(),
    serverId: r.serverId ?? null,
    name: r.name ?? '',
    phone: r.phone ?? null,
    address: r.address ?? null,
    clientTypeId: r.clientTypeId ?? 1,
    creditLimit: r.creditLimit ?? null,
    openingBalance: r.openingBalance ?? null,
    notes: r.notes ?? null,
    isActive: r.isActive ?? true,
    isSynced: true,
    createdAt: toISODate(r.createdAt) ?? null,
    version: r.version ?? 0,
    updatedAt: r.updatedAt ?? null,
  }));
  db.insert(clients).values(values).run();
};

export const insertClient = (data: Omit<InsertClient, 'id' | 'localId' | 'isSynced'>): string => {
  const localId = generateUUID();
  db.insert(clients).values({ ...data, localId, isSynced: false } as InsertClient).run();
  return localId;
};

export const getAllClients = (): LocalClient[] => db.select().from(clients).all();

export const getClientByLocalId = (localId: string): LocalClient | null => {
  const rows = db.select().from(clients).where(eq(clients.localId, localId)).limit(1).all();
  return rows[0] ?? null;
};

export const getClientByServerId = (serverId: number): LocalClient | null => {
  const rows = db.select().from(clients).where(eq(clients.serverId, serverId)).limit(1).all();
  return rows[0] ?? null;
};
