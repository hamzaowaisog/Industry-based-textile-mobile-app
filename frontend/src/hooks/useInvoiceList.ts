import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useInvoiceStore } from '@stores/invoiceStore';

import { INVOICE_STATUS_TAB_ID_MAP } from '@utils/helpers/invoiceContent';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchInvoicesPageAsync, fetchInvoicesSummaryAsync } from '../core/invoices';
import type { InvoiceRow, InvoiceStatusTab } from '../types/invoices.types';
import type { InvoiceStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const useInvoiceList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<InvoiceStackParamList>>();
  const { prepareDetailLoad } = useInvoiceStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<InvoiceStatusTab>('all');
  const [search, setSearch] = useState('');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: InvoiceRow[]; hasNextPage: boolean },
      Error,
      InfiniteData<{ items: InvoiceRow[]; hasNextPage: boolean }>,
      string[],
      number
    >({
      queryKey: queryKeys.invoices.list(),
      queryFn: ({ pageParam }) =>
        fetchInvoicesPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: queryKeys.invoices.summary(),
    queryFn: fetchInvoicesSummaryAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void refetchSummary();
    }, [refetch, refetchSummary]),
  );

  const allInvoices = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const filtered = useMemo(() => {
    let result = allInvoices;
    const statusId = INVOICE_STATUS_TAB_ID_MAP[activeTab];
    if (statusId !== null) {
      result = result.filter((i) => i.invoiceStatusId === statusId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.invoiceNumber.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allInvoices, activeTab, search]);

  const totalReceivable = summary?.totalReceivable ?? 0;
  const totalPayable = summary?.totalPayable ?? 0;
  const totalCount = summary?.totalCount ?? 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchSummary()]);
    setRefreshing(false);
  }, [refetch, refetchSummary]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onPress = useCallback(
    (id: number) => {
      prepareDetailLoad();
      navigation.navigate(AppConstants.SCREENS.MAIN.INVOICE_DETAIL, { invoiceId: id });
    },
    [navigation, prepareDetailLoad],
  );

  const onCreateInvoice = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CREATE_INVOICE, undefined);
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(AppConstants.PDF.PATHS.INVOICE_LIST, AppConstants.PDF.FILENAMES.INVOICE_LIST);
  }, [downloadPdf]);

  return {
    invoices: filtered,
    totalCount,
    totalReceivable,
    totalPayable,
    search,
    activeTab,
    loading: isFetching && !refreshing && !isFetchingNextPage,
    refreshing,
    isFetchingNextPage,
    onTabChange: setActiveTab,
    onSearchChange: setSearch,
    onRefresh,
    onEndReached,
    onMenuPress,
    onPress,
    onCreateInvoice,
    onListPdfPress,
    isPdfDownloading,
  };
};
