import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { formatAmount, formatPKR } from '@utils/helpers/formatCurrency';
import {
  MOVEMENT_TYPE_ICONS,
  getMovementTypeColor,
  getMovementTypeLightColor,
  getMovementTypeSign,
} from '@utils/helpers/stockMovementsContent';

import { colors } from '@theme/colors';

import { ArrowLeftIcon, BoxIcon, EditIcon, TrashIcon } from '@constants/svgAssets';

import type { StockMoveDetailComponentProps } from '../../../types/stockMovements.types';
import { StockMoveDetailSkeleton } from './StockMoveDetailSkeleton';
import { styles } from './styles';

export const StockMoveDetailComponent = ({
  movement,
  loading,
  submitting,
  canUpdate,
  canDelete,
  onBack,
  onEdit,
  onDelete,
  onDossierPdfPress,
  isDossierPdfDownloading,
}: StockMoveDetailComponentProps) => {
  const { t } = useTranslation();

  if (loading) return <StockMoveDetailSkeleton />;

  if (!movement) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.errorHeader}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack}>
            <ArrowLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{t('common.errorGeneric')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const typeColor = getMovementTypeColor(movement.movementTypeId);
  const typeLightColor = getMovementTypeLightColor(movement.movementTypeId);
  const sign = getMovementTypeSign(movement.movementTypeId);
  const Icon = MOVEMENT_TYPE_ICONS[movement.movementTypeId] ?? BoxIcon;

  return (
    <View style={styles.root}>
      <SafeAreaView
        style={[styles.heroSafeArea, { backgroundColor: typeLightColor }]}
        edges={['top']}
      >
        <View style={styles.heroNav}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack} activeOpacity={0.75}>
            <ArrowLeftIcon size={20} color={typeColor} />
          </TouchableOpacity>
          <View style={styles.heroNavActions}>
            <PdfButton
              onPress={onDossierPdfPress}
              isLoading={isDossierPdfDownloading}
              size={20}
              color={typeColor}
            />
            {canUpdate && (
              <TouchableOpacity
                style={[styles.heroNavBtn, submitting && styles.btnDisabled]}
                onPress={() => onEdit(movement.id)}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <EditIcon size={20} color={typeColor} />
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={[styles.heroDeleteBtn, submitting && styles.btnDisabled]}
                onPress={onDelete}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <TrashIcon size={20} color={typeColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBody, { backgroundColor: typeLightColor }]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroRef}>
              {t('stockMovements.detail.reference', { id: movement.id })}
            </Text>
            <View style={styles.statusPill}>
              <Icon size={13} color={typeColor} />
              <Text style={[styles.statusPillText, { color: typeColor }]}>
                {movement.movementTypeName}
              </Text>
            </View>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {movement.productName}
          </Text>
          <Text style={[styles.heroQty, { color: typeColor }]}>
            {sign}
            {formatAmount(movement.qty)}
          </Text>
          <Text style={styles.heroMeta}>
            {`${movement.movementSourceName} · ${movement.movementDate}`}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('stockMovements.detail.unitCost')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {movement.unitCost !== null ? formatPKR(movement.unitCost) : '—'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('stockMovements.detail.unitPrice')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {movement.unitPrice !== null ? formatPKR(movement.unitPrice) : '—'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('stockMovements.detail.source')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {movement.movementSourceName}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('stockMovements.detail.details')}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('stockMovements.movementDate')}</Text>
              <Text style={styles.infoValue}>{movement.movementDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('stockMovements.detail.avgCostSnapshot')}</Text>
              <Text style={styles.infoValue}>
                {movement.averageCostAtMovement !== null
                  ? formatPKR(movement.averageCostAtMovement)
                  : '—'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('stockMovements.detail.avgPriceSnapshot')}</Text>
              <Text style={styles.infoValue}>
                {movement.averagePriceAtMovement !== null
                  ? formatPKR(movement.averagePriceAtMovement)
                  : '—'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('stockMovements.detail.currentAvgCost')}</Text>
              <Text style={styles.infoValue}>
                {movement.currentAverageCost !== null
                  ? formatPKR(movement.currentAverageCost)
                  : '—'}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>{t('stockMovements.detail.currentAvgPrice')}</Text>
              <Text style={styles.infoValue}>
                {movement.currentAveragePrice !== null
                  ? formatPKR(movement.currentAveragePrice)
                  : '—'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
