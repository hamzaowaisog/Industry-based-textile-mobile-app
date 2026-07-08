import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@stores/authStore';
import { useStockMovementStore } from '@stores/stockMovementStore';

import i18n from '@utils/i18n';
import { showSuccess } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import type { StockStackParamList } from '../types/navigation.types';
import { usePdfDownload } from './usePdfDownload';

export const useStockMoveDetail = (movementId: number) => {
  const navigation = useNavigation<NativeStackNavigationProp<StockStackParamList>>();
  const { roleId } = useAuthStore();
  const {
    currentMovement,
    detailLoading,
    submitting,
    fetchMovementDetail,
    deleteMovement,
    clearCurrentMovement,
    prepareDetailLoad,
  } = useStockMovementStore();

  const isManualMovement =
    currentMovement?.movementSourceId === AppConstants.MOVEMENT_SOURCE.MANUAL;
  const canUpdate =
    isManualMovement &&
    (roleId === AppConstants.ROLES.ADMIN || roleId === AppConstants.ROLES.STAFF);
  const canDelete = isManualMovement && roleId === AppConstants.ROLES.ADMIN;
  const { downloadPdf, isDownloading: isDossierPdfDownloading } = usePdfDownload();

  const load = useCallback(() => {
    prepareDetailLoad();
    void fetchMovementDetail(movementId);
  }, [movementId, fetchMovementDetail, prepareDetailLoad]);

  const onBack = useCallback(() => {
    clearCurrentMovement();
    navigation.goBack();
  }, [navigation, clearCurrentMovement]);

  const onEdit = useCallback(
    (id: number) => {
      navigation.navigate(AppConstants.SCREENS.MAIN.EDIT_STOCK_MOVE, { movementId: id });
    },
    [navigation],
  );

  const onDelete = useCallback(() => {
    if (!currentMovement) return;
    Alert.alert(
      i18n.t('stockMovements.deleteTitle'),
      i18n.t('stockMovements.deleteMessage', { id: `HT-MOVEMENT-${currentMovement.id}` }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteMovement(currentMovement.id);
            if (result.success) {
              showSuccess(i18n.t('stockMovements.deleteSuccess'), '');
              navigation.goBack();
            } else {
              Alert.alert(i18n.t('common.error'), result.error ?? i18n.t('common.errorGeneric'));
            }
          },
        },
      ],
    );
  }, [currentMovement, deleteMovement, navigation]);

  const onDossierPdfPress = useCallback(() => {
    void downloadPdf(
      AppConstants.PDF.PATHS.stockMovementDossier(movementId),
      AppConstants.PDF.FILENAMES.stockMovementDossier(movementId),
    );
  }, [downloadPdf, movementId]);

  return {
    movement: currentMovement,
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
