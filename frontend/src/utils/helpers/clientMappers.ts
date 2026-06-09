import type { ClientDetailViewModel, ClientOrderSummary, ClientPaymentSummary, ClientPurchaseSummary, ClientTransactionSummary } from '@api/models';

import { colors } from '@theme/colors';

import type {
  ClientBalanceDirection,
  ClientDetail,
  ClientInvoiceSummary,
  ClientRow,
} from '../../types/clients.types';
import type { LocalOrderWithPaid } from '@db/queries/orders';
import type { LocalPurchaseWithPaid } from '@db/queries/purchases';
import type { LocalClient, LocalInvoiceRecord, LocalPayment, LocalTransaction } from '../../types/db.types';

const ORDER_STATUS_NAMES: Record<number, string> = { 1: 'Pending', 2: 'In Progress', 3: 'Delivered', 4: 'Cancelled' };
const PURCHASE_STATUS_NAMES: Record<number, string> = { 1: 'Pending', 2: 'In Progress', 3: 'Delivered', 4: 'Cancelled' };
const PAYMENT_DIR_NAMES: Record<number, string> = { 1: 'Received', 2: 'Paid', 3: 'Adjustment' };
const TRANS_TYPE_NAMES: Record<number, string> = { 1: 'Debit', 2: 'Credit' };
const TRANS_CATEGORY_NAMES: Record<number, string> = {
  1: 'Sales', 2: 'Purchases', 3: 'Office Expenses', 4: 'Home Expenses',
  5: 'Cash In', 6: 'Cash Out', 7: 'Bank In', 8: 'Bank Out',
};
const INVOICE_STATUS_NAMES: Record<number, string> = { 1: 'Draft', 2: 'Issued', 3: 'Paid', 4: 'Cancelled' };

export const mapLocalOrdersToSummary = (rows: LocalOrderWithPaid[]): ClientOrderSummary[] =>
  rows.map((o) => ({
    orderId: o.serverId ?? undefined,
    orderDate: o.orderDate,
    statusName: ORDER_STATUS_NAMES[o.statusId] ?? 'Unknown',
    total: o.totalAmount ?? 0,
    amountPaid: o.amountPaid,
    outstanding: Math.max(0, (o.totalAmount ?? 0) - o.amountPaid),
    paymentStatus: null,
  }));

export const mapLocalPurchasesToSummary = (rows: LocalPurchaseWithPaid[]): ClientPurchaseSummary[] =>
  rows.map((p) => ({
    purchaseId: p.serverId ?? undefined,
    purchaseDate: p.purchaseDate,
    statusName: PURCHASE_STATUS_NAMES[p.statusId] ?? 'Unknown',
    total: p.totalAmount ?? 0,
    amountPaid: p.amountPaid,
    outstanding: Math.max(0, (p.totalAmount ?? 0) - p.amountPaid),
    paymentStatus: null,
  }));

export const mapLocalPaymentsToSummary = (rows: LocalPayment[]): ClientPaymentSummary[] =>
  rows.map((p) => ({
    paymentId: p.serverId ?? undefined,
    paymentDate: p.paymentDate,
    directionName: PAYMENT_DIR_NAMES[p.paymentDirectionId] ?? 'Unknown',
    modeName: null,
    amount: p.amount,
    isReversed: p.isReversed ?? false,
  }));

export const mapLocalTransactionsToSummary = (rows: LocalTransaction[]): ClientTransactionSummary[] =>
  rows.map((t) => ({
    transactionId: t.serverId ?? undefined,
    transDate: t.transDate ?? undefined,
    categoryName: t.transCategoryId ? TRANS_CATEGORY_NAMES[t.transCategoryId] ?? null : null,
    typeName: t.transTypeId ? TRANS_TYPE_NAMES[t.transTypeId] ?? null : null,
    amount: t.amount ?? undefined,
  }));

export const mapLocalInvoicesToSummary = (rows: LocalInvoiceRecord[]): ClientInvoiceSummary[] =>
  rows.map((inv) => ({
    invoiceId: inv.serverId ?? null,
    invoiceNumber: inv.invoiceNumber ?? null,
    issueDate: inv.issueDate ?? null,
    dueDate: inv.dueDate ?? null,
    statusId: inv.statusId,
    statusName: INVOICE_STATUS_NAMES[inv.statusId] ?? 'Unknown',
    totalAmount: inv.totalAmount,
  }));

