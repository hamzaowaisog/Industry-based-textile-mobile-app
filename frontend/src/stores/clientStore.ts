import { create } from 'zustand';

import type { ClientCreateViewModel, ClientUpdateViewModel } from '@api/models';

import {
  createClientApi,
  deleteClientApi,
  fetchClientDetailFromApi,
  fetchClientsFromDb,
  refreshClientsFromApi,
  updateClientApi,
} from '../core/clients';
import { getClientByServerId } from '@db/queries/clients';
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
      set({ clients: fetchClientsFromDb() });
      await refreshClientsFromApi();
      set({ clients: fetchClientsFromDb(), loading: false });
    } catch {
      set({ loading: false, error: 'Failed to load clients' });
    }
  },

  fetchClientDetail: async (serverId) => {
    set({ detailLoading: true });
    try {
      const detail = await fetchClientDetailFromApi(serverId);
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
    const result = await createClientApi(payload);
    set({ submitting: false });
    return result;
  },

  updateClient: async (serverId, localId, values) => {
    set({ submitting: true });
    const local = getClientByServerId(serverId);
    const resolvedLocalId = local?.localId ?? localId;
    const payload: ClientUpdateViewModel = {
      name: values.name.trim(),
      phone: values.phone.trim() || null,
      address: values.address.trim() || null,
      creditLimit: values.creditLimit ? parseFloat(values.creditLimit) : null,
      openingBalance: values.openingBalance ? parseFloat(values.openingBalance) : null,
      notes: values.notes.trim() || null,
      isActive: true,
    };
    const result = await updateClientApi(serverId, resolvedLocalId, payload);
    set({ submitting: false });
    return result;
  },

  deleteClient: async (serverId, localId) => {
    const result = await deleteClientApi(serverId, localId);
    if (result.success) {
      set({ clients: fetchClientsFromDb() });
    }
    return result;
  },

  clearCurrentClient: () => set({ currentClient: null }),

  refreshFromDb: () => {
    set({ clients: fetchClientsFromDb() });
  },
}));
