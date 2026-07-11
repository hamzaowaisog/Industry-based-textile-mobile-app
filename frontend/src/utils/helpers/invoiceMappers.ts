import type { InvoiceDetailDto, InvoiceDto, InvoiceSummaryDto } from '@api/models';

import { isInvoiceOverdue } from '@utils/helpers/invoiceContent';

import type { InvoiceDetail, InvoiceRow, InvoiceSummary } from '../../types/invoices.types';

export const mapApiInvoiceToRow = (i: InvoiceDto): InvoiceRow => ({
  id: i.id ?? 0,
  invoiceNumber: i.invoiceNumber ?? '',
  clientId: i.clientId ?? 0,
  clientName: i.clientName ?? '',
  clientTypeName: i.clientTypeName ?? '',
  direction: i.direction ?? '',
  type: i.type ?? '',
  invoiceStatusId: i.invoiceStatusId ?? 0,
  statusName: i.statusName ?? '',
  issueDate: i.issueDate ?? null,
  dueDate: i.dueDate ?? null,
  totalAmount: i.totalAmount ?? 0,
  amountPaid: i.amountPaid ?? 0,
  outstanding: i.outstanding ?? 0,
  isOverdue: isInvoiceOverdue(i.invoiceStatusId ?? 0, i.dueDate ?? null, i.outstanding ?? 0),
  createdAt: i.createdAt ?? null,
});

export const mapApiInvoiceSummary = (s: InvoiceSummaryDto): InvoiceSummary => ({
  totalReceivable: s.totalReceivable ?? 0,
  totalPayable: s.totalPayable ?? 0,
  totalCount: s.totalCount ?? 0,
});

export const mapApiInvoiceDetail = (i: InvoiceDetailDto): InvoiceDetail => ({
  id: i.id ?? 0,
  invoiceNumber: i.invoiceNumber ?? '',
  orderId: i.orderId ?? null,
  purchaseId: i.purchaseId ?? null,
  clientId: i.clientId ?? 0,
  clientName: i.clientName ?? '',
  clientTypeName: i.clientTypeName ?? '',
  direction: i.direction ?? '',
  type: i.type ?? '',
  invoiceStatusId: i.invoiceStatusId ?? 0,
  statusName: i.statusName ?? '',
  issueDate: i.issueDate ?? null,
  dueDate: i.dueDate ?? null,
  totalAmount: i.totalAmount ?? 0,
  amountPaid: i.amountPaid ?? 0,
  outstanding: i.outstanding ?? 0,
  notes: i.notes ?? null,
  createdAt: i.createdAt ?? null,
  lines: i.lines ?? [],
  linkedTransactions: i.linkedTransactions ?? [],
});
