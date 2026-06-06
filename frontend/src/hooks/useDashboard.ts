import { useCallback, useEffect, useRef, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useDashboardGetMonthlyOverview, useDashboardGetSummary } from '@api/generated/dashboard/dashboard';
import { getUnreadNotifications, markAsRead } from '@db/queries/notifications';
import { useAuthStore } from '@stores/authStore';
import { useNotificationStore } from '@stores/notificationStore';
import { useSyncStore } from '@stores/syncStore';
import { computeDashboardSummary, computeMonthlyOverview } from '@db/queries/dashboard';
import { mapApiMonthly, mapApiSummary, mapLocalMonthly, mapLocalSummary } from '@utils/helpers/dashboardMappers';
import { handleDeepLink } from '@utils/helpers/notificationDeepLink';
import type { MainStackParamList } from '../types/navigation.types';
import type { DashboardSummary, MonthlyOverviewItem } from '../types/dashboard.types';
import type { NotificationItem } from '../types/notifications.types';

import { useSyncBottomSheet } from './useSyncBottomSheet';

export const useDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const isOnline = useSyncStore((s) => s.isOnline);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const userName = useAuthStore((s) => s.userName) ?? '';
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [offlineSummary, setOfflineSummary] = useState<DashboardSummary | null>(null);
  const [offlineMonthly, setOfflineMonthly] = useState<MonthlyOverviewItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationItem[]>([]);
  const isFirstMount = useRef(true);

  const summaryQuery = useDashboardGetSummary({ query: { enabled: isOnline } });
  const monthlyQuery = useDashboardGetMonthlyOverview(undefined, { query: { enabled: isOnline } });

  const syncSheet = useSyncBottomSheet(() => {
    summaryQuery.refetch();
    monthlyQuery.refetch();
  });

  const loadUnreadNotifications = useCallback(async () => {
    const data = await getUnreadNotifications(3);
    setUnreadNotifications(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isOnline) {
        summaryQuery.refetch();
        monthlyQuery.refetch();
      } else {
        setOfflineSummary(mapLocalSummary(computeDashboardSummary()));
        setOfflineMonthly(mapLocalMonthly(computeMonthlyOverview()));
      }
      void loadUnreadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, loadUnreadNotifications]),
  );

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

  useEffect(() => {
    if (isTransitioning && summary !== null) {
      setIsTransitioning(false);
    }
  }, [isTransitioning, summary]);

  const onBell = useCallback(() => navigation.navigate('NotificationCenter'), [navigation]);
  const onSeeAll = useCallback(() => navigation.navigate('More'), [navigation]);
  const onNotificationPress = useCallback(
    async (item: NotificationItem) => {
      await markAsRead(item.id);
      decrementUnread(1);
      setUnreadNotifications((prev) => prev.filter((n) => n.id !== item.id));
      handleDeepLink(item.type, item.entityId);
    },
    [decrementUnread],
  );

  return {
    isOnline,
    isLoading: isTransitioning || (isOnline && (summaryQuery.isFetching || monthlyQuery.isFetching)),
    isSyncing,
    summary,
    monthlyOverview,
    userName,
    onSync: syncSheet.openSheet,
    syncSheetRef: syncSheet.syncSheetRef,
    syncPhase: syncSheet.syncPhase,
    pendingCount: syncSheet.pendingCount,
    pendingChanges: syncSheet.pendingChanges,
    lastSyncedAt: syncSheet.lastSyncedAt,
    // Notification props
    unreadCount,
    unreadNotifications,
    onBell,
    onSeeAll,
    onNotificationPress,
  };
};
