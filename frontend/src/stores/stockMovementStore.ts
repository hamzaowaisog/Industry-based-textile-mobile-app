import { create } from 'zustand';

import { queryClient } from '@api/queryClient';

import { queryKeys } from '@constants/queryKeys';

import {
  createStockMovementAsync,
  deleteStockMovementAsync,
  fetchStockMovementDetailAsync,
  updateStockMovementAsync,
} from '../core/stockMovements';
import type {
  AddStockMoveFormValues,
  EditStockMoveFormValues,
  StockMovementStore,
} from '../types/stockMovements.types';

export const useStockMovementStore = create<StockMovementStore>((set) => ({
  currentMovement: null,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchMovementDetail: async (movementId) => {
    set({ detailLoading: true, currentMovement: null });
    try {
      const detail = await fetchStockMovementDetailAsync(movementId);
      set({ currentMovement: detail, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  createMovement: async (values: AddStockMoveFormValues) => {
    set({ submitting: true });
    const result = await createStockMovementAsync(values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    }
    return result;
  },

  updateMovement: async (movementId, values: EditStockMoveFormValues) => {
    set({ submitting: true });
    const result = await updateStockMovementAsync(movementId, values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    }
    return result;
  },

  deleteMovement: async (movementId) => {
    const result = await deleteStockMovementAsync(movementId);
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    }
    return result;
  },

  clearCurrentMovement: () => set({ currentMovement: null }),
  prepareDetailLoad: () => set({ detailLoading: true, currentMovement: null }),
}));
