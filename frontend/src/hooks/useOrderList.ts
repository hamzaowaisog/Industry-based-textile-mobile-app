import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useOrderStore } from '@stores/orderStore';

import { STATUS_TAB_ID_MAP } from '@utils/helpers/orderContent';
import { mapApiOrderToRow } from '@utils/helpers/orderMappers';

import { AppConstants } from '@constants/appConstants';

import type { OrderStackParamList } from '../types/navigation.types';
import type { OrderStatusTab } from '../types/orders.types';

export const useOrderList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OrderStackParamList>>();
  const { orders, fetchOrders, refreshOrders } = useOrderStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchOrders().then(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshOrders();
    }, [refreshOrders]),
  );

  const filtered = useMemo(() => {
    let result = orders;
    const statusId = STATUS_TAB_ID_MAP[activeTab];
    if (statusId !== null) result = result.filter((o) => o.statusId === statusId);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.clientName.toLowerCase().includes(q));
    }
    return result;
  }, [orders, activeTab, search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const onMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onPress = useCallback(
    (id: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.ORDER_DETAIL, { orderId: id });
    },
    [navigation],
  );

  const onNewOrder = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CREATE_ORDER, undefined);
  }, [navigation]);

  return {
    orders: filtered,
    totalCount: orders.length,
    search,
    activeTab,
    loading: isLoading,
    refreshing,
    onTabChange: setActiveTab,
    onSearchChange: setSearch,
    onRefresh,
    onMenuPress,
    onPress,
    onNewOrder,
  };
};
