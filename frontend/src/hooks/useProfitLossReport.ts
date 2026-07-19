import { useCallback, useMemo, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchProfitLossAsync } from '../core/report';
import type { ReportStackParamList } from '../types/navigation.types';
import type { ReportPeriodFilter } from '../types/reports.types';
import { computeProfitLossTotals } from '../utils/helpers/reportMappers';
import { usePdfDownload } from './usePdfDownload';

export const useProfitLossReport = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ReportStackParamList>>();
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();
  const [filter, setFilter] = useState<ReportPeriodFilter>({});

  const { data, isFetching, refetch } = useQuery({
    queryKey: queryKeys.reports.profitLoss(filter.year, filter.month),
    queryFn: () => fetchProfitLossAsync(filter.year, filter.month),
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const rows = data ?? [];
  const totals = useMemo(() => computeProfitLossTotals(rows), [rows]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: AppConstants.REPORTS.FILTER_YEARS_COUNT },
      (_, i) => currentYear - i,
    );
  }, []);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onYearChange = useCallback((year?: number) => {
    setFilter((prev) => ({ year, month: year ? prev.month : undefined }));
  }, []);

  const onMonthChange = useCallback((month?: number) => {
    setFilter((prev) => ({ ...prev, month }));
  }, []);

  const onPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.profitLoss(filter.year, filter.month),
      AppConstants.PDF.FILENAMES.profitLoss(filter.year, filter.month),
    );
  }, [downloadPdf, filter.year, filter.month]);

  return {
    rows,
    totals,
    loading: isFetching,
    filter,
    years,
    onYearChange,
    onMonthChange,
    onBack,
    onPdfPress,
    isPdfDownloading,
  };
};
