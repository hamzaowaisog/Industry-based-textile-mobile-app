import { useCallback, useMemo, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchClientBalancesAsync } from '../core/report';
import type { ReportStackParamList } from '../types/navigation.types';
import type { ClientBalanceTab } from '../types/reports.types';
import { usePdfDownload } from './usePdfDownload';

const CLIENT_TYPE_CUSTOMER = 'Customer';

export const useClientBalanceReport = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ReportStackParamList>>();
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();
  const [tab, setTab] = useState<ClientBalanceTab>('customers');
  const [search, setSearch] = useState('');

  const { data, isFetching, refetch } = useQuery({
    queryKey: queryKeys.reports.clientBalances(),
    queryFn: fetchClientBalancesAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const allRows = data ?? [];

  const customerRows = useMemo(
    () => allRows.filter((r) => r.clientTypeName === CLIENT_TYPE_CUSTOMER),
    [allRows],
  );
  const supplierRows = useMemo(
    () => allRows.filter((r) => r.clientTypeName !== CLIENT_TYPE_CUSTOMER),
    [allRows],
  );

  const totalCustomerBalance = useMemo(
    () => customerRows.reduce((s, r) => s + r.balance, 0),
    [customerRows],
  );
  const totalSupplierBalance = useMemo(
    () => supplierRows.reduce((s, r) => s + r.balance, 0),
    [supplierRows],
  );

  const rows = useMemo(() => {
    let result = tab === 'customers' ? customerRows : supplierRows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }
    return result.sort((a, b) => b.balance - a.balance);
  }, [customerRows, supplierRows, tab, search]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onRowPress = useCallback(
    (clientId: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_DETAIL_REPORT, { clientId });
    },
    [navigation],
  );

  const onPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.CLIENT_BALANCE_LIST,
      AppConstants.PDF.FILENAMES.CLIENT_BALANCE_LIST,
    );
  }, [downloadPdf]);

  return {
    rows,
    totalCustomerBalance,
    totalSupplierBalance,
    customerCount: customerRows.length,
    supplierCount: supplierRows.length,
    loading: isFetching,
    tab,
    onTabChange: setTab,
    search,
    onSearchChange: setSearch,
    onRowPress,
    onBack,
    onPdfPress,
    isPdfDownloading,
  };
};
