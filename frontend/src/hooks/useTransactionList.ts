import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchTransactionsPageAsync, fetchTransactionsSummaryAsync } from '../core/transactions';
import type { LedgerStackParamList } from '../types/navigation.types';
import type { TransactionListFilter, TransactionRow } from '../types/transactions.types';
import { usePdfDownload } from './usePdfDownload';

const { CREDIT, DEBIT } = AppConstants.TRANS_TYPE;

export const useTransactionList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<LedgerStackParamList>>();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TransactionListFilter>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: TransactionRow[]; hasNextPage: boolean },
      Error,
      InfiniteData<{ items: TransactionRow[]; hasNextPage: boolean }>,
      string[],
      number
    >({
      queryKey: queryKeys.transactions.list(),
      queryFn: ({ pageParam }) =>
        fetchTransactionsPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: queryKeys.transactions.summary(),
    queryFn: fetchTransactionsSummaryAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void refetchSummary();
    }, [refetch, refetchSummary]),
  );

  const allTransactions = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const totalCredit = summary?.totalCredit ?? 0;
  const totalDebit = summary?.totalDebit ?? 0;

  const filtered = useMemo(() => {
    let result = allTransactions;
    if (activeFilter === 'credit') result = result.filter((t) => t.transTypeId === CREDIT);
    else if (activeFilter === 'debit') result = result.filter((t) => t.transTypeId === DEBIT);

    if (activeCategoryId !== null)
      result = result.filter((t) => t.transCategoryId === activeCategoryId);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.clientName.toLowerCase().includes(q) || t.transCategoryName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allTransactions, activeFilter, activeCategoryId, search]);

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
      navigation.navigate(AppConstants.SCREENS.MAIN.TRANSACTION_DETAIL, { transactionId: id });
    },
    [navigation],
  );

  const onListPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.TRANSACTION_LIST,
      AppConstants.PDF.FILENAMES.TRANSACTION_LIST,
    );
  }, [downloadPdf]);

  return {
    transactions: filtered,
    totalCredit,
    totalDebit,
    loading: isFetching && !refreshing && !isFetchingNextPage,
    refreshing,
    isFetchingNextPage,
    activeFilter,
    activeCategoryId,
    search,
    onSearchChange: setSearch,
    onFilterChange: setActiveFilter,
    onCategoryChange: setActiveCategoryId,
    onRefresh,
    onEndReached,
    onMenuPress,
    onPress,
    onListPdfPress,
    isPdfDownloading,
  };
};
