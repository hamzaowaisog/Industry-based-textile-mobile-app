import { syncFullPull, syncPush } from '@api/generated/sync/sync';
import type { SyncFullPullResponseDto, SyncPushDto } from '@api/models';
import { runMigrations } from '@db/migrate';
import { clearAllTables } from '@db/queries/clearAll';
import { insertManyClients } from '@db/queries/clients';
import { insertManyExpenses } from '@db/queries/expenses';
import { insertManyInvoices } from '@db/queries/invoices';
import { insertManyLookups } from '@db/queries/lookups';
import { insertManyOrders } from '@db/queries/orders';
import { insertManyPayments } from '@db/queries/payments';
import { insertManyProducts } from '@db/queries/products';
import { insertManyPurchases } from '@db/queries/purchases';
import { insertManyStockMovements } from '@db/queries/stockMovements';
import { setSyncMeta } from '@db/queries/syncMeta';
import { insertManyTransactions } from '@db/queries/transactions';
import { useSyncStore } from '@stores/syncStore';
import type { PendingChange } from '../types/db.types';
import i18n from '@utils/i18n';
import { showError, showSuccess } from '@utils/toast';

export const initDb = async (): Promise<void> => {
  await runMigrations();
};

export const fullPull = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await syncFullPull();
    const res = response as unknown as {
      success: boolean;
      data?: SyncFullPullResponseDto;
      message?: string;
    };

    if (!res.success || !res.data) {
      return { success: false, error: res.message ?? i18n.t('sync.pullFailed') };
    }

    const data = res.data;

    await clearAllTables();

    insertManyClients(data.clients ?? []);
    insertManyProducts(data.products ?? []);
    insertManyOrders(data.orders ?? []);
    insertManyPurchases(data.purchases ?? []);
    insertManyPayments(data.payments ?? []);
    insertManyExpenses(data.expenses ?? []);
    insertManyStockMovements(data.stockMovements ?? []);
    insertManyInvoices(data.invoices ?? []);
    insertManyTransactions(data.transactions ?? []);

    insertManyLookups('userRole', data.userRoles ?? []);
    insertManyLookups('clientType', data.clientTypes ?? []);
    insertManyLookups('orderStatus', data.orderStatuses ?? []);
    insertManyLookups('purchaseStatus', data.purchaseStatuses ?? []);
    insertManyLookups('paymentType', data.paymentTypes ?? []);
    insertManyLookups('paymentDirection', data.paymentDirections ?? []);
    insertManyLookups('transType', data.transTypes ?? []);
    insertManyLookups('transMode', data.transModes ?? []);
    insertManyLookups('transCategory', data.transCategories ?? []);
    insertManyLookups('expenseType', data.expenseTypes ?? []);
    insertManyLookups('movementType', data.movementTypes ?? []);
    insertManyLookups('movementSource', data.movementSources ?? []);
    insertManyLookups('invoiceStatus', data.invoiceStatuses ?? []);

    if (data.serverTime) {
      setSyncMeta('lastSyncedAt', data.serverTime);
      useSyncStore.getState().setLastSyncedAt(data.serverTime);
    }

    return { success: true };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? i18n.t('sync.pullFailed');
    return { success: false, error: msg };
  }
};

export const push = async (): Promise<{ success: boolean; error?: string }> => {
  const { pendingChanges, removePendingChange, setSyncError } = useSyncStore.getState();

  if (!pendingChanges.length) return { success: true };

  const groupBy = (changes: PendingChange[], entity: string) =>
    changes.filter((c) => c.entity === entity).map((c) => c.data);

  const pushDto: SyncPushDto = {
    clients: groupBy(pendingChanges, 'client') as any,
    products: groupBy(pendingChanges, 'product') as any,
    orders: groupBy(pendingChanges, 'order') as any,
    purchases: groupBy(pendingChanges, 'purchase') as any,
    payments: groupBy(pendingChanges, 'payment') as any,
    expenses: groupBy(pendingChanges, 'expense') as any,
    stockMovements: groupBy(pendingChanges, 'stockMovement') as any,
    invoices: groupBy(pendingChanges, 'invoice') as any,
    transactions: groupBy(pendingChanges, 'transaction') as any,
  };

  try {
    const response = await syncPush(pushDto);
    const res = response as unknown as {
      success: boolean;
      data?: { results?: Array<{ localId: string; status: string; errors?: string[] }> };
      message?: string;
    };

    if (!res.success) {
      setSyncError(res.message ?? i18n.t('sync.pushFailed'));
      return { success: false, error: res.message ?? i18n.t('sync.pushFailed') };
    }

    const results = res.data?.results ?? [];
    for (const result of results) {
      if (result.status === 'accepted') {
        removePendingChange(result.localId);
      }
    }

    const rejectedCount = results.filter((r) => r.status === 'rejected').length;
    if (rejectedCount > 0) {
      setSyncError(i18n.t('sync.partialFailure', { count: rejectedCount }));
    } else {
      setSyncError(null);
    }

    return { success: true };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? i18n.t('sync.pushFailed');
    setSyncError(msg);
    return { success: false, error: msg };
  }
};

export const syncNow = async (): Promise<void> => {
  const store = useSyncStore.getState();
  if (!store.isOnline) {
    showError(i18n.t('sync.offlineTitle'), i18n.t('sync.offlineMessage'));
    return;
  }

  store.setSyncing(true);
  store.setSyncError(null);

  const pushResult = await push();
  if (!pushResult.success) {
    store.setSyncing(false);
    showError(i18n.t('sync.pushFailedTitle'), pushResult.error ?? '');
    return;
  }

  const pullResult = await fullPull();
  store.setSyncing(false);

  if (!pullResult.success) {
    showError(i18n.t('sync.pullFailedTitle'), pullResult.error ?? '');
    return;
  }

  showSuccess(i18n.t('sync.successTitle'), i18n.t('sync.successMessage'));
};
