import { useCallback, useMemo, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { useMetaStore } from '@stores/metaStore';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchCreditDebitAsync } from '../core/report';
import type { AppCalendar } from '../types/common.types';
import type { ReportStackParamList } from '../types/navigation.types';
import type { ReportPeriodFilter } from '../types/reports.types';
import { getCurrentHijriYear } from '../utils/helpers/hijriDate';
import { computeCreditDebitTotals } from '../utils/helpers/reportMappers';
import { usePdfDownload } from './usePdfDownload';

export const useCreditDebitReport = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ReportStackParamList>>();
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();
  const [filter, setFilter] = useState<ReportPeriodFilter>({});

  const [calendar, setCalendar] = useState<AppCalendar>('gregorian');
  const hijriMonthsMeta = useMetaStore((s) => s.getList)(AppConstants.META.HIJRI_MONTHS);

  const { data, isFetching, refetch } = useQuery({
    queryKey: queryKeys.reports.creditDebit(filter.year, filter.month, calendar),
    queryFn: () => fetchCreditDebitAsync(filter.year, filter.month, calendar),
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const rows = data ?? [];
  const totals = useMemo(() => computeCreditDebitTotals(rows), [rows]);

  const years = useMemo(() => {
    const currentYear =
      calendar === 'hijri' ? getCurrentHijriYear() : new Date().getFullYear();
    return Array.from(
      { length: AppConstants.REPORTS.FILTER_YEARS_COUNT },
      (_, i) => currentYear - i,
    );
  }, [calendar]);

  const monthItems = useMemo(
    () =>
      calendar === 'hijri'
        ? hijriMonthsMeta
            .map((m) => ({ value: m.id ?? 0, label: m.name ?? '' }))
            .sort((a, b) => a.value - b.value)
        : undefined,
    [calendar, hijriMonthsMeta],
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onYearChange = useCallback((year?: number) => {
    setFilter((prev) => ({ year, month: year ? prev.month : undefined }));
  }, []);

  const onMonthChange = useCallback((month?: number) => {
    setFilter((prev) => ({ ...prev, month }));
  }, []);

  const onCalendarChange = useCallback((next: AppCalendar) => {
    setCalendar(next);
    setFilter({});
  }, []);

  const onPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.creditDebit(filter.year, filter.month, calendar),
      AppConstants.PDF.FILENAMES.creditDebit(filter.year, filter.month, calendar),
    );
  }, [downloadPdf, filter.year, filter.month, calendar]);

  return {
    rows,
    totals,
    loading: isFetching,
    filter,
    years,
    onYearChange,
    onMonthChange,
    monthItems,
    calendar,
    onCalendarChange,
    onBack,
    onPdfPress,
    isPdfDownloading,
  };
};
