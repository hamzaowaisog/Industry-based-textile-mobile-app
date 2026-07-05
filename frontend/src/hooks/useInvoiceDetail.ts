import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@stores/authStore';
import { useInvoiceStore } from '@stores/invoiceStore';

import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import type { InvoiceStackParamList, MainDrawerParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const useInvoiceDetail = (invoiceId: number) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<InvoiceStackParamList & MainDrawerParamList>>();
  const { roleId } = useAuthStore();
  const {
    currentInvoice,
    detailLoading,
    submitting,
    fetchInvoiceDetail,
    deleteInvoice,
    changeInvoiceStatus,
    clearCurrentInvoice,
    prepareDetailLoad,
  } = useInvoiceStore();

  const canUpdate = roleId === AppConstants.ROLES.ADMIN || roleId === AppConstants.ROLES.STAFF;
  const canDelete = roleId === AppConstants.ROLES.ADMIN;
  const { downloadPdf, isDownloading: isDossierPdfDownloading } = usePdfDownload();

  const load = useCallback(() => {
    prepareDetailLoad();
    void fetchInvoiceDetail(invoiceId);
  }, [invoiceId, fetchInvoiceDetail, prepareDetailLoad]);

  const onBack = useCallback(() => {
    clearCurrentInvoice();
    navigation.goBack();
  }, [navigation, clearCurrentInvoice]);

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
      navigation.navigate(AppConstants.SCREENS.MAIN.EDIT_INVOICE, { invoiceId: id });
    },
    [navigation],
  );

  const onIssue = useCallback(() => {
    if (!currentInvoice) return;
    Alert.alert(
      i18n.t('invoices.detail.issueConfirm'),
      i18n.t('invoices.detail.issueConfirmMsg'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('invoices.detail.issue'),
          style: 'destructive',
          onPress: async () => {
            const result = await changeInvoiceStatus(
              currentInvoice.id,
              AppConstants.INVOICE_STATUS.ISSUED,
            );
            if (result.success) {
              showSuccess(i18n.t('invoices.detail.statusChanged'), '');
              void fetchInvoiceDetail(invoiceId);
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentInvoice, invoiceId, changeInvoiceStatus, fetchInvoiceDetail]);

  const onCancel = useCallback(() => {
    if (!currentInvoice) return;
    Alert.alert(
      i18n.t('invoices.detail.cancelConfirm'),
      i18n.t('invoices.detail.cancelConfirmMsg'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('invoices.detail.cancel'),
          style: 'destructive',
          onPress: async () => {
            const result = await changeInvoiceStatus(
              currentInvoice.id,
              AppConstants.INVOICE_STATUS.CANCELLED,
            );
            if (result.success) {
              showSuccess(i18n.t('invoices.detail.statusChanged'), '');
              void fetchInvoiceDetail(invoiceId);
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentInvoice, invoiceId, changeInvoiceStatus, fetchInvoiceDetail]);

  const onDelete = useCallback(() => {
    if (!currentInvoice) return;

    if (currentInvoice.invoiceStatusId !== AppConstants.INVOICE_STATUS.DRAFT) {
      Alert.alert(i18n.t('invoices.deleteErrorTitle'), i18n.t('invoices.deleteOnlyDraft'));
      return;
    }

    Alert.alert(
      i18n.t('invoices.deleteTitle'),
      i18n.t('invoices.deleteMessage', { id: currentInvoice.invoiceNumber }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteInvoice(currentInvoice.id);
            if (result.success) {
              showSuccess(i18n.t('invoices.deleteSuccess'), '');
              navigation.goBack();
            } else {
              Alert.alert(
                i18n.t('invoices.deleteErrorTitle'),
                result.error ?? i18n.t('invoices.deleteError'),
              );
            }
          },
        },
      ],
    );
  }, [currentInvoice, deleteInvoice, navigation]);

  const onDossierPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.invoiceDossier(invoiceId),
      AppConstants.PDF.FILENAMES.invoiceDossier(invoiceId),
    );
  }, [downloadPdf, invoiceId]);

  return {
    invoice: currentInvoice,
    loading: detailLoading,
    submitting,
    canUpdate,
    canDelete,
    load,
    onBack,
    onClientPress,
    onEdit,
    onIssue,
    onCancel,
    onDelete,
    onDossierPdfPress,
    isDossierPdfDownloading,
  };
};
