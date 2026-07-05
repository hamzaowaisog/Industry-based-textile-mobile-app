import { create } from 'zustand';

import { queryClient } from '@api/queryClient';

import { queryKeys } from '@constants/queryKeys';

import {
  changeInvoiceStatusAsync,
  createInvoiceAsync,
  deleteInvoiceAsync,
  fetchInvoiceDetailAsync,
  updateInvoiceAsync,
} from '../core/invoices';
import type {
  CreateInvoiceFormValues,
  EditInvoiceFormValues,
  InvoiceStore,
} from '../types/invoices.types';

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  currentInvoice: null,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchInvoiceDetail: async (invoiceId) => {
    set({ detailLoading: true, currentInvoice: null });
    try {
      const detail = await fetchInvoiceDetailAsync(invoiceId);
      set({ currentInvoice: detail, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  createInvoice: async (values) => {
    set({ submitting: true });
    const result = await createInvoiceAsync(values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    }
    return result;
  },

  updateInvoice: async (invoiceId, values) => {
    set({ submitting: true });
    const result = await updateInvoiceAsync(invoiceId, values);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    }
    return result;
  },

  changeInvoiceStatus: async (invoiceId, statusId) => {
    set({ submitting: true });
    const result = await changeInvoiceStatusAsync(invoiceId, statusId);
    set({ submitting: false });
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    }
    return result;
  },

  deleteInvoice: async (invoiceId) => {
    const result = await deleteInvoiceAsync(invoiceId);
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    }
    return result;
  },

  clearCurrentInvoice: () => set({ currentInvoice: null }),
  prepareDetailLoad: () => set({ detailLoading: true, currentInvoice: null }),
}));
