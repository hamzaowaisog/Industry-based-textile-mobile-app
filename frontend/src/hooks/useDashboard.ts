import { useCallback, useEffect, useRef, useState } from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { useDashboardGetMonthlyOverview, useDashboardGetSummary } from '@api/generated/dashboard/dashboard';

import { useAuthStore } from '@stores/authStore';
import { useSyncStore } from '@stores/syncStore';

import { computeDashboardSummary, computeMonthlyOverview } from '@db/queries/dashboard';
import { mapApiMonthly, mapApiSummary, mapLocalMonthly, mapLocalSummary } from '@utils/helpers/dashboardMappers';
import type { DashboardSummary, MonthlyOverviewItem } from '../../src/types/dashboard.types';

import { useSyncBottomSheet } from './useSyncBottomSheet';

export const useDashboard = () => {
  const isOnline = useSyncStore((s) => s.isOnline);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const userName = useAuthStore((s) => s.userName) ?? '';

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [offlineSummary, setOfflineSummary] = useState<DashboardSummary | null>(null);
  const [offlineMonthly, setOfflineMonthly] = useState<MonthlyOverviewItem[]>([]);
  const isFirstMount = useRef(true);

  const summaryQuery = useDashboardGetSummary({ query: { enabled: isOnline } });
  const monthlyQuery = useDashboardGetMonthlyOverview(undefined, { query: { enabled: isOnline } });

  const syncSheet = useSyncBottomSheet(() => {
    summaryQuery.refetch();
    monthlyQuery.refetch();
  });

  // Refetch or re-read local DB every time the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      if (isOnline) {
        summaryQuery.refetch();
        monthlyQuery.refetch();
      } else {
        setOfflineSummary(mapLocalSummary(computeDashboardSummary()));
        setOfflineMonthly(mapLocalMonthly(computeMonthlyOverview()));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline])
  );

  // When isOnline flips, show skeleton until the new data source is ready.
  useEffect(() => {
    if (!isOnline) {
      setOfflineSummary(mapLocalSummary(computeDashboardSummary()));
      setOfflineMonthly(mapLocalMonthly(computeMonthlyOverview()));
    }
    if (!isFirstMount.current) {
      setIsTransitioning(true);
    }
    isFirstMount.current = false;
  }, [isOnline]);

  const apiSummary = (summaryQuery.data as any)?.data ?? summaryQuery.data;
  const onlineSummary = apiSummary ? mapApiSummary(apiSummary) : null;

  const apiMonthly = (monthlyQuery.data as any)?.data ?? monthlyQuery.data;
  const onlineMonthly: MonthlyOverviewItem[] = mapApiMonthly(apiMonthly?.months ?? []);

  const summary = isOnline ? onlineSummary : offlineSummary;
  const monthlyOverview = isOnline ? onlineMonthly : offlineMonthly;

  // Clear transition once the appropriate data source has resolved.
  useEffect(() => {
    if (isTransitioning && summary !== null) {
      setIsTransitioning(false);
    }
  }, [isTransitioning, summary]);

  return {
    // Dashboard UI props
    isOnline,
    isLoading: isTransitioning || (isOnline && (summaryQuery.isFetching || monthlyQuery.isFetching)),
    isSyncing,
    summary,
    monthlyOverview,
    userName,
    onSync: syncSheet.openSheet,

    // Sync sheet props (threaded to SyncBottomSheet in screen)
    syncSheetRef: syncSheet.syncSheetRef,
    syncPhase: syncSheet.syncPhase,
    pendingCount: syncSheet.pendingCount,
    pendingChanges: syncSheet.pendingChanges,
    lastSyncedAt: syncSheet.lastSyncedAt,
  };
};
