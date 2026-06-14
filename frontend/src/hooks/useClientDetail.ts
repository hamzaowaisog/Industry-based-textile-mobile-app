import { useCallback, useEffect, useState } from 'react';

import { Alert } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useClientStore } from '@stores/clientStore';

import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import type { ClientTab } from '../types/clients.types';
import type { ClientStackParamList } from '../types/navigation.types';

export const useClientDetail = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();
  const route = useRoute<RouteProp<ClientStackParamList, 'ClientDetail'>>();
  const { clientId } = route.params;

  const { currentClient, detailLoading, fetchClientDetail, prepareDetailLoad, deleteClient } =
    useClientStore();
  const [tab, setTab] = useState<ClientTab>(AppConstants.CLIENT_TABS.ORDERS);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      prepareDetailLoad();
      void fetchClientDetail(clientId);
    }, [clientId, prepareDetailLoad, fetchClientDetail]),
  );

  useEffect(() => {
    if (currentClient) {
      setTab(
        currentClient.clientTypeId === AppConstants.CLIENT_TYPE.SUPPLIER
          ? AppConstants.CLIENT_TABS.PURCHASES
          : AppConstants.CLIENT_TABS.ORDERS,
      );
    }
  }, [currentClient?.clientTypeId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClientDetail(clientId);
    setRefreshing(false);
  }, [fetchClientDetail, clientId]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onEdit = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_FORM, { clientId });
  }, [navigation, clientId]);

  const onDelete = useCallback(() => {
    if (!currentClient) return;
    Alert.alert(
      i18n.t('clients.deleteTitle'),
      i18n.t('clients.deleteMessage', { name: currentClient.clientName }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            const result = await deleteClient(clientId);
            setSubmitting(false);
            if (result.success) {
              showSuccess(i18n.t('clients.deleteSuccess'), '');
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentClient, clientId, deleteClient, navigation]);

  const onPrimaryAction = useCallback(() => {
    if (!currentClient) return;
    const isSupplier = currentClient.clientTypeId === AppConstants.CLIENT_TYPE.SUPPLIER;
    if (isSupplier) {
      navigation
        .getParent<NativeStackNavigationProp<any>>()
        ?.navigate(AppConstants.SCREENS.MAIN.PAYMENTS_STACK, {
          screen: AppConstants.SCREENS.MAIN.RECORD_PAYMENT,
          params: { clientId, clientName: currentClient.clientName },
        });
    } else {
      navigation
        .getParent<NativeStackNavigationProp<any>>()
        ?.navigate(AppConstants.SCREENS.MAIN.PAYMENTS_STACK, {
          screen: AppConstants.SCREENS.MAIN.RECORD_PAYMENT,
          params: { clientId, clientName: currentClient.clientName },
        });
    }
  }, [navigation, clientId, currentClient]);

  const onSecondaryAction = useCallback(() => {
    if (!currentClient) return;
    const isSupplier = currentClient.clientTypeId === AppConstants.CLIENT_TYPE.SUPPLIER;
    if (isSupplier) {
      navigation
        .getParent<NativeStackNavigationProp<any>>()
        ?.navigate(AppConstants.SCREENS.MAIN.PURCHASES_STACK, {
          screen: AppConstants.SCREENS.MAIN.CREATE_PURCHASE,
          params: { clientId, clientName: currentClient.clientName },
        });
    } else {
      navigation
        .getParent<NativeStackNavigationProp<any>>()
        ?.navigate(AppConstants.SCREENS.MAIN.ORDERS_STACK, {
          screen: AppConstants.SCREENS.MAIN.CREATE_ORDER,
          params: { clientId, clientName: currentClient.clientName },
        });
    }
  }, [navigation, clientId, currentClient]);

  return {
    client: currentClient,
    loading: detailLoading,
    refreshing,
    tab,
    onTabChange: setTab,
    onRefresh,
    onBack,
    onEdit,
    onDelete,
    onPrimaryAction,
    onSecondaryAction,
    submitting,
  };
};
