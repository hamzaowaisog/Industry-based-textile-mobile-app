import {
  invoiceCreate,
  invoiceDelete,
  invoiceGetAll,
  invoiceGetById,
  invoiceGetSummary,
  invoiceUpdate,
} from '@api/generated/invoice/invoice';
import type {
  InvoiceCreateViewModel,
  InvoiceDetailDto,
  InvoiceDto,
  InvoiceDtoPagedList,
  InvoiceSummaryDto,
  InvoiceUpdateViewModel,
} from '@api/models';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import { sumInvoiceLines } from '@utils/helpers/invoiceContent';
import {
  mapApiInvoiceDetail,
  mapApiInvoiceSummary,
  mapApiInvoiceToRow,
} from '@utils/helpers/invoiceMappers';
import i18n from '@utils/i18n';

import type {
  CreateInvoiceFormValues,
  EditInvoiceFormValues,
  InvoiceDetail,
  InvoiceRow,
  InvoiceSummary,
} from '../types/invoices.types';

export const fetchInvoicesPageAsync = async (
  page: number,
  pageSize: number,
): Promise<{ items: InvoiceRow[]; hasNextPage: boolean }> => {
  try {
    const res = await invoiceGetAll({ page, pageSize });
    const r = parseApiResponse<InvoiceDtoPagedList>(res, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false };
    return {
      items: (r.data.items ?? []).map(mapApiInvoiceToRow),
      hasNextPage: !!r.data.hasNextPage,
    };
  } catch {
    return { items: [], hasNextPage: false };
  }
};

export const fetchInvoicesSummaryAsync = async (): Promise<InvoiceSummary> => {
  try {
    const res = await invoiceGetSummary();
    const r = parseApiResponse<InvoiceSummaryDto>(res, '');
    if (!r.success || !r.data) return { totalReceivable: 0, totalPayable: 0, totalCount: 0 };
    return mapApiInvoiceSummary(r.data);
  } catch {
    return { totalReceivable: 0, totalPayable: 0, totalCount: 0 };
  }
};

export const fetchInvoiceDetailAsync = async (invoiceId: number): Promise<InvoiceDetail | null> => {
  try {
    const res = await invoiceGetById(invoiceId);
    const r = parseApiResponse<InvoiceDetailDto>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiInvoiceDetail(r.data);
  } catch {
    return null;
  }
};

const buildLinePayload = (l: { productName: string; qty: string; unitPrice: string }) => ({
  productName: l.productName.trim(),
  qty: parseFloat(l.qty) || 0,
  unitPrice: parseFloat(l.unitPrice) || 0,
});

const buildCreatePayload = (values: CreateInvoiceFormValues): InvoiceCreateViewModel => ({
  clientId: values.clientId ?? 0,
  totalAmount: sumInvoiceLines(values.lines),
  dueDate: values.dueDate.trim() || null,
  notes: values.notes.trim() || null,
  lines: values.lines.map(buildLinePayload),
});

const buildUpdatePayload = (values: EditInvoiceFormValues): InvoiceUpdateViewModel => ({
  invoiceStatusId: values.invoiceStatusId,
  totalAmount: sumInvoiceLines(values.lines),
  dueDate: values.dueDate.trim() || null,
  notes: values.notes.trim() || null,
  lines: values.lines.map(buildLinePayload),
});

export const createInvoiceAsync = async (
  values: CreateInvoiceFormValues,
): Promise<{ success: boolean; error?: string; invoiceId?: number }> => {
  try {
    const res = await invoiceCreate(buildCreatePayload(values));
    const r = parseApiResponse<InvoiceDto>(res, i18n.t('invoices.create.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, invoiceId: r.data?.id };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('invoices.create.errorTitle')),
    };
  }
};

export const updateInvoiceAsync = async (
  invoiceId: number,
  values: EditInvoiceFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await invoiceUpdate(invoiceId, buildUpdatePayload(values));
    const r = parseApiResponse<InvoiceDto>(res, i18n.t('invoices.edit.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('invoices.edit.errorTitle')),
    };
  }
};

export const changeInvoiceStatusAsync = async (
  invoiceId: number,
  statusId: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await invoiceUpdate(invoiceId, { invoiceStatusId: statusId });
    const r = parseApiResponse<InvoiceDto>(res, i18n.t('invoices.detail.statusError'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('invoices.detail.statusError')),
    };
  }
};

export const deleteInvoiceAsync = async (
  invoiceId: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await invoiceDelete(invoiceId);
    const r = parseApiResponse(res, i18n.t('invoices.deleteError'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('invoices.deleteError')),
    };
  }
};
