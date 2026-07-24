import {
  purchaseCreatePurchase,
  purchaseDeletePurchase,
  purchaseGetAllPurchasesPaginated,
  purchaseGetPurchaseById,
  purchaseUpdatePurchase,
  purchaseUpdatePurchaseLines,
} from '@api/generated/purchase/purchase';
import type {
  PurchaseCreateViewModel,
  PurchaseDtoPagedList,
  PurchaseLinesUpdateViewModel,
  PurchaseUpdateViewModel,
} from '@api/models';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import { mapApiPurchaseDetail, mapApiPurchaseToRow } from '@utils/helpers/purchaseMappers';
import i18n from '@utils/i18n';

import type {
  CreatePurchaseFormValues,
  EditPurchaseFormValues,
  PurchaseDetail,
  PurchaseRow,
} from '../types/purchases.types';

export const fetchPurchasesPageAsync = async (
  page: number,
  pageSize: number,
): Promise<{ items: PurchaseRow[]; hasNextPage: boolean; totalCount: number }> => {
  try {
    const res = await purchaseGetAllPurchasesPaginated({ page, pageSize });
    const r = parseApiResponse<PurchaseDtoPagedList>(res, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false, totalCount: 0 };
    return {
      items: (r.data.items ?? []).map(mapApiPurchaseToRow),
      hasNextPage: !!r.data.hasNextPage,
      totalCount: r.data.totalCount ?? 0,
    };
  } catch {
    return { items: [], hasNextPage: false, totalCount: 0 };
  }
};

export const fetchPurchaseDetailAsync = async (
  purchaseId: number,
): Promise<PurchaseDetail | null> => {
  try {
    const res = await purchaseGetPurchaseById(purchaseId);
    const r = parseApiResponse<any>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiPurchaseDetail(r.data);
  } catch {
    return null;
  }
};

export const createPurchaseAsync = async (
  values: CreatePurchaseFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: PurchaseCreateViewModel = {
      supplierId: values.supplierId ?? undefined,
      paymentTypeId: values.paymentTypeId,
      notes: values.notes.trim() || null,
      billNo: values.billNo.trim() || null,
      lines: values.lines.map((l) => ({
        productId: l.productId,
        qty: parseFloat(l.qty),
        unitCost: parseFloat(l.unitCost),
      })),
    };
    const res = await purchaseCreatePurchase(payload);
    const r = parseApiResponse(res, i18n.t('purchases.create.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('purchases.create.errorTitle')) };
  }
};

export const updatePurchaseAsync = async (
  id: number,
  statusId: number,
  paymentTypeId: number,
  notes?: string | null,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: PurchaseUpdateViewModel = { statusId, paymentTypeId, notes: notes ?? null };
    const res = await purchaseUpdatePurchase(id, payload);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};

export const updatePurchaseHeaderAsync = async (
  id: number,
  statusId: number,
  paymentTypeId: number,
  notes: string,
  billNo: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: PurchaseUpdateViewModel = {
      statusId,
      paymentTypeId,
      notes: notes.trim() || null,
      billNo: billNo.trim() || null,
    };
    const res = await purchaseUpdatePurchase(id, payload);
    const r = parseApiResponse(res, i18n.t('purchases.edit.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('purchases.edit.errorTitle')) };
  }
};

export const updatePurchaseLinesAsync = async (
  id: number,
  values: EditPurchaseFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: PurchaseLinesUpdateViewModel = {
      lines: values.lines.map((l) => ({
        productId: l.productId,
        qty: parseFloat(l.qty),
        unitCost: parseFloat(l.unitCost),
      })),
    };
    const res = await purchaseUpdatePurchaseLines(id, payload);
    const r = parseApiResponse(res, i18n.t('purchases.edit.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('purchases.edit.errorTitle')) };
  }
};

export const deletePurchaseAsync = async (
  id: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await purchaseDeletePurchase(id);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};
