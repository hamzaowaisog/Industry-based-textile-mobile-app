import {
  stockMovementsCreateStockMovement,
  stockMovementsDeleteStockMovement,
  stockMovementsGetAllStockMovementsPaginated,
  stockMovementsGetStockMovementById,
  stockMovementsUpdateStockMovement,
} from '@api/generated/stock-movements/stock-movements';
import type {
  StockMovementsCreateViewModel,
  StockMovementsDto,
  StockMovementsDtoPagedList,
  StockMovementsUpdateViewModel,
} from '@api/models';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import {
  mapApiStockMovementDetail,
  mapApiStockMovementToRow,
} from '@utils/helpers/stockMovementsMappers';
import i18n from '@utils/i18n';

import type {
  AddStockMoveFormValues,
  EditStockMoveFormValues,
  StockMoveDetail,
  StockMoveRow,
} from '../types/stockMovements.types';

export const fetchStockMovementsPageAsync = async (
  page: number,
  pageSize: number,
): Promise<{ items: StockMoveRow[]; hasNextPage: boolean }> => {
  try {
    const res = await stockMovementsGetAllStockMovementsPaginated({ page, pageSize });
    const r = parseApiResponse<StockMovementsDtoPagedList>(res, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false };
    return {
      items: (r.data.items ?? []).map(mapApiStockMovementToRow),
      hasNextPage: !!r.data.hasNextPage,
    };
  } catch {
    return { items: [], hasNextPage: false };
  }
};

export const fetchStockMovementDetailAsync = async (
  movementId: number,
): Promise<StockMoveDetail | null> => {
  try {
    const res = await stockMovementsGetStockMovementById(movementId);
    const r = parseApiResponse<StockMovementsDto>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiStockMovementDetail(r.data);
  } catch {
    return null;
  }
};

export const createStockMovementAsync = async (
  values: AddStockMoveFormValues,
): Promise<{ success: boolean; error?: string; movementId?: number }> => {
  try {
    const payload: StockMovementsCreateViewModel = {
      productId: values.productId ?? undefined,
      movementSource: values.movementSource,
      movementType: values.movementType,
      qty: parseFloat(values.qty),
      unitCost: values.unitCost.trim() ? parseFloat(values.unitCost) : null,
      unitPrice: values.unitPrice.trim() ? parseFloat(values.unitPrice) : null,
      movementDate: values.movementDate.trim() || null,
    };
    const res = await stockMovementsCreateStockMovement(payload);
    const r = parseApiResponse<StockMovementsDto>(res, i18n.t('stockMovements.add.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, movementId: r.data?.id };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('stockMovements.add.errorTitle')),
    };
  }
};

export const updateStockMovementAsync = async (
  movementId: number,
  values: EditStockMoveFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: StockMovementsUpdateViewModel = {
      productId: values.productId ?? undefined,
      movementSource: values.movementSource,
      movementType: values.movementType,
      qty: parseFloat(values.qty),
      unitCost: values.unitCost.trim() ? parseFloat(values.unitCost) : null,
      unitPrice: values.unitPrice.trim() ? parseFloat(values.unitPrice) : null,
      movementDate: values.movementDate.trim() || null,
    };
    const res = await stockMovementsUpdateStockMovement(movementId, payload);
    const r = parseApiResponse<StockMovementsDto>(res, i18n.t('stockMovements.edit.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('stockMovements.edit.errorTitle')),
    };
  }
};

export const deleteStockMovementAsync = async (
  movementId: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await stockMovementsDeleteStockMovement(movementId);
    const r = parseApiResponse(res, i18n.t('stockMovements.deleteTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: parseApiError(err, i18n.t('stockMovements.deleteTitle')),
    };
  }
};
