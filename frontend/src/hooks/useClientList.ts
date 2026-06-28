import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { useClientStore } from '@stores/clientStore';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchClientsPageAsync } from '../core/clients';
import type { ClientFilter, ClientRow } from '../types/clients.types';
import type { ClientStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const useClientList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();
  const { prepareDetailLoad } = useClientStore();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('all');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: ClientRow[]; hasNextPage: boolean },
      Error,
      InfiniteData<{ items: ClientRow[]; hasNextPage: boolean }>,
      string[],
      number
    >({
      queryKey: queryKeys.clients.list(),
      queryFn: ({ pageParam }) =>
        fetchClientsPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const allClients = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const rows: ClientRow[] = useMemo(() => {
    const byType = allClients.filter((c) => {
      if (filter === 'customers') return c.clientTypeId === AppConstants.CLIENT_TYPE.CUSTOMER;
      if (filter === 'suppliers') return c.clientTypeId === AppConstants.CLIENT_TYPE.SUPPLIER;
      return true;
    });

    if (!search.trim()) return byType;
    const q = search.toLowerCase();
    return byType.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q),
    );
  }, [allClients, filter, search]);

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

  const onRowPress = useCallback(
    (id: number) => {
      prepareDetailLoad();
      navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_DETAIL, { clientId: id });
    },
    [navigation, prepareDetailLoad],
  );

  const onFab = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_FORM, {});
  }, [navigation]);

  const onAddFirstClient = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_FORM, {});
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(AppConstants.PDF.PATHS.CLIENT_LIST, AppConstants.PDF.FILENAMES.CLIENT_LIST);
  }, [downloadPdf]);

  return {
    rows,
    search,
    filter,
    loading: isFetching && !refreshing && !isFetchingNextPage,
    refreshing,
    isFetchingNextPage,
    onRefresh,
    onEndReached,
    onSearchChange: setSearch,
    onFilterChange: setFilter,
    onMenuPress,
    onRowPress,
    onFab,
    onAddFirstClient,
    onListPdfPress,
    isPdfDownloading,
  };
};
