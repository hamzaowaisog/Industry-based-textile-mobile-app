import { useCallback } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchSummaryTotalsAsync } from '../core/report';
import type { ReportStackParamList } from '../types/navigation.types';
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

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.SUMMARY_REPORT,
      AppConstants.PDF.FILENAMES.SUMMARY_REPORT,
    );
  }, [downloadPdf]);

  return {
    totals: totals ?? null,
    loading: isFetching,
    onBack,
    onPdfPress,
    isPdfDownloading,
  };
};
