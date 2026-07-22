import { useCallback, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  useDashboardGetMonthlyOverview,
  useDashboardGetSummary,
} from '@api/generated/dashboard/dashboard';

import { useAuthStore } from '@stores/authStore';
import { useNotificationStore } from '@stores/notificationStore';

import { mapApiMonthly, mapApiSummary } from '@utils/helpers/dashboardMappers';

import type { AppCalendar } from '../types/common.types';
import type { MainStackParamList } from '../types/navigation.types';

export const useDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const userName = useAuthStore((s) => s.userName) ?? '';
  const { unreadCount, hydrate: hydrateNotifications } = useNotificationStore();
  const [calendar, setCalendar] = useState<AppCalendar>('gregorian');

  const summaryQuery = useDashboardGetSummary();
  const monthlyQuery = useDashboardGetMonthlyOverview({ calendar });

  useFocusEffect(
    useCallback(() => {
      summaryQuery.refetch();
      monthlyQuery.refetch();
      void hydrateNotifications();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const apiSummary = (summaryQuery.data as any)?.data ?? summaryQuery.data;
  const summary = apiSummary ? mapApiSummary(apiSummary) : null;

  const apiMonthly = (monthlyQuery.data as any)?.data ?? monthlyQuery.data;
  const monthlyOverview = mapApiMonthly(apiMonthly?.months ?? []);

  const onBell = useCallback(() => navigation.navigate('NotificationCenter'), [navigation]);
  const onSeeAll = useCallback(() => navigation.navigate('More'), [navigation]);
  const onCalendarChange = useCallback((next: AppCalendar) => setCalendar(next), []);

  return {
    isLoading: summaryQuery.isFetching || monthlyQuery.isFetching,
    summary,
    monthlyOverview,
    calendar,
    onCalendarChange,
    userName,
    unreadCount,
    onBell,
    onSeeAll,
  };
};
