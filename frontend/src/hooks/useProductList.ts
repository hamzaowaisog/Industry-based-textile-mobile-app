import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';
import { queryKeys } from '@constants/queryKeys';

import { fetchProductsPageAsync } from '../core/products';
import type { ProductStackParamList } from '../types/navigation.types';
import type { ProductRow, ProductStockTab } from '../types/products.types';
import { usePdfDownload } from './usePdfDownload';

export const useProductList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProductStackParamList>>();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductStockTab>('all');
  const [search, setSearch] = useState('');
  const { downloadPdf, isDownloading: isPdfDownloading } = usePdfDownload();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      { items: ProductRow[]; hasNextPage: boolean },
      Error,
      InfiniteData<{ items: ProductRow[]; hasNextPage: boolean }>,
      string[],
      number
    >({
      queryKey: queryKeys.products.list(),
      queryFn: ({ pageParam }) =>
        fetchProductsPageAsync(pageParam, AppConstants.PAGINATION.DEFAULT_PAGE_SIZE),
      initialPageParam: AppConstants.PAGINATION.DEFAULT_PAGE as number,
      getNextPageParam: (lastPage, pages) => (lastPage.hasNextPage ? pages.length + 1 : undefined),
      staleTime: 0,
    });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const allProducts = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const filtered = useMemo(() => {
    let result = allProducts;
    if (activeTab === 'low') result = result.filter((p) => p.isLow);
    else if (activeTab === 'out') result = result.filter((p) => p.isOut);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allProducts, activeTab, search]);

  const tabCounts = useMemo(
    () => ({
      all: allProducts.length,
      low: allProducts.filter((p) => p.isLow).length,
      out: allProducts.filter((p) => p.isOut).length,
    }),
    [allProducts],
  );

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
      navigation.navigate(AppConstants.SCREENS.MAIN.PRODUCT_DETAIL, { productId: id });
    },
    [navigation],
  );

  const onNewProduct = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.PRODUCT_FORM, {});
  }, [navigation]);

  const onListPdfPress = useCallback(() => {
    void downloadPdf(AppConstants.PDF.PATHS.PRODUCT_LIST, AppConstants.PDF.FILENAMES.PRODUCT_LIST);
  }, [downloadPdf]);

  return {
    products: filtered,
    totalCount: allProducts.length,
    tabCounts,
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
    onNewProduct,
    onListPdfPress,
    isPdfDownloading,
  };
};
