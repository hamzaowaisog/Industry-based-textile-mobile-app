import { useCallback, useMemo, useState } from 'react';

import { DrawerActions } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { useOrderStore } from '@stores/orderStore';

import { STATUS_TAB_ID_MAP } from '@utils/helpers/orderContent';
import { mapApiOrderToRow } from '@utils/helpers/orderMappers';

import { AppConstants } from '@constants/appConstants';

import { fetchOrdersAsync } from '../core/orders';
import type { OrderStackParamList } from '../types/navigation.types';
import type { OrderStatusTab } from '../types/orders.types';

export const useOrderList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OrderStackParamList>>();
  const { prepareDetailLoad } = useOrderStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('all');
  const [search, setSearch] = useState('');

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrdersAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const filtered = useMemo(() => {
    let result = (data ?? []).map(mapApiOrderToRow);
    const statusId = STATUS_TAB_ID_MAP[activeTab];
    if (statusId !== null) result = result.filter((o) => o.statusId === statusId);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.clientName.toLowerCase().includes(q));
    }
    return result;
  }, [data, activeTab, search]);

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
      prepareDetailLoad();
      navigation.navigate(AppConstants.SCREENS.MAIN.ORDER_DETAIL, { orderId: id });
    },
    [navigation, prepareDetailLoad],
  );

  const onNewOrder = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CREATE_ORDER, undefined);
  }, [navigation]);

  return {
    orders: filtered,
    totalCount: (data ?? []).length,
    search,
    activeTab,
    loading: isFetching && !refreshing,
    refreshing,
    onTabChange: setActiveTab,
    onSearchChange: setSearch,
    onRefresh,
    onMenuPress,
    onPress,
    onNewOrder,
  };
};
