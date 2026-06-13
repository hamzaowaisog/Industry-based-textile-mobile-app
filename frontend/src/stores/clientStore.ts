import { create } from 'zustand';

import type { ClientCreateViewModel, ClientUpdateViewModel } from '@api/models';
import { queryClient } from '@api/queryClient';

import {
  createClientAsync,
  deleteClientAsync,
  fetchClientDetailAsync,
  updateClientAsync,
} from '../core/clients';
import type { ClientStore } from '../types/clients.types';

export const useClientStore = create<ClientStore>((set) => ({
  currentClient: null,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchClientDetail: async (serverId) => {
    set({ detailLoading: true, currentClient: null });
    try {
      const detail = await fetchClientDetailAsync(serverId);
      set({ currentClient: detail, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  createClient: async (values) => {
    set({ submitting: true });
    const payload: ClientCreateViewModel = {
      name: values.name.trim(),
      clientTypeId: values.clientTypeId,
      phone: values.phone.trim() || null,
      address: values.address.trim() || null,
      creditLimit: values.creditLimit ? parseFloat(values.creditLimit) : null,
      openingBalance: values.openingBalance ? parseFloat(values.openingBalance) : null,
      notes: values.notes.trim() || null,
      isActive: true,
    };
    const result = await createClientAsync(payload);
    set({ submitting: false });
    return result;
  },

  updateClient: async (serverId, values) => {
    set({ submitting: true });
    const payload: ClientUpdateViewModel = {
      name: values.name.trim(),
      clientTypeId: values.clientTypeId,
      phone: values.phone.trim() || null,
      address: values.address.trim() || null,
      creditLimit: values.creditLimit ? parseFloat(values.creditLimit) : null,
      openingBalance: values.openingBalance ? parseFloat(values.openingBalance) : null,
      notes: values.notes.trim() || null,
      isActive: true,
    };
    const result = await updateClientAsync(serverId, payload);
    set({ submitting: false });
    return result;
  },

  deleteClient: async (serverId) => {
    const result = await deleteClientAsync(serverId);
    if (result.success) {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
    return result;
  },

  clearCurrentClient: () => set({ currentClient: null }),
  prepareDetailLoad: () => set({ detailLoading: true, currentClient: null }),
}));
