import type { ClientDetailViewModel } from '@api/models';

import type { ClientDetail, ClientRow } from '../../types/clients.types';
import type { LocalClient } from '../../types/db.types';

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

export const mapLocalClientToRow = (c: LocalClient): ClientRow => {
  const balance = c.outstandingBalance ?? c.openingBalance ?? 0;
  const owesYou = balance > 0 ? true : balance < 0 ? false : null;
  return {
    localId: c.localId,
    serverId: c.serverId ?? null,
    name: c.name,
    phone: c.phone ?? null,
    clientTypeId: c.clientTypeId,
    initials: getInitials(c.name),
    balance: Math.abs(balance),
    owesYou,
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
    outstanding: Math.abs(balance),
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
    orders: [],
    purchases: [],
    payments: [],
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
    orders: d.orders ?? [],
    purchases: d.purchases ?? [],
    payments: d.payments ?? [],
    recentTransactions: d.recentTransactions ?? [],
  };
};
