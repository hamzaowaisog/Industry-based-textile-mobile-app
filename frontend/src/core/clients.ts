import {
  clientCreateClient,
  clientDeleteClientById,
  clientGetAllClients,
  clientGetAllClientsByUserId,
  clientUpdateClientById,
} from '@api/generated/client/client';
import { reportGetClientDetailById } from '@api/generated/report/report';
import type { ClientCreateViewModel, ClientUpdateViewModel } from '@api/models';
import { AppConstants } from '@constants/appConstants';
import { useAuthStore } from '@stores/authStore';
import { parseApiError, parseApiResponse } from '@utils/helpers/apiResponse';
import { mapApiClientDetail } from '@utils/helpers/clientMappers';
import i18n from '@utils/i18n';

import type { ApiClientItem, ClientDetail } from '../types/clients.types';

export const fetchClientsAsync = async (): Promise<ApiClientItem[]> => {
  try {
    const { roleId } = useAuthStore.getState();
    const isAdmin = roleId === AppConstants.ROLES.ADMIN;
    const res = isAdmin ? await clientGetAllClients() : await clientGetAllClientsByUserId();
    const r = parseApiResponse<any[]>(res, '');
    if (!r.success || !r.data) return [];
    return r.data.map((item: any) => ({
      id: item.id ?? 0,
      name: item.name ?? '',
      phone: item.phone ?? null,
      clientTypeId: item.clientTypeId ?? 1,
      outstandingBalance: item.outstandingBalance ?? null,
      openingBalance: item.openingBalance ?? null,
    }));
  } catch {
    return [];
  }
};

export const fetchClientDetailAsync = async (clientId: number): Promise<ClientDetail | null> => {
  try {
    const res = await reportGetClientDetailById(clientId);
    const r = parseApiResponse<any>(res, '');
    if (!r.success || !r.data) return null;
    return mapApiClientDetail(r.data);
  } catch {
    return null;
  }
};

export const createClientAsync = async (
  values: ClientCreateViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await clientCreateClient(values);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};

export const updateClientAsync = async (
  id: number,
  values: ClientUpdateViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await clientUpdateClientById(id, values);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};

export const deleteClientAsync = async (
  id: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await clientDeleteClientById(id);
    const r = parseApiResponse(res, i18n.t('common.errorGeneric'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('common.errorGeneric')) };
  }
};
