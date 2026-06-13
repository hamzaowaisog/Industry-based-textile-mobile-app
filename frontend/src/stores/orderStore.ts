import { create } from 'zustand';

import {
  createOrderAsync,
  deleteOrderAsync,
  fetchOrderDetailAsync,
  fetchOrdersAsync,
  updateOrderAsync,
} from '../core/orders';
import type { CreateOrderFormValues, OrderStore } from '../types/orders.types';

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  currentOrder: null,
  loading: true,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await fetchOrdersAsync();
      set({ orders, loading: false });
    } catch {
      set({ loading: false, error: 'Failed to load orders' });
    }
  },

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
      fetchOrdersAsync().then((orders) => set({ orders }));
    }
    return result;
  },

  updateOrder: async (id, statusId, notes) => {
    set({ submitting: true });
    const result = await updateOrderAsync(id, statusId, notes);
    set({ submitting: false });
    if (result.success) {
      fetchOrdersAsync().then((orders) => set({ orders }));
    }
    return result;
  },

  deleteOrder: async (id) => {
    const result = await deleteOrderAsync(id);
    if (result.success) {
      fetchOrdersAsync().then((orders) => set({ orders }));
    }
    return result;
  },

  clearCurrentOrder: () => set({ currentOrder: null }),

  refreshOrders: () => {
    fetchOrdersAsync().then((orders) => set({ orders }));
  },
}));
