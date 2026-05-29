export type SyncOperation = 'create' | 'update' | 'delete';

export type SyncEntity =
  | 'client'
  | 'product'
  | 'order'
  | 'orderLine'
  | 'purchase'
  | 'purchaseLine'
  | 'payment'
  | 'expense'
  | 'stockMovement'
  | 'invoice'
  | 'invoiceLine';

export interface PendingChange {
  localId: string;
  entity: SyncEntity;
  operation: SyncOperation;
  data: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'failed';
  retryCount: number;
}

export interface LocalInvoice {
  localId: string;
  invoiceNumber: string;
  invoiceStatusId: number;
  clientId: number;
  orderId?: string;
  totalAmount: number;
  createdAt: string;
  isSynced: boolean;
}
