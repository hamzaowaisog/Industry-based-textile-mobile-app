import NetInfo from '@react-native-community/netinfo';
import { eq } from 'drizzle-orm';

import {
  clientGetAllClients,
  clientGetAllClientsByUserId,
  clientGetClientById,
} from '@api/generated/client/client';
import type { ClientCreateViewModel, ClientUpdateViewModel } from '@api/models';

import { useAuthStore } from '@stores/authStore';
import { useSyncStore } from '@stores/syncStore';

import { mapApiClientDetail, mapLocalClientToDetail } from '@utils/helpers/clientMappers';
import { toISODate } from '@utils/helpers/dateConvert';
import { generateUUID } from '@utils/helpers/uuid';
import i18n from '@utils/i18n';

import { db } from '@db/index';
import { getAllClients, getClientByLocalId, getClientByServerId } from '@db/queries/clients';
import { clients } from '@db/schema';

import { AppConstants } from '@constants/appConstants';

import type { ClientDetail } from '../types/clients.types';
import type { LocalClient } from '../types/db.types';

const unwrap = <T>(res: unknown): { success: boolean; data?: T; error?: string } => {
  const r = res as { success?: boolean; data?: T; message?: string; errors?: string[] };
  if (!r?.success) {
    return { success: false, error: r?.errors?.[0] ?? r?.message ?? i18n.t('common.errorGeneric') };
  }
  return { success: true, data: r.data };
};

export const fetchClientsFromDb = (): LocalClient[] => {
  const { userId, roleId } = useAuthStore.getState();
  const isAdmin = roleId === AppConstants.ROLES.ADMIN;
  return isAdmin ? getAllClients() : getAllClients(userId);
};

export const refreshClientsFromApi = async (): Promise<void> => {
  // Abort if a full sync is already running — let the sync own the DB writes
  if (useSyncStore.getState().isSyncing) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  const { roleId } = useAuthStore.getState();
  const isAdmin = roleId === AppConstants.ROLES.ADMIN;

  try {
    const res = isAdmin ? await clientGetAllClients() : await clientGetAllClientsByUserId();
    const r = res as unknown as { success?: boolean; data?: any[] };
    if (!r?.success || !r.data) return;

    // Build a set of serverIds with pending deletes so we don't re-insert them
    const pendingDeleteIds = new Set(
      useSyncStore.getState().pendingChanges
        .filter((c) => c.entity === 'client' && c.operation === 'delete')
        .map((c) => c.data.serverId as number),
    );

    for (const item of r.data) {
      // Re-check after each await boundary — sync may have started mid-flight
      if (useSyncStore.getState().isSyncing) break;

      const serverId = item.id ?? item.clientId ?? 0;
      const existing = getClientByServerId(serverId);
      const outstanding = (item as any).outstandingBalance ?? item.openingBalance ?? null;

      if (existing) {
        // Never overwrite a record that has local pending changes
        if (!existing.isSynced) continue;

        db.update(clients)
          .set({
            userId: item.userId ?? existing.userId,
            outstandingBalance: outstanding ?? existing.outstandingBalance,
            name: item.name ?? existing.name,
            phone: item.phone ?? existing.phone,
            address: item.address ?? existing.address,
            clientTypeId: item.clientTypeId ?? existing.clientTypeId,
            creditLimit: item.creditLimit ?? existing.creditLimit,
            openingBalance: item.openingBalance ?? existing.openingBalance,
            notes: item.notes ?? existing.notes,
            isActive: item.isActive ?? existing.isActive,
            isSynced: true,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(clients.serverId, serverId))
          .run();
      } else {
        // Skip records the user deleted offline — sync will remove them from the server
        if (pendingDeleteIds.has(serverId)) continue;
        if (useSyncStore.getState().isSyncing) break;

        db.insert(clients)
          .values({
            localId: generateUUID(),
            serverId,
            userId: item.userId ?? null,
            outstandingBalance: outstanding,
            name: item.name ?? '',
            phone: item.phone ?? null,
            address: item.address ?? null,
            clientTypeId: item.clientTypeId ?? 1,
            creditLimit: item.creditLimit ?? null,
            openingBalance: item.openingBalance ?? null,
            notes: item.notes ?? null,
            isActive: item.isActive ?? true,
            isSynced: true,
            createdAt: null,
            version: item.version ?? 0,
            updatedAt: null,
          })
          .run();
      }
    }
  } catch {
    // silent background refresh failure
  }
};

export const fetchClientDetailFromApi = async (serverId: number): Promise<ClientDetail | null> => {
  const netState = await NetInfo.fetch();

  if (!netState.isConnected) {
    const local = getClientByServerId(serverId);
    return local ? mapLocalClientToDetail(local) : null;
  }

  const local = getClientByServerId(serverId);
  try {
    const res = await clientGetClientById(serverId);
    const r = unwrap<any>(res);
    if (!r.success || !r.data) return local ? mapLocalClientToDetail(local) : null;
    return mapApiClientDetail(r.data, local);
  } catch {
    return local ? mapLocalClientToDetail(local) : null;
  }
};

export const createClientApi = async (
  values: ClientCreateViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const localId = generateUUID();
    const { userId } = useAuthStore.getState();

    db.insert(clients)
      .values({
        localId,
        serverId: null,
        userId: userId ?? null,
        name: values.name ?? '',
        phone: values.phone ?? null,
        address: values.address ?? null,
        clientTypeId: values.clientTypeId ?? 1,
        creditLimit: values.creditLimit ?? null,
        openingBalance: values.openingBalance ?? null,
        outstandingBalance: null,
        notes: values.notes ?? null,
        isActive: true,
        isSynced: false,
        createdAt: toISODate(new Date().toISOString()) ?? null,
        version: 0,
        updatedAt: null,
      })
      .run();

    useSyncStore.getState().addPendingChange({
      localId,
      entity: 'client',
      operation: 'create',
      data: values as Record<string, unknown>,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? i18n.t('common.errorGeneric') };
  }
};

export const updateClientApi = async (
  serverId: number,
  localId: string,
  values: ClientUpdateViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    db.update(clients)
      .set({
        name: values.name ?? undefined,
        phone: values.phone ?? undefined,
        address: values.address ?? undefined,
        clientTypeId: values.clientTypeId ?? undefined,
        creditLimit: values.creditLimit ?? undefined,
        openingBalance: values.openingBalance ?? undefined,
        notes: values.notes ?? undefined,
        isActive: values.isActive ?? undefined,
        isSynced: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(clients.localId, localId))
      .run();

    const localRecord = getClientByLocalId(localId);
    useSyncStore.getState().addPendingChange({
      localId,
      entity: 'client',
      operation: 'update',
      data: { serverId, version: localRecord?.version ?? 0, ...values } as Record<string, unknown>,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? i18n.t('common.errorGeneric') };
  }
};

export const deleteClientApi = async (
  serverId: number | null,
  localId: string,
): Promise<{ success: boolean; error?: string }> => {
  db.delete(clients).where(eq(clients.localId, localId)).run();

  // Only queue if the record exists on the server — local-only records can be dropped silently
  if (serverId) {
    useSyncStore.getState().addPendingChange({
      localId,
      entity: 'client',
      operation: 'delete',
      data: { serverId } as Record<string, unknown>,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    });
  }

  return { success: true };
};
