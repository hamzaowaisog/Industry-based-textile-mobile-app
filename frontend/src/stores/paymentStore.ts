import { create } from 'zustand';

import { queryClient } from '@api/queryClient';

import { queryKeys } from '@constants/queryKeys';

import {
  createPaymentAsync,
  deletePaymentAsync,
  fetchPaymentDetailAsync,
  reversePaymentAsync,
  updatePaymentAsync,
} from '../core/payments';
import type {
  EditPaymentFormValues,
  PaymentStore,
  RecordPaymentFormValues,
} from '../types/payments.types';

export const usePaymentStore = create<PaymentStore>((set) => ({
  currentPayment: null,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchPaymentDetail: async (paymentId) => {
    set({ detailLoading: true, currentPayment: null });
    try {
      const detail = await fetchPaymentDetailAsync(paymentId);
      set({ currentPayment: detail, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  createPayment: async (values: RecordPaymentFormValues) => {
    console.log('createPayment', values);
    set({ submitting: true });
    const result = await createPaymentAsync(values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    }
    return result;
  },

  updatePayment: async (paymentId, values: EditPaymentFormValues) => {
    set({ submitting: true });
    const result = await updatePaymentAsync(paymentId, values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    }
    return result;
  },

  reversePayment: async (paymentId, notes) => {
    set({ submitting: true });
    const result = await reversePaymentAsync(paymentId, notes);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    }
    return result;
  },

  deletePayment: async (paymentId) => {
    const result = await deletePaymentAsync(paymentId);
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    }
    return result;
  },

  clearCurrentPayment: () => set({ currentPayment: null }),
  prepareDetailLoad: () => set({ detailLoading: true, currentPayment: null }),
}));
