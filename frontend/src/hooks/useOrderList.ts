import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { useOrderStore } from '@stores/orderStore';

import { STATUS_TAB_ID_MAP } from '@utils/helpers/orderContent';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchOrdersPageAsync } from '../core/orders';
import type { OrderStackParamList } from '../types/navigation.types';
import type { OrderRow, OrderStatusTab } from '../types/orders.types';
import { usePdfDownload } from './usePdfDownload';

export const useOrderList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OrderStackParamList>>();
  const { prepareDetailLoad } = useOrderStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('all');
  const [search, setSearch] = useState('');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: OrderRow[]; hasNextPage: boolean; totalCount: number },
      Error,
      InfiniteData<{ items: OrderRow[]; hasNextPage: boolean; totalCount: number }>,
      string[],
      number
    >({
      queryKey: queryKeys.orders.list(),
      queryFn: ({ pageParam }) =>
        fetchOrdersPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const allOrders = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const filtered = useMemo(() => {
    let result = allOrders;
    const statusId = STATUS_TAB_ID_MAP[activeTab];
    if (statusId !== null) result = result.filter((o) => o.statusId === statusId);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.clientName.toLowerCase().includes(q) || (o.billNo ?? '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [allOrders, activeTab, search]);

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
      navigation.navigate(AppConstants.SCREENS.MAIN.ORDER_DETAIL, { orderId: id });
    },
    [navigation, prepareDetailLoad],
  );

  const onNewOrder = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CREATE_ORDER, undefined);
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(AppConstants.PDF.PATHS.ORDER_LIST, AppConstants.PDF.FILENAMES.ORDER_LIST);
  }, [downloadPdf]);

  return {
    orders: filtered,
    totalCount,
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
    onNewOrder,
    onListPdfPress,
    isPdfDownloading,
  };
};
