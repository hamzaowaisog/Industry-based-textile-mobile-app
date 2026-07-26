import type { OrderDto } from '@api/models';

import type { OrderDetail, OrderRow } from '../../types/orders.types';

export const mapApiOrderToRow = (o: OrderDto): OrderRow => ({
  id: o.id ?? 0,
  clientName: o.clientName ?? '',
  statusId: o.statusId ?? 1,
  statusName: o.statusName ?? '',
  orderDate: o.orderDate ?? '',
  orderDateHijriDisplay: o.orderDateHijriDisplay ?? null,
  total: o.total ?? 0,
  amountPaid: o.amountReceived ?? 0,
  paymentStatus: o.paymentStatus ?? null,
  billNo: o.billNo ?? null,
});

export const mapApiOrderDetail = (o: OrderDto): OrderDetail => ({
  id: o.id ?? 0,
  clientId: o.clientId ?? 0,
  clientName: o.clientName ?? '',
  statusId: o.statusId ?? 1,
  statusName: o.statusName ?? '',
  paymentTypeId: o.paymentTypeId ?? 1,
  paymentTypeName: o.paymentTypeName ?? '',
  orderDate: o.orderDate ?? '',
  orderDateHijriDisplay: o.orderDateHijriDisplay ?? null,
  notes: o.notes ?? null,
  billNo: o.billNo ?? null,
  createdAt: o.createdAt ?? null,
  total: o.total ?? 0,
  amountPaid: o.amountReceived ?? 0,
  outstanding: o.receivable ?? 0,
  paymentStatus: o.paymentStatus ?? null,
  orderLines: o.orderLines ?? [],
});
