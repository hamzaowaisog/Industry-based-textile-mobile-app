import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { usePurchaseStore } from '@stores/purchaseStore';

import { PURCHASE_STATUS_TAB_ID_MAP } from '@utils/helpers/purchaseContent';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchPurchasesPageAsync } from '../core/purchases';
import type { PurchaseStackParamList } from '../types/navigation.types';
import type { PurchaseRow, PurchaseStatusTab } from '../types/purchases.types';
import { usePdfDownload } from './usePdfDownload';

export const usePurchaseList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<PurchaseStackParamList>>();
  const { prepareDetailLoad } = usePurchaseStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<PurchaseStatusTab>('all');
  const [search, setSearch] = useState('');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: PurchaseRow[]; hasNextPage: boolean; totalCount: number },
      Error,
      InfiniteData<{ items: PurchaseRow[]; hasNextPage: boolean; totalCount: number }>,
      string[],
      number
    >({
      queryKey: queryKeys.purchases.list(),
      queryFn: ({ pageParam }) =>
        fetchPurchasesPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const allPurchases = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const filtered = useMemo(() => {
    let result = allPurchases;
    const statusId = PURCHASE_STATUS_TAB_ID_MAP[activeTab];
    if (statusId !== null) result = result.filter((p) => p.statusId === statusId);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.supplierName.toLowerCase().includes(q) || (p.billNo ?? '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [allPurchases, activeTab, search]);

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
      navigation.navigate(AppConstants.SCREENS.MAIN.PURCHASE_DETAIL, { purchaseId: id });
    },
    [navigation, prepareDetailLoad],
  );

  const onNewPurchase = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CREATE_PURCHASE, undefined);
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(AppConstants.PDF.PATHS.PURCHASE_LIST, AppConstants.PDF.FILENAMES.PURCHASE_LIST);
  }, [downloadPdf]);

  return {
    purchases: filtered,
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
    onNewPurchase,
    onListPdfPress,
    isPdfDownloading,
  };
};
