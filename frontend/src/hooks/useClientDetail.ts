import { useCallback, useEffect, useState } from 'react';

import { InteractionManager } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { AppConstants } from '@constants/appConstants';
import { useClientStore } from '@stores/clientStore';
import type { ClientTab } from '../types/clients.types';
import type { ClientStackParamList, PaymentStackParamList, OrderStackParamList, PurchaseStackParamList } from '../types/navigation.types';

export const useClientDetail = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();
  const route = useRoute<RouteProp<ClientStackParamList, 'ClientDetail'>>();
  const { clientId } = route.params;

  const { currentClient, detailLoading, fetchClientDetail, clearCurrentClient } = useClientStore();
  const [tab, setTab] = useState<ClientTab>(AppConstants.CLIENT_TABS.ORDERS);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      fetchClientDetail(clientId);
    });
    return () => {
      task.cancel();
      clearCurrentClient();
    };
  }, [clientId]);

  useEffect(() => {
    if (currentClient) {
      setTab(
        currentClient.clientTypeId === 2
          ? AppConstants.CLIENT_TABS.PURCHASES
          : AppConstants.CLIENT_TABS.ORDERS,
      );
    }
  }, [currentClient?.clientTypeId]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onEdit = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_FORM, { clientId });
  }, [navigation, clientId]);

  const onPrimaryAction = useCallback(() => {
    if (!currentClient) return;
    const isSupplier = currentClient.clientTypeId === 2;
    if (isSupplier) {
      navigation.getParent<NativeStackNavigationProp<any>>()?.navigate(
        AppConstants.SCREENS.MAIN.PAYMENTS_STACK,
        {
          screen: AppConstants.SCREENS.MAIN.RECORD_PAYMENT,
          params: { clientId, clientName: currentClient.clientName },
        },
      );
    } else {
      navigation.getParent<NativeStackNavigationProp<any>>()?.navigate(
        AppConstants.SCREENS.MAIN.PAYMENTS_STACK,
        {
          screen: AppConstants.SCREENS.MAIN.RECORD_PAYMENT,
          params: { clientId, clientName: currentClient.clientName },
        },
      );
    }
  }, [navigation, clientId, currentClient]);

  const onSecondaryAction = useCallback(() => {
    if (!currentClient) return;
    const isSupplier = currentClient.clientTypeId === 2;
    if (isSupplier) {
      navigation.getParent<NativeStackNavigationProp<any>>()?.navigate(
        AppConstants.SCREENS.MAIN.PURCHASES_STACK,
        {
          screen: AppConstants.SCREENS.MAIN.CREATE_PURCHASE,
          params: { clientId, clientName: currentClient.clientName },
        },
      );
    } else {
      navigation.getParent<NativeStackNavigationProp<any>>()?.navigate(
        AppConstants.SCREENS.MAIN.ORDERS_STACK,
        {
          screen: AppConstants.SCREENS.MAIN.CREATE_ORDER,
          params: { clientId, clientName: currentClient.clientName },
        },
      );
    }
  }, [navigation, clientId, currentClient]);

  return {
    client: currentClient,
    loading: detailLoading,
    tab,
    onTabChange: setTab,
    onBack,
    onEdit,
    onPrimaryAction,
    onSecondaryAction,
  };
};
