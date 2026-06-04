import { eq } from 'drizzle-orm';

import type { SyncInvoiceDto } from '@api/models';
import type {
  InsertInvoiceLine,
  InsertInvoiceRecord,
  LocalInvoiceLine,
  LocalInvoiceRecord,
  LocalInvoiceWithLines,
} from '../../types/db.types';
import { generateUUID } from '@utils/helpers/uuid';
import { toISODate } from '@utils/helpers/dateConvert';

import { db } from '../index';
import { invoiceLines, invoices } from '../schema';

export const insertManyInvoices = (records: SyncInvoiceDto[]): void => {
  if (!records.length) return;
  for (const r of records) {
    const values: InsertInvoiceRecord = {
      localId: r.localId ?? generateUUID(),
      serverId: r.serverId ?? r.id ?? null,
      invoiceNumber: r.invoiceNumber ?? null,
      orderServerId: r.orderId ?? null,
      purchaseServerId: r.purchaseId ?? null,
      clientServerId: r.clientId ?? null,
      createdByUserServerId: (r as any).createdByUserId ?? null,
      statusId: r.invoiceStatusId ?? 1,
      issueDate: toISODate(r.issueDate) ?? null,
      dueDate: toISODate(r.dueDate) ?? null,
      totalAmount: r.totalAmount ?? 0,
      notes: r.notes ?? null,
      isSynced: true,
      createdAt: toISODate(r.createdAt) ?? null,
      version: r.version ?? 0,
      updatedAt: r.updatedAt ?? null,
    };
    const result = db.insert(invoices).values(values).run();
    const insertedId = result.lastInsertRowId as number;

    if (r.invoiceLines?.length) {
      const lines: InsertInvoiceLine[] = r.invoiceLines.map((l) => ({
        invoiceId: insertedId,
        productName: l.productName ?? '',
        qty: l.qty ?? 0,
        unitPrice: l.unitPrice ?? 0,
        lineTotal: (l.qty ?? 0) * (l.unitPrice ?? 0),
      }));
      db.insert(invoiceLines).values(lines).run();
    }
  }
};

export const getAllInvoices = (): LocalInvoiceRecord[] => db.select().from(invoices).all();

export const getInvoiceWithLines = (localId: string): LocalInvoiceWithLines | null => {
  const invoice = db
    .select()
    .from(invoices)
    .where(eq(invoices.localId, localId))
    .limit(1)
    .all()[0];
  if (!invoice) return null;
  const lines = db
    .select()
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, invoice.id))
    .all();
  return { ...invoice, lines };
};

export const getInvoiceLinesByInvoiceId = (invoiceId: number): LocalInvoiceLine[] =>
  db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, invoiceId)).all();
