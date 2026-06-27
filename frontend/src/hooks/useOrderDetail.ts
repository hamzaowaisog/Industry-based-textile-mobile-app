import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@stores/authStore';
import { useOrderStore } from '@stores/orderStore';

import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import type { MainStackParamList, OrderStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

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
    prepareDetailLoad,
  } = useOrderStore();

  const canUpdate = roleId === AppConstants.ROLES.ADMIN || roleId === AppConstants.ROLES.STAFF;
  const canDelete = roleId === AppConstants.ROLES.ADMIN;
  const { downloadPdf, isDownloading: isDossierPdfDownloading } = usePdfDownload();

  const load = useCallback(() => {
    prepareDetailLoad();
    void fetchOrderDetail(orderId);
  }, [orderId, fetchOrderDetail, prepareDetailLoad]);

  const onBack = useCallback(() => {
    clearCurrentOrder();
    navigation.goBack();
  }, [navigation, clearCurrentOrder]);

  const onClientPress = useCallback(
    (clientId: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_DETAIL as any, { clientId });
    },
    [navigation],
  );

  const onMarkInProgress = useCallback(() => {
    if (!currentOrder) return;
    Alert.alert(
      i18n.t('orders.detail.confirmInProgress'),
      i18n.t('orders.detail.confirmInProgressMsg'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('orders.detail.markInProgress'),
          onPress: async () => {
            const result = await updateOrder(
              currentOrder.id,
              AppConstants.ORDER_STATUS.IN_PROGRESS,
            );
            if (result.success) {
              void fetchOrderDetail(orderId);
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentOrder, orderId, updateOrder, fetchOrderDetail]);

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

  const onEditOrder = useCallback(
    (id: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.EDIT_ORDER as any, { orderId: id });
    },
    [navigation],
  );

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
              showSuccess(i18n.t('orders.deleteSuccess'), '');
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentOrder, deleteOrder, navigation]);

  const onDossierPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.orderDossier(orderId),
      AppConstants.PDF.FILENAMES.orderDossier(orderId),
    );
  }, [downloadPdf, orderId]);

  return {
    order: currentOrder,
    loading: detailLoading,
    submitting,
    canUpdate,
    canDelete,
    load,
    onBack,
    onClientPress,
    onMarkInProgress,
    onMarkDelivered,
    onCancelOrder,
    onRecordPayment,
    onEditOrder,
    onDelete,
    onDossierPdfPress,
    isDossierPdfDownloading,
  };
};
