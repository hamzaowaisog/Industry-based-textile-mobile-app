import { useCallback, useMemo, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchClientDetailByIdAsync, fetchClientDetailsAsync } from '../core/report';
import type { ReportStackParamList } from '../types/navigation.types';
import type { ClientDetailTab } from '../types/reports.types';
import { mapClientDetailListToSelectItems } from '../utils/helpers/reportMappers';
import { usePdfDownload } from './usePdfDownload';

export const useClientDetailReport = (initialClientId?: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<ReportStackParamList>>();
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const [clientId, setClientId] = useState<number | undefined>(initialClientId);
  const [pickerVisible, setPickerVisible] = useState(!initialClientId);
  const [tab, setTab] = useState<ClientDetailTab>('orders');

  const { data: clientList } = useQuery({
    queryKey: queryKeys.reports.clientDetails(),
    queryFn: fetchClientDetailsAsync,
    staleTime: 0,
  });

  const {
    data: detail,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.reports.clientDetail(clientId ?? 0),
    queryFn: () => fetchClientDetailByIdAsync(clientId as number),
    enabled: !!clientId,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      if (clientId) void refetch();
    }, [clientId, refetch]),
  );

  const clientItems = useMemo(
    () => mapClientDetailListToSelectItems(clientList ?? []),
    [clientList],
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onOpenPicker = useCallback(() => setPickerVisible(true), []);
  const onClosePicker = useCallback(() => setPickerVisible(false), []);

  const onClientPicked = useCallback((id: number) => {
    setClientId(id);
    setTab('orders');
    setPickerVisible(false);
  }, []);

  const onPdfPress = useCallback(() => {
    if (!clientId) return;
    void downloadPdf(
      AppConstants.PDF.PATHS.clientDetailReportDossier(clientId),
      AppConstants.PDF.FILENAMES.clientDetailReportDossier(clientId),
    );
  }, [downloadPdf, clientId]);

  return {
    detail: detail ?? null,
    loading: isFetching,
    clientItems,
    pickerVisible,
    tab,
    onOpenPicker,
    onClosePicker,
    onClientPicked,
    onTabChange: setTab,
    onBack,
    onPdfPress,
    isPdfDownloading,
  };
};
