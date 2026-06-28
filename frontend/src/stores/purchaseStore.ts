import { create } from 'zustand';

import { queryClient } from '@api/queryClient';

import { queryKeys } from '@constants/queryKeys';

import {
  createPurchaseAsync,
  deletePurchaseAsync,
  fetchPurchaseDetailAsync,
  updatePurchaseAsync,
} from '../core/purchases';
import type { CreatePurchaseFormValues, PurchaseStore } from '../types/purchases.types';

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  currentPurchase: null,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchPurchaseDetail: async (purchaseId) => {
    set({ detailLoading: true, currentPurchase: null });
    try {
      const detail = await fetchPurchaseDetailAsync(purchaseId);
      set({ currentPurchase: detail, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  createPurchase: async (values: CreatePurchaseFormValues) => {
    set({ submitting: true });
    const result = await createPurchaseAsync(values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
    }
    return result;
  },

  updatePurchase: async (id, statusId, paymentTypeId, notes) => {
    set({ submitting: true });
    const result = await updatePurchaseAsync(id, statusId, paymentTypeId, notes);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
    }
    return result;
  },

  deletePurchase: async (id) => {
    const result = await deletePurchaseAsync(id);
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
    }
    return result;
  },

  clearCurrentPurchase: () => set({ currentPurchase: null }),
  prepareDetailLoad: () => set({ detailLoading: true, currentPurchase: null }),
}));
