import {
  paymentCreate,
  paymentDelete,
  paymentGetAll,
  paymentGetById,
  paymentGetSummary,
  paymentGetUnallocated,
  paymentReverse,
  paymentUpdate,
} from '@api/generated/payment/payment';
import type {
  PaymentCreateViewModel,
  PaymentDto,
  PaymentDtoPagedList,
  PaymentSummaryDto,
  PaymentUpdateViewModel,
  UnallocatedCreditDto,
} from '@api/models';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import {
  mapApiPaymentDetail,
  mapApiPaymentSummary,
  mapApiPaymentToRow,
} from '@utils/helpers/paymentMappers';
import i18n from '@utils/i18n';

import type {
  EditPaymentFormValues,
  PaymentDetail,
  PaymentRow,
  PaymentSummary,
  RecordPaymentFormValues,
} from '../types/payments.types';

export const fetchPaymentsPageAsync = async (
  page: number,
  pageSize: number,
  includeReversed = false,
): Promise<{ items: PaymentRow[]; hasNextPage: boolean }> => {
  try {
    const res = await paymentGetAll({ page, pageSize, includeReversed });
    const r = parseApiResponse<PaymentDtoPagedList>(res, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false };
    return {
      items: (r.data.items ?? []).map(mapApiPaymentToRow),
      hasNextPage: !!r.data.hasNextPage,
    };
  } catch {
    return { items: [], hasNextPage: false };
  }
};

export const fetchPaymentsSummaryAsync = async (): Promise<PaymentSummary> => {
  try {
    const res = await paymentGetSummary();
    const r = parseApiResponse<PaymentSummaryDto>(res, '');
    if (!r.success || !r.data) return { totalReceived: 0, totalPaid: 0, totalCount: 0 };
    return mapApiPaymentSummary(r.data);
  } catch {
    return { totalReceived: 0, totalPaid: 0, totalCount: 0 };
  }
};

export const fetchPaymentDetailAsync = async (paymentId: number): Promise<PaymentDetail | null> => {
  try {
    const res = await paymentGetById(paymentId);
    const r = parseApiResponse<PaymentDto>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiPaymentDetail(r.data);
  } catch {
    return null;
  }
};

export const fetchUnallocatedCreditAsync = async (
  clientId: number,
): Promise<UnallocatedCreditDto | null> => {
  try {
    const res = await paymentGetUnallocated(clientId);
    const r = parseApiResponse<UnallocatedCreditDto>(res, '');
    if (!r.success || !r.data) return null;
    return r.data;
  } catch {
    return null;
  }
};

const buildCreatePayload = (values: RecordPaymentFormValues): PaymentCreateViewModel => {
  const allocations = values.allocations
    .filter((a) => parseFloat(a.allocatedAmount) > 0)
    .map((a) => ({
      orderId: a.orderId,
      purchaseId: a.purchaseId,
      allocatedAmount: parseFloat(a.allocatedAmount),
    }));

  return {
    partyClientId: values.partyClientId ?? undefined,
    paymentDirectionId: values.paymentDirectionId,
    transModeId: values.transModeId,
    amount: parseFloat(values.amount),
    paymentDate: values.paymentDate.trim() || null,
    notes: values.notes.trim() || null,
    allocations: allocations.length > 0 ? allocations : null,
  };
};

export const createPaymentAsync = async (
  values: RecordPaymentFormValues,
): Promise<{ success: boolean; error?: string; paymentId?: number }> => {
  try {
    const res = await paymentCreate(buildCreatePayload(values));
    const r = parseApiResponse<PaymentDto>(res, i18n.t('payments.record.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, paymentId: r.data?.id };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('payments.record.errorTitle')),
    };
  }
};

export const updatePaymentAsync = async (
  paymentId: number,
  values: EditPaymentFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: PaymentUpdateViewModel = {
      transModeId: values.transModeId,
      paymentDate: values.paymentDate.trim() || null,
      notes: values.notes.trim() || null,
    };
    const res = await paymentUpdate(paymentId, payload);
    const r = parseApiResponse<PaymentDto>(res, i18n.t('payments.edit.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('payments.edit.errorTitle')),
    };
  }
};

export const reversePaymentAsync = async (
  paymentId: number,
  notes?: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await paymentReverse(paymentId, { notes: notes ?? undefined });
    const r = parseApiResponse<PaymentDto>(res, i18n.t('payments.detail.reverseError'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('payments.detail.reverseError')),
    };
  }
};

export const deletePaymentAsync = async (
  paymentId: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await paymentDelete(paymentId);
    const r = parseApiResponse(res, i18n.t('payments.deleteTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('payments.deleteTitle')),
    };
  }
};
