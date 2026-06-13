import { create } from 'zustand';

import type { ClientCreateViewModel, ClientUpdateViewModel } from '@api/models';

import {
  createClientAsync,
  deleteClientAsync,
  fetchClientDetailAsync,
  fetchClientsAsync,
  updateClientAsync,
} from '../core/clients';
import type { ClientStore } from '../types/clients.types';

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  currentClient: null,
  loading: true,
  detailLoading: false,
  submitting: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const clients = await fetchClientsAsync();
      set({ clients, loading: false });
    } catch {
      set({ loading: false, error: 'Failed to load clients' });
    }
  },

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
      fetchClientsAsync().then((clients) => set({ clients }));
    }
    return result;
  },

  clearCurrentClient: () => set({ currentClient: null }),

  refreshClients: () => {
    fetchClientsAsync().then((clients) => set({ clients }));
  },
}));