export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatPKR = (amount: number): string => {
  const abs = Math.abs(amount);
  return 'Rs ' + abs.toLocaleString('en-PK', { maximumFractionDigits: 0 });
};

/**
 * Signed balance from v_client_balance:
 * - Customer positive = they owe you (receivable / you'll get paid)
 * - Customer negative = you owe them (payable / you need to pay)
 * - Supplier positive = you owe them (payable)
 * - Supplier negative = they owe you (receivable)
 */
export const resolveClientBalanceDirection = (
  clientTypeId: number,
  signedBalance: number,
): ClientBalanceDirection => {
  if (signedBalance === 0) return 'settled';
  const isSupplier = clientTypeId === 2;
  if (isSupplier) return signedBalance > 0 ? 'payable' : 'receivable';
  return signedBalance > 0 ? 'receivable' : 'payable';
};

/** Green = you'll receive. Red = you need to pay. Grey = settled. */
export const resolveClientBalanceColor = (direction: ClientBalanceDirection): string => {
  if (direction === 'receivable') return colors.success;
  if (direction === 'payable') return colors.danger;
  return colors.textTertiary;
};

export const mapLocalClientToRow = (c: LocalClient): ClientRow => {
  const balance = c.outstandingBalance ?? c.openingBalance ?? 0;
  const balanceDirection = resolveClientBalanceDirection(c.clientTypeId, balance);
  return {
    localId: c.localId,
    serverId: c.serverId ?? null,
    name: c.name,
    phone: c.phone ?? null,
    clientTypeId: c.clientTypeId,
    initials: getInitials(c.name),
    balance: Math.abs(balance),
    balanceDirection,
  };
};

export const mapLocalClientToDetail = (c: LocalClient): ClientDetail => {
  const balance = c.outstandingBalance ?? c.openingBalance ?? 0;
  return {
    clientId: c.serverId ?? 0,
    clientName: c.name,
    clientTypeName: c.clientTypeId === 2 ? 'Supplier' : 'Customer',
    clientTypeId: c.clientTypeId,
    balance: Math.abs(balance),
    outstanding: balance,
    totalOrderCount: 0,
    totalOrderAmount: 0,
    totalPurchaseCount: 0,
    totalPurchaseAmount: 0,
    totalPaymentsIn: 0,
    totalPaymentsOut: 0,
    phone: c.phone ?? null,
    address: c.address ?? null,
    creditLimit: c.creditLimit ?? null,
    openingBalance: c.openingBalance ?? null,
    notes: c.notes ?? null,
    isSynced: c.isSynced ?? true,
    orders: [],
    purchases: [],
    payments: [],
    invoices: [],
    recentTransactions: [],
  };
};

export const mapApiClientDetail = (
  d: ClientDetailViewModel,
  local: LocalClient | null = null,
): ClientDetail => {
  const raw = d as any;
  const clientName = d.clientName ?? raw.name ?? local?.name ?? '';
  const clientTypeId: number =
    d.clientTypeName?.toLowerCase() === 'supplier' ? 2 : (raw.clientTypeId ?? 1);
  const clientTypeName = d.clientTypeName ?? (clientTypeId === 2 ? 'Supplier' : 'Customer');

  return {
    clientId: raw.id ?? d.clientId ?? 0,
    clientName,
    clientTypeName,
    clientTypeId,
    balance: Math.abs(raw.outstandingBalance ?? d.balance ?? 0),
    outstanding: raw.outstandingBalance ?? d.outstanding ?? 0,
    totalOrderCount: d.totalOrderCount ?? 0,
    totalOrderAmount: d.totalOrderAmount ?? 0,
    totalPurchaseCount: d.totalPurchaseCount ?? 0,
    totalPurchaseAmount: d.totalPurchaseAmount ?? 0,
    totalPaymentsIn: d.totalPaymentsIn ?? 0,
    totalPaymentsOut: d.totalPaymentsOut ?? 0,
    phone: raw.phone ?? local?.phone ?? null,
    address: raw.address ?? local?.address ?? null,
    creditLimit: raw.creditLimit ?? local?.creditLimit ?? null,
    openingBalance: raw.openingBalance ?? local?.openingBalance ?? null,
    notes: raw.notes ?? local?.notes ?? null,
    isSynced: local?.isSynced ?? true,
    orders: d.orders ?? [],
    purchases: d.purchases ?? [],
    payments: d.payments ?? [],
    invoices: [],
    recentTransactions: d.recentTransactions ?? [],
  };
};
