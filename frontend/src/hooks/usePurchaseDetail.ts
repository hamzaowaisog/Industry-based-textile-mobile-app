import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@stores/authStore';
import { usePurchaseStore } from '@stores/purchaseStore';

import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import type { MainStackParamList, PurchaseStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const usePurchaseDetail = (purchaseId: number) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<PurchaseStackParamList & MainStackParamList>>();
  const { roleId } = useAuthStore();
  const {
    currentPurchase,
    detailLoading,
    submitting,
    fetchPurchaseDetail,
    updatePurchase,
    deletePurchase,
    clearCurrentPurchase,
    prepareDetailLoad,
  } = usePurchaseStore();

  const canUpdate = roleId === AppConstants.ROLES.ADMIN || roleId === AppConstants.ROLES.STAFF;
  const canDelete = roleId === AppConstants.ROLES.ADMIN;
  const { downloadPdf, isDownloading: isDossierPdfDownloading } = usePdfDownload();

  const load = useCallback(() => {
    prepareDetailLoad();
    void fetchPurchaseDetail(purchaseId);
  }, [purchaseId, fetchPurchaseDetail, prepareDetailLoad]);

  const onBack = useCallback(() => {
    clearCurrentPurchase();
    navigation.goBack();
  }, [navigation, clearCurrentPurchase]);

  const onSupplierPress = useCallback(
    (supplierId: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.CLIENT_DETAIL as any, {
        clientId: supplierId,
      });
    },
    [navigation],
  );

  const onMarkInProgress = useCallback(() => {
    if (!currentPurchase) return;
    Alert.alert(
      i18n.t('purchases.detail.confirmInProgress'),
      i18n.t('purchases.detail.confirmInProgressMsg'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('purchases.detail.markInProgress'),
          onPress: async () => {
            const result = await updatePurchase(
              currentPurchase.id,
              AppConstants.PURCHASE_STATUS.IN_PROGRESS,
              currentPurchase.paymentTypeId,
            );
            if (result.success) {
              void fetchPurchaseDetail(purchaseId);
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentPurchase, purchaseId, updatePurchase, fetchPurchaseDetail]);

  const onMarkReceived = useCallback(() => {
    if (!currentPurchase) return;
    Alert.alert(
      i18n.t('purchases.detail.confirmReceive'),
      i18n.t('purchases.detail.confirmReceiveMsg'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('purchases.detail.markReceived'),
          onPress: async () => {
            const result = await updatePurchase(
              currentPurchase.id,
              AppConstants.PURCHASE_STATUS.DELIVERED,
              currentPurchase.paymentTypeId,
            );
            if (result.success) {
              void fetchPurchaseDetail(purchaseId);
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentPurchase, purchaseId, updatePurchase, fetchPurchaseDetail]);

  const onCancelPurchase = useCallback(() => {
    if (!currentPurchase) return;
    Alert.alert(
      i18n.t('purchases.detail.confirmCancel'),
      i18n.t('purchases.detail.confirmCancelMsg'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('purchases.detail.cancelPurchase'),
          style: 'destructive',
          onPress: async () => {
            const result = await updatePurchase(
              currentPurchase.id,
              AppConstants.PURCHASE_STATUS.CANCELLED,
              currentPurchase.paymentTypeId,
            );
            if (result.success) {
              void fetchPurchaseDetail(purchaseId);
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentPurchase, purchaseId, updatePurchase, fetchPurchaseDetail]);

  const onEditPurchase = useCallback(
    (id: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.EDIT_PURCHASE as any, { purchaseId: id });
    },
    [navigation],
  );

  const onRecordPayment = useCallback(
    (id: number) => {
      if (!currentPurchase) return;
      navigation.getParent()?.navigate(AppConstants.SCREENS.MAIN.PAYMENTS_STACK, {
        screen: AppConstants.SCREENS.MAIN.RECORD_PAYMENT,
        params: {
          clientId: currentPurchase.supplierId,
          clientName: currentPurchase.supplierName,
          purchaseId: id,
        },
      });
    },
    [navigation, currentPurchase],
  );

  const onDelete = useCallback(() => {
    if (!currentPurchase) return;
    Alert.alert(
      i18n.t('purchases.deleteTitle'),
      i18n.t('purchases.deleteMessage', { id: `PUR-${currentPurchase.id}` }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deletePurchase(currentPurchase.id);
            if (result.success) {
              showSuccess(i18n.t('purchases.deleteSuccess'), '');
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentPurchase, deletePurchase, navigation]);

  const onDossierPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.purchaseDossier(purchaseId),
      AppConstants.PDF.FILENAMES.purchaseDossier(purchaseId),
    );
  }, [downloadPdf, purchaseId]);

  return {
    purchase: currentPurchase,
    loading: detailLoading,
    submitting,
    canUpdate,
    canDelete,
    load,
    onBack,
    onSupplierPress,
    onMarkInProgress,
    onMarkReceived,
    onCancelPurchase,
    onRecordPayment,
    onEditPurchase,
    onDelete,
    onDossierPdfPress,
    isDossierPdfDownloading,
  };
};
