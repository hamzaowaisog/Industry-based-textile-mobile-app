import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useExpenseStore } from '@stores/expenseStore';
import { useMetaStore } from '@stores/metaStore';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchExpenseMonthSummaryAsync, fetchExpensesPageAsync } from '../core/expenses';
import type { ExpenseCategoryFilter, ExpenseRow } from '../types/expenses.types';
import type { ExpenseStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const useExpenseList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ExpenseStackParamList>>();
  const { prepareDetailLoad } = useExpenseStore();
  const getList = useMetaStore((s) => s.getList);

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ExpenseCategoryFilter>('all');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const categories = useMemo(
    () =>
      getList(AppConstants.META.EXPENSE_TYPES).map((e) => ({
        id: e.id ?? 0,
        name: e.name ?? '',
      })),
    [getList],
  );

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: ExpenseRow[]; hasNextPage: boolean },
      Error,
      InfiniteData<{ items: ExpenseRow[]; hasNextPage: boolean }>,
      string[],
      number
    >({
      queryKey: queryKeys.expenses.list(),
      queryFn: ({ pageParam }) =>
        fetchExpensesPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  const {
    data: summary,
    isFetching: summaryFetching,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: queryKeys.expenses.monthSummary(),
    queryFn: fetchExpenseMonthSummaryAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void refetchSummary();
    }, [refetch, refetchSummary]),
  );

  const allExpenses = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const filtered = useMemo(() => {
    let result = allExpenses;
    if (activeCategory !== 'all') {
      result = result.filter((e) => e.expenseTypeId === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          (e.notes ?? '').toLowerCase().includes(q) ||
          e.expenseTypeName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allExpenses, search, activeCategory]);

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
      navigation.navigate(AppConstants.SCREENS.MAIN.EXPENSE_DETAIL, { expenseId: id });
    },
    [navigation, prepareDetailLoad],
  );

  const onAddExpense = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.ADD_EXPENSE);
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(AppConstants.PDF.PATHS.EXPENSE_LIST, AppConstants.PDF.FILENAMES.EXPENSE_LIST);
  }, [downloadPdf]);

  return {
    expenses: filtered,
    totalCount: allExpenses.length,
    summary: summary ?? null,
    summaryLoading: summaryFetching && !refreshing,
    search,
    loading: isFetching && !refreshing && !isFetchingNextPage,
    refreshing,
    isFetchingNextPage,
    categories,
    activeCategory,
    onSearchChange: setSearch,
    onCategoryChange: setActiveCategory,
    onRefresh,
    onEndReached,
    onMenuPress,
    onPress,
    onAddExpense,
    onListPdfPress,
    isPdfDownloading,
  };
};
