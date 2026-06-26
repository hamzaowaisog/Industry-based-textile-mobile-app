import {
  orderCreateOrder,
  orderDeleteOrder,
  orderGetAllOrdersPaginated,
  orderGetMyOrders,
  orderGetOrderById,
  orderUpdateOrder,
  orderUpdateOrderLines,
} from '@api/generated/order/order';
import type {
  OrderCreateViewModel,
  OrderDtoPagedList,
  OrderLinesUpdateViewModel,
  OrderUpdateViewModel,
} from '@api/models';

import { useAuthStore } from '@stores/authStore';

import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import { mapApiOrderDetail, mapApiOrderToRow } from '@utils/helpers/orderMappers';
import i18n from '@utils/i18n';

import { AppConstants } from '@constants/appConstants';

import type {
  CreateOrderFormValues,
  EditOrderFormValues,
  OrderDetail,
  OrderRow,
} from '../types/orders.types';

export const fetchOrdersAsync = async (): Promise<OrderRow[]> => {
  try {
    const { roleId } = useAuthStore.getState();
    const isAdmin = roleId === AppConstants.ROLES.ADMIN;
    const res = isAdmin
      ? await orderGetAllOrdersPaginated({ page: 1, pageSize: 100 })
      : await orderGetMyOrders();
    const r = parseApiResponse<any>(res, '');
    if (!r.success || !r.data) return [];
    const items = r.data?.items ?? r.data ?? [];
    return (items as any[]).map(mapApiOrderToRow);
  } catch {
    return [];
  }
};

export const fetchOrdersPageAsync = async (
  page: number,
  pageSize: number,
): Promise<{ items: OrderRow[]; hasNextPage: boolean }> => {
  try {
     const res = await orderGetAllOrdersPaginated({ page, pageSize });
    const r = parseApiResponse<OrderDtoPagedList>(res, '');
    if (!r.success || !r.data) return { items: [], hasNextPage: false };
    return {
      items: (r.data.items ?? []).map(mapApiOrderToRow),
      hasNextPage: !!r.data.hasNextPage,
    };
  } catch {
    return { items: [], hasNextPage: false };
  }
};

export const fetchOrderDetailAsync = async (orderId: number): Promise<OrderDetail | null> => {
  try {
    const res = await orderGetOrderById(orderId);
    const r = parseApiResponse<any>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiOrderDetail(r.data);
  } catch {
    return null;
  }
};

export const createOrderAsync = async (
  values: CreateOrderFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: OrderCreateViewModel = {
      clientId: values.clientId ?? undefined,
      paymentTypeId: values.paymentTypeId,
      orderDate: values.orderDate || null,
      notes: values.notes.trim() || null,
      lines: values.lines.map((l) => ({
        productId: l.productId,
        qty: parseFloat(l.qty),
        unitPrice: parseFloat(l.unitPrice),
      })),
    };
    const res = await orderCreateOrder(payload);
    const r = parseApiResponse(res, i18n.t('orders.create.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('orders.create.errorTitle')) };
  }
};

export const updateOrderAsync = async (
  id: number,
  statusId: number,
  notes?: string | null,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: OrderUpdateViewModel = { statusId, notes: notes ?? null };
    const res = await orderUpdateOrder(id, payload);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};

export const updateOrderHeaderAsync = async (
  id: number,
  statusId: number,
  paymentTypeId: number,
  notes: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: OrderUpdateViewModel = { statusId, paymentTypeId, notes: notes.trim() || null };
    const res = await orderUpdateOrder(id, payload);
    const r = parseApiResponse(res, i18n.t('orders.edit.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('orders.edit.errorTitle')) };
  }
};

export const updateOrderLinesAsync = async (
  id: number,
  values: EditOrderFormValues,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: OrderLinesUpdateViewModel = {
      lines: values.lines.map((l) => ({
        productId: l.productId,
        qty: parseFloat(l.qty),
        unitPrice: parseFloat(l.unitPrice),
      })),
    };
    const res = await orderUpdateOrderLines(id, payload);
    const r = parseApiResponse(res, i18n.t('orders.edit.errorTitle'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('orders.edit.errorTitle')) };
  }
};

export const deleteOrderAsync = async (
  id: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await orderDeleteOrder(id);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};
