import { useCallback, useMemo, useState } from 'react';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { useClientStore } from '@stores/clientStore';

import { mapApiClientToRow } from '@utils/helpers/clientMappers';

import { AppConstants } from '@constants/appConstants';

import { fetchClientsAsync } from '../core/clients';
import type { ClientFilter, ClientRow } from '../types/clients.types';
import type { ClientStackParamList } from '../types/navigation.types';

export const useClientList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();
  const { prepareDetailLoad } = useClientStore();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('all');

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClientsAsync,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const rows: ClientRow[] = useMemo(() => {
    const mapped = (data ?? []).map(mapApiClientToRow);

    const byType = mapped.filter((c) => {
      if (filter === 'customers') return c.clientTypeId === AppConstants.CLIENT_TYPE.CUSTOMER;
      if (filter === 'suppliers') return c.clientTypeId === AppConstants.CLIENT_TYPE.SUPPLIER;
      return true;
    });

    if (!search.trim()) return byType;
    const q = search.toLowerCase();
    return byType.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q),
    );
  }, [data, filter, search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  return {
    rows,
    search,
    filter,
    loading: isFetching && !refreshing,
    refreshing,
    onRefresh,
    onSearchChange: setSearch,
    onFilterChange: setFilter,
    onMenuPress,
    onRowPress,
    onFab,
    onAddFirstClient,
  };
};
