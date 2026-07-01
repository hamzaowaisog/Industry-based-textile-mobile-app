import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@stores/authStore';
import { usePaymentStore } from '@stores/paymentStore';

import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import type { MainDrawerParamList, PaymentStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const usePaymentDetail = (paymentId: number) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentStackParamList & MainDrawerParamList>>();
  const { roleId } = useAuthStore();
  const {
    currentPayment,
    detailLoading,
    submitting,
    fetchPaymentDetail,
    reversePayment,
    deletePayment,
    clearCurrentPayment,
    prepareDetailLoad,
  } = usePaymentStore();

  const canUpdate = roleId === AppConstants.ROLES.ADMIN || roleId === AppConstants.ROLES.STAFF;
  const canDelete = roleId === AppConstants.ROLES.ADMIN;
  const canReverse = roleId === AppConstants.ROLES.ADMIN;
  const { downloadPdf, isDownloading: isDossierPdfDownloading } = usePdfDownload();

  const load = useCallback(() => {
    prepareDetailLoad();
    void fetchPaymentDetail(paymentId);
  }, [paymentId, fetchPaymentDetail, prepareDetailLoad]);

  const onBack = useCallback(() => {
    clearCurrentPayment();
    navigation.goBack();
  }, [navigation, clearCurrentPayment]);

  const onClientPress = useCallback(
    (clientId: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.CLIENTS_STACK, {
        screen: AppConstants.SCREENS.MAIN.CLIENT_DETAIL,
        params: { clientId },
      });
    },
    [navigation],
  );

  const onEdit = useCallback(
    (id: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.EDIT_PAYMENT, { paymentId: id });
    },
    [navigation],
  );

  const onReverse = useCallback(() => {
    if (!currentPayment) return;
    Alert.alert(
      i18n.t('payments.detail.reverseConfirm'),
      i18n.t('payments.detail.reverseConfirmMsg'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('payments.detail.reverse'),
          style: 'destructive',
          onPress: async () => {
            const result = await reversePayment(currentPayment.id);
            if (result.success) {
              showSuccess(i18n.t('payments.detail.reverseSuccess'), '');
              void fetchPaymentDetail(paymentId);
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentPayment, paymentId, reversePayment, fetchPaymentDetail]);

  const onDelete = useCallback(() => {
    if (!currentPayment) return;
    Alert.alert(
      i18n.t('payments.deleteTitle'),
      i18n.t('payments.deleteMessage', { id: `HT-PAYMENT-${currentPayment.id}` }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deletePayment(currentPayment.id);
            if (result.success) {
              showSuccess(i18n.t('payments.deleteSuccess'), '');
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentPayment, deletePayment, navigation]);

  const onDossierPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.paymentDossier(paymentId),
      AppConstants.PDF.FILENAMES.paymentDossier(paymentId),
    );
  }, [downloadPdf, paymentId]);

  return {
    payment: currentPayment,
    loading: detailLoading,
    submitting,
    canUpdate,
    canDelete,
    canReverse,
    load,
    onBack,
    onClientPress,
    onEdit,
    onReverse,
    onDelete,
    onDossierPdfPress,
    isDossierPdfDownloading,
  };
};
