import { create } from 'zustand';

import { queryClient } from '@api/queryClient';

import {
  createOrderAsync,
  deleteOrderAsync,
  fetchOrderDetailAsync,
  updateOrderAsync,
} from '../core/orders';
import type { CreateOrderFormValues, OrderStore } from '../types/orders.types';

export const useOrderStore = create<OrderStore>((set) => ({
  currentOrder: null,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchOrderDetail: async (orderId) => {
    set({ detailLoading: true, currentOrder: null });
    try {
      const detail = await fetchOrderDetailAsync(orderId);
      set({ currentOrder: detail, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  createOrder: async (values: CreateOrderFormValues) => {
    set({ submitting: true });
    const result = await createOrderAsync(values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
    return result;
  },

  updateOrder: async (id, statusId, notes) => {
    set({ submitting: true });
    const result = await updateOrderAsync(id, statusId, notes);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
    return result;
  },

  deleteOrder: async (id) => {
    const result = await deleteOrderAsync(id);
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
    return result;
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
  prepareDetailLoad: () => set({ detailLoading: true, currentOrder: null }),
}));
