import { useEffect, useState } from 'react';

import { useDashboardGetMonthlyOverview, useDashboardGetSummary } from '@api/generated/dashboard/dashboard';
import { useTranslation } from 'react-i18next';

import { useSyncStore } from '@stores/syncStore';

import { logoutAsync } from '../core/auth';
import { computeDashboardSummary, computeMonthlyOverview } from '../db/queries/dashboard';
import { showError, showSuccess } from '../utils/toast';
import { mapApiMonthly, mapApiSummary, mapLocalMonthly, mapLocalSummary } from '../utils/helpers/dashboardMappers';
import type { DashboardSummary, MonthlyOverviewItem } from '../types/dashboard.types';

export const useDashboard = () => {
  const { t } = useTranslation();
  const isOnline = useSyncStore((s) => s.isOnline);
  const [offlineSummary, setOfflineSummary] = useState<DashboardSummary | null>(null);
  const [offlineMonthly, setOfflineMonthly] = useState<MonthlyOverviewItem[]>([]);

  const summaryQuery = useDashboardGetSummary({ query: { enabled: isOnline } });
  const monthlyQuery = useDashboardGetMonthlyOverview(undefined, { query: { enabled: isOnline } });

  // Load offline data via useEffect (not during render)
  useEffect(() => {
    if (!isOnline) {
      const local = computeDashboardSummary();
      setOfflineSummary(mapLocalSummary(local));
      setOfflineMonthly(mapLocalMonthly(computeMonthlyOverview()));
    }
  }, [isOnline]);

  // Online data
  const apiSummary = (summaryQuery.data as any)?.data ?? summaryQuery.data;
  const onlineSummary = apiSummary ? mapApiSummary(apiSummary) : null;

  const apiMonthly = (monthlyQuery.data as any)?.data ?? monthlyQuery.data;
  const onlineMonthly: MonthlyOverviewItem[] = mapApiMonthly(apiMonthly?.months ?? []);

  const summary = isOnline ? onlineSummary : offlineSummary;
  const monthlyOverview = isOnline ? onlineMonthly : offlineMonthly;

  const onLogout = async () => {
    const result = await logoutAsync();
    if (!result.success) {
      showError(t('auth.logout'), result.error ?? t('auth.logoutFailed'));
    } else {
      showSuccess(t('auth.logout'), t('auth.logoutSuccess'));
    }
  };

  return {
    isOnline,
    isLoading: isOnline && (summaryQuery.isLoading || monthlyQuery.isLoading),
    summary,
    monthlyOverview,
    onLogout,
  };
};
