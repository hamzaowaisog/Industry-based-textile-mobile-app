import { useCallback, useMemo } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchExpenseCategoryBreakdownAsync } from '../core/expenses';
import { fetchSummaryTotalsAsync } from '../core/report';
import type { ReportStackParamList } from '../types/navigation.types';
import { buildSummaryTrends } from '../utils/helpers/reportsContent';
import { usePdfDownload } from './usePdfDownload';

export const useSummaryReport = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ReportStackParamList>>();
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const {
    data: totals,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.reports.summary(),
    queryFn: fetchSummaryTotalsAsync,
    staleTime: 0,
  });

  const { data: expenseBreakdown, refetch: refetchExpenseBreakdown } = useQuery({
    queryKey: queryKeys.reports.summaryExpenseBreakdown(),
    queryFn: fetchExpenseCategoryBreakdownAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void refetchExpenseBreakdown();
    }, [refetch, refetchExpenseBreakdown]),
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.SUMMARY_REPORT,
      AppConstants.PDF.FILENAMES.SUMMARY_REPORT,
    );
  }, [downloadPdf]);

  const trends = useMemo(() => (totals ? buildSummaryTrends(totals) : []), [totals]);

  return {
    totals: totals ?? null,
    expenseCategories: expenseBreakdown?.categories ?? [],
    trends,
    loading: isFetching,
    onBack,
    onPdfPress,
    isPdfDownloading,
  };
};
