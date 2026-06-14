import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { AppConstants } from '@constants/appConstants';

import { fetchAllProductsAsync } from '../core/products';
import type { ProductStackParamList } from '../types/navigation.types';
import type { ProductStockTab } from '../types/products.types';

export const useProductList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProductStackParamList>>();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductStockTab>('all');
  const [search, setSearch] = useState('');

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchAllProductsAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const allProducts = data ?? [];

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

  return {
    products: filtered,
    totalCount: allProducts.length,
    tabCounts,
    search,
    activeTab,
    loading: isFetching && !refreshing,
    refreshing,
    onTabChange: setActiveTab,
    onSearchChange: setSearch,
    onRefresh,
    onMenuPress,
    onPress,
    onNewProduct,
  };
};
