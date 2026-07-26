import type { PurchaseDto } from '@api/models';

import type { PurchaseDetail, PurchaseRow } from '@types/purchases.types';

export const mapApiPurchaseToRow = (p: PurchaseDto): PurchaseRow => ({
  id: p.id ?? 0,
  supplierName: p.supplierName ?? '',
  statusId: p.statusId ?? 1,
  statusName: p.statusName ?? '',
  purchaseDate: p.purchaseDate ?? '',
  purchaseDateHijriDisplay: p.purchaseDateHijriDisplay ?? null,
  total: p.total ?? 0,
  amountPaid: p.amountPaid ?? 0,
  paymentStatus: p.paymentStatus ?? null,
  billNo: p.billNo ?? null,
});

export const mapApiPurchaseDetail = (p: PurchaseDto): PurchaseDetail => ({
  id: p.id ?? 0,
  supplierId: p.supplierId ?? 0,
  supplierName: p.supplierName ?? '',
  statusId: p.statusId ?? 1,
  statusName: p.statusName ?? '',
  paymentTypeId: p.paymentTypeId ?? 1,
  paymentTypeName: p.paymentTypeName ?? '',
  purchaseDate: p.purchaseDate ?? '',
  purchaseDateHijriDisplay: p.purchaseDateHijriDisplay ?? null,
  notes: p.notes ?? null,
  billNo: p.billNo ?? null,
  createdAt: p.createdAt ?? null,
  total: p.total ?? 0,
  amountPaid: p.amountPaid ?? 0,
  payable: p.payable ?? 0,
  paymentStatus: p.paymentStatus ?? null,
  purchaseLines: p.purchaseLines ?? [],
});
