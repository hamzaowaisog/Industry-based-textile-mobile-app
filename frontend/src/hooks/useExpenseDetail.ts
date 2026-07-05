import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@stores/authStore';
import { useExpenseStore } from '@stores/expenseStore';

import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import type { ExpenseStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const useExpenseDetail = (expenseId: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<ExpenseStackParamList>>();
  const { roleId } = useAuthStore();
  const {
    currentExpense,
    detailLoading,
    submitting,
    fetchExpenseDetail,
    deleteExpense,
    clearCurrentExpense,
    prepareDetailLoad,
  } = useExpenseStore();

  const canUpdate = roleId === AppConstants.ROLES.ADMIN || roleId === AppConstants.ROLES.STAFF;
  const canDelete = roleId === AppConstants.ROLES.ADMIN;
  const { downloadPdf, isDownloading: isDossierPdfDownloading } = usePdfDownload();

  const load = useCallback(() => {
    prepareDetailLoad();
    void fetchExpenseDetail(expenseId);
  }, [expenseId, fetchExpenseDetail, prepareDetailLoad]);

  const onBack = useCallback(() => {
    clearCurrentExpense();
    navigation.goBack();
  }, [navigation, clearCurrentExpense]);

  const onEdit = useCallback(
    (id: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.EDIT_EXPENSE, { expenseId: id });
    },
    [navigation],
  );

  const onDelete = useCallback(() => {
    if (!currentExpense) return;
    Alert.alert(
      i18n.t('expenses.deleteTitle'),
      i18n.t('expenses.deleteMessage', { id: `HT-EXPENSE-${currentExpense.id}` }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteExpense(currentExpense.id);
            if (result.success) {
              showSuccess(i18n.t('expenses.deleteSuccess'), '');
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentExpense, deleteExpense, navigation]);

  const onDossierPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.expenseDossier(expenseId),
      AppConstants.PDF.FILENAMES.expenseDossier(expenseId),
    );
  }, [downloadPdf, expenseId]);

  return {
    expense: currentExpense,
    loading: detailLoading,
    submitting,
    canUpdate,
    canDelete,
    load,
    onBack,
    onEdit,
    onDelete,
    onDossierPdfPress,
    isDossierPdfDownloading,
  };
};
