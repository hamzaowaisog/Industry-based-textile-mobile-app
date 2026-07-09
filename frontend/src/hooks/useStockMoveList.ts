import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useStockMovementStore } from '@stores/stockMovementStore';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import {
  fetchStockMovementsPageAsync,
  fetchStockMovementsSummaryAsync,
} from '../core/stockMovements';
import type { StockStackParamList } from '../types/navigation.types';
import type { StockMoveListFilter, StockMoveRow } from '../types/stockMovements.types';
import { usePdfDownload } from './usePdfDownload';

const { IN, OUT } = AppConstants.MOVEMENT_TYPE;

export const useStockMoveList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StockStackParamList>>();
  const { prepareDetailLoad } = useStockMovementStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StockMoveListFilter>('all');
  const [search, setSearch] = useState('');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: StockMoveRow[]; hasNextPage: boolean },
      Error,
      InfiniteData<{ items: StockMoveRow[]; hasNextPage: boolean }>,
      string[],
      number
    >({
      queryKey: queryKeys.stockMovements.list(),
      queryFn: ({ pageParam }) =>
        fetchStockMovementsPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: queryKeys.stockMovements.summary(),
    queryFn: fetchStockMovementsSummaryAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void refetchSummary();
    }, [refetch, refetchSummary]),
  );

  const allMovements = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const totalIn = summary?.totalIn ?? 0;
  const totalOut = summary?.totalOut ?? 0;
  const totalInUnitLabel = summary?.totalInUnitLabel ?? '';
  const totalOutUnitLabel = summary?.totalOutUnitLabel ?? '';

  const filtered = useMemo(() => {
    let result = allMovements;
    if (activeFilter === 'in') result = result.filter((m) => m.movementTypeId === IN);
    else if (activeFilter === 'out') result = result.filter((m) => m.movementTypeId === OUT);
    else if (activeFilter === 'adj')
      result = result.filter((m) => m.movementTypeId === AppConstants.MOVEMENT_TYPE.ADJUSTMENT);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.productName.toLowerCase().includes(q) || m.movementSourceName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allMovements, activeFilter, search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onPress = useCallback(
    (id: number) => {
      prepareDetailLoad();
      navigation.navigate(AppConstants.SCREENS.MAIN.STOCK_MOVE_DETAIL, { movementId: id });
    },
    [navigation, prepareDetailLoad],
  );

  const onAddStockMove = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.ADD_STOCK_MOVE);
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.STOCK_MOVEMENT_LIST,
      AppConstants.PDF.FILENAMES.STOCK_MOVEMENT_LIST,
    );
  }, [downloadPdf]);

  return {
    movements: filtered,
    totalIn,
    totalOut,
    totalInUnitLabel,
    totalOutUnitLabel,
    loading: isFetching && !refreshing && !isFetchingNextPage,
    refreshing,
    isFetchingNextPage,
    activeFilter,
    search,
    onSearchChange: setSearch,
    onFilterChange: setActiveFilter,
    onRefresh,
    onEndReached,
    onMenuPress,
    onPress,
    onAddStockMove,
    onListPdfPress,
    isPdfDownloading,
  };
};
