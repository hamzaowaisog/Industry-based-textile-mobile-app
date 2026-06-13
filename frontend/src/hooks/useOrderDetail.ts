import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@stores/authStore';
import { useOrderStore } from '@stores/orderStore';

import i18n from '@utils/i18n';

import { AppConstants } from '@constants/appConstants';

import type { MainStackParamList, OrderStackParamList } from '../types/navigation.types';

export const useOrderDetail = (orderId: number) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<OrderStackParamList & MainStackParamList>>();
  const { roleId } = useAuthStore();
  const {
    currentOrder,
    detailLoading,
    submitting,
    fetchOrderDetail,
    updateOrder,
    deleteOrder,
    clearCurrentOrder,
  } = useOrderStore();

  const canUpdate = roleId === AppConstants.ROLES.ADMIN || roleId === AppConstants.ROLES.STAFF;
  const canDelete = roleId === AppConstants.ROLES.ADMIN;

  const load = useCallback(() => {
    void fetchOrderDetail(orderId);
  }, [orderId, fetchOrderDetail]);

  const onBack = useCallback(() => {
    clearCurrentOrder();
    navigation.goBack();
  }, [navigation, clearCurrentOrder]);

  const onMore = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(
      i18n.t('orders.detail.moreOptions'),
      undefined,
      [
        canUpdate &&
        currentOrder.statusId !== AppConstants.ORDER_STATUS.CANCELLED &&
        currentOrder.statusId !== AppConstants.ORDER_STATUS.DELIVERED
          ? {
              text: i18n.t('orders.detail.cancelOrder'),
              style: 'destructive',
              onPress: onCancelOrder,
            }
          : null,
        canDelete
          ? { text: i18n.t('common.delete'), style: 'destructive', onPress: onDelete }
          : null,
        { text: i18n.t('common.cancel'), style: 'cancel' },
      ].filter(Boolean) as any[],
    );
  }, [currentOrder, canUpdate, canDelete]);

  const onClientPress = useCallback(
    (clientId: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_DETAIL as any, { clientId });
    },
    [navigation],
  );

  const onMarkDelivered = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(i18n.t('orders.detail.confirmDeliver'), i18n.t('orders.detail.confirmDeliverMsg'), [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      {
        text: i18n.t('orders.detail.markDelivered'),
        onPress: async () => {
          const result = await updateOrder(currentOrder.id, AppConstants.ORDER_STATUS.DELIVERED);
          if (result.success) {
            void fetchOrderDetail(orderId);
          } else {
            Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
          }
        },
      },
    ]);
  }, [currentOrder, orderId, updateOrder, fetchOrderDetail]);

  const onCancelOrder = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(i18n.t('orders.detail.confirmCancel'), i18n.t('orders.detail.confirmCancelMsg'), [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      {
        text: i18n.t('orders.detail.cancelOrder'),
        style: 'destructive',
        onPress: async () => {
          const result = await updateOrder(currentOrder.id, AppConstants.ORDER_STATUS.CANCELLED);
          if (result.success) {
            void fetchOrderDetail(orderId);
          } else {
            Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
          }
        },
      },
    ]);
  }, [currentOrder, orderId, updateOrder, fetchOrderDetail]);

  const onRecordPayment = useCallback(
    (id: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.RECORD_PAYMENT as any, { orderId: id });
    },
    [navigation],
  );

  const onDelete = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(
      i18n.t('orders.deleteTitle'),
      i18n.t('orders.deleteMessage', { id: `ORD-${currentOrder.id}` }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteOrder(currentOrder.id);
            if (result.success) {
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentOrder, deleteOrder, navigation]);

  return {
    order: currentOrder,
    loading: detailLoading,
    submitting,
    canUpdate,
    canDelete,
    load,
    onBack,
    onMore,
    onClientPress,
    onMarkDelivered,
    onCancelOrder,
    onRecordPayment,
    onDelete,
  };
};
