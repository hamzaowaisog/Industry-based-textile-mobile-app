import type { ClientDetailViewModel } from '@api/models';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type {
  ApiClientItem,
  ClientBalanceDirection,
  ClientDetail,
  ClientRow,
} from '../../types/clients.types';
import { getInitials } from './textHelpers';

export const resolveClientBalanceDirection = (
  clientTypeId: number,
  signedBalance: number,
): ClientBalanceDirection => {
  if (signedBalance === 0) return 'settled';
  const isSupplier = clientTypeId === AppConstants.CLIENT_TYPE.SUPPLIER;
  if (isSupplier) return signedBalance > 0 ? 'payable' : 'receivable';
  return signedBalance > 0 ? 'receivable' : 'payable';
};

export const resolveClientBalanceColor = (direction: ClientBalanceDirection): string => {
  if (direction === 'receivable') return colors.success;
  if (direction === 'payable') return colors.danger;
  return colors.textTertiary;
};

export const mapApiClientToRow = (c: ApiClientItem): ClientRow => {
  const balance = c.outstandingBalance ?? c.openingBalance ?? 0;
  const balanceDirection = resolveClientBalanceDirection(c.clientTypeId, balance);
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? null,
    clientTypeId: c.clientTypeId,
    initials: getInitials(c.name),
    balance: Math.abs(balance),
    balanceDirection,
  };
};

export const mapApiClientDetail = (d: ClientDetailViewModel): ClientDetail => ({
  clientId: d.clientId ?? 0,
  clientName: d.clientName ?? '',
  clientTypeName: d.clientTypeName ?? '',
  clientTypeId: d.clientTypeId ?? (d.clientTypeName?.toLowerCase() === 'supplier' ? 2 : 1),
  balance: Math.abs(d.balance ?? 0),
  outstanding: d.outstanding ?? 0,
  totalOrderCount: d.totalOrderCount ?? 0,
  totalOrderAmount: d.totalOrderAmount ?? 0,
  totalPurchaseCount: d.totalPurchaseCount ?? 0,
  totalPurchaseAmount: d.totalPurchaseAmount ?? 0,
  totalPaymentsIn: d.totalPaymentsIn ?? 0,
  totalPaymentsOut: d.totalPaymentsOut ?? 0,
  phone: d.phone ?? null,
  address: d.address ?? null,
  creditLimit: d.creditLimit ?? null,
  openingBalance: d.openingBalance ?? null,
  notes: d.notes ?? null,
  isActive: d.isActive ?? false,
  orders: d.orders ?? [],
  purchases: d.purchases ?? [],
  payments: d.payments ?? [],
  invoices: (d.invoices ?? []).map((i) => ({
    invoiceId: i.invoiceId ?? 0,
    invoiceNumber: i.invoiceNumber ?? '',
    issueDate: i.issueDate ?? null,
    dueDate: i.dueDate ?? null,
    invoiceStatusId: i.invoiceStatusId ?? 1,
    statusName: i.statusName ?? '',
    totalAmount: i.totalAmount ?? 0,
  })),
  recentTransactions: d.recentTransactions ?? [],
});
