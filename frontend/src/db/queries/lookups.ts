import { eq } from 'drizzle-orm';

import type { SyncLookupDto } from '@api/models';

import { db } from '../index';
import { lookups } from '../schema';

export const insertManyLookups = (type: string, records: SyncLookupDto[]): void => {
  if (!records.length) return;
  db.insert(lookups)
    .values(
      records.map((r) => ({
        type,
        serverId: r.id ?? 0,
        name: r.name ?? '',
      })),
    )
    .run();
};

export const getLookupsByType = (type: string) =>
  db.select().from(lookups).where(eq(lookups.type, type)).all();
