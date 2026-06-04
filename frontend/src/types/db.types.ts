import type {
  clients,
  expenses,
  invoiceLines,
  invoices,
  lookups,
  orderLines,
  orders,
  paymentAllocations,
  payments,
  products,
  purchaseLines,
  purchases,
  stockMovements,
  syncMeta,
  transactions,
} from '@db/schema';

export type SyncOperation = 'create' | 'update' | 'delete';

export type SyncEntity =
  | 'client'
  | 'product'
  | 'order'
  | 'orderLine'
  | 'purchase'
  | 'purchaseLine'
  | 'payment'
  | 'paymentAllocation'
  | 'expense'
  | 'stockMovement'
  | 'invoice'
  | 'invoiceLine';

export type PendingChange = {
  localId: string;
  entity: SyncEntity;
  operation: SyncOperation;
  data: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'failed';
  retryCount: number;
};

export type LocalClient = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type LocalProduct = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type LocalOrder = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type LocalOrderLine = typeof orderLines.$inferSelect;
export type InsertOrderLine = typeof orderLines.$inferInsert;

export type LocalPurchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;
export type LocalPurchaseLine = typeof purchaseLines.$inferSelect;
export type InsertPurchaseLine = typeof purchaseLines.$inferInsert;

export type LocalPayment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type LocalPaymentAllocation = typeof paymentAllocations.$inferSelect;
export type InsertPaymentAllocation = typeof paymentAllocations.$inferInsert;

export type LocalExpense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

export type LocalStockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

export type LocalInvoiceRecord = typeof invoices.$inferSelect;
export type InsertInvoiceRecord = typeof invoices.$inferInsert;
export type LocalInvoiceLine = typeof invoiceLines.$inferSelect;
export type InsertInvoiceLine = typeof invoiceLines.$inferInsert;

export type LocalTransaction = typeof transactions.$inferSelect;
export type LocalLookup = typeof lookups.$inferSelect;
export type LocalSyncMeta = typeof syncMeta.$inferSelect;

export type LocalOrderWithLines = LocalOrder & { lines: LocalOrderLine[] };
export type LocalPurchaseWithLines = LocalPurchase & { lines: LocalPurchaseLine[] };
export type LocalInvoiceWithLines = LocalInvoiceRecord & { lines: LocalInvoiceLine[] };
