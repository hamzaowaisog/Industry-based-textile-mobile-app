import { useCallback } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchTransactionDetailAsync } from '../core/transactions';
import type { LedgerStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const useTransactionDetail = (transactionId: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<LedgerStackParamList>>();
  const { downloadPdf, isDownloading: isDossierPdfDownloading } = usePdfDownload();

  const {
    data: transaction,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.transactions.detail(transactionId),
    queryFn: () => fetchTransactionDetailAsync(transactionId),
    enabled: !!transactionId,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onDossierPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.transactionDossier(transactionId),
      AppConstants.PDF.FILENAMES.transactionDossier(transactionId),
    );
  }, [downloadPdf, transactionId]);

  return {
    transaction: transaction ?? null,
    loading: isFetching,
    onBack,
    onDossierPdfPress,
    isDossierPdfDownloading,
  };
};
