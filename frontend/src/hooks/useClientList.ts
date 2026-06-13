import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useClientStore } from '@stores/clientStore';

import { mapApiClientToRow } from '@utils/helpers/clientMappers';
import i18n from '@utils/i18n';

import { AppConstants } from '@constants/appConstants';

import type { ClientFilter, ClientRow } from '../types/clients.types';
import type { ClientStackParamList } from '../types/navigation.types';

export const useClientList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();
  const { clients, fetchClients, deleteClient, refreshClients } = useClientStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('all');

  useEffect(() => {
    void fetchClients().then(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshClients();
    }, [refreshClients]),
  );

  const rows: ClientRow[] = useMemo(() => {
    const mapped = clients.map(mapApiClientToRow);

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
  }, [clients, filter, search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  }, [fetchClients]);

  const onMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onRowPress = useCallback(
    (id: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_DETAIL, { clientId: id });
    },
    [navigation],
  );

  const onFab = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_FORM, {});
  }, [navigation]);

  const onAddFirstClient = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_FORM, {});
  }, [navigation]);

  const onDelete = useCallback(
    (id: number, name: string) => {
      Alert.alert(i18n.t('clients.deleteTitle'), i18n.t('clients.deleteMessage', { name }), [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteClient(id);
            if (!result.success) {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ]);
    },
    [deleteClient],
  );

  return {
    rows,
    search,
    filter,
    loading: isLoading,
    refreshing,
    onRefresh,
    onSearchChange: setSearch,
    onFilterChange: setFilter,
    onMenuPress,
    onRowPress,
    onFab,
    onAddFirstClient,
    onDelete,
  };
};
