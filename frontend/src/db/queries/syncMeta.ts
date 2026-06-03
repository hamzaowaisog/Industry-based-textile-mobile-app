import { eq } from 'drizzle-orm';

import { db } from '../index';
import { syncMeta } from '../schema';

export const getSyncMeta = (key: string): string | null => {
  const row = db.select().from(syncMeta).where(eq(syncMeta.key, key)).limit(1).all();
  return row[0]?.value ?? null;
};

export const setSyncMeta = (key: string, value: string): void => {
  db.insert(syncMeta)
    .values({ key, value })
    .onConflictDoUpdate({ target: syncMeta.key, set: { value } })
    .run();
};
