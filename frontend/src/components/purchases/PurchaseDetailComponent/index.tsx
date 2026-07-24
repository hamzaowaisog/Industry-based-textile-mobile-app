import React from 'react';

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppCard } from '@components/common/AppCard';
import { AppHijriDateLabel } from '@components/common/AppHijriDateLabel';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';
import { AppStepIndicator } from '@components/common/AppStepIndicator';
import { PdfButton } from '@components/common/PdfButton';

import { formatPKR } from '@utils/helpers/formatCurrency';
import {
  PURCHASE_PROGRESS_STEPS,
  PURCHASE_STATUS_ICONS,
  PURCHASE_STATUS_TO_STEP,
  getPurchaseStatusConfig,
} from '@utils/helpers/purchaseContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  AlertIcon,
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  UserIcon,
} from '@constants/svgAssets';

import type { PurchaseDetailComponentProps } from '../../../types/purchases.types';
import { PurchaseDetailSkeleton } from './PurchaseDetailSkeleton';
import { PurchaseLineItem } from './PurchaseLineItem';
import { styles } from './styles';

const renderStatusIcon = (statusId: number, color: string, size: number): React.ReactNode => {
  const Icon = PURCHASE_STATUS_ICONS[statusId];
  return Icon ? <Icon size={size} color={color} /> : null;
};

export const PurchaseDetailComponent = ({
  purchase,
  loading,
  submitting,
  canUpdate,
  canDelete,
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
}: PurchaseDetailComponentProps) => {
  const { t } = useTranslation();

  const isPending = purchase?.statusId === AppConstants.PURCHASE_STATUS.PENDING;
  const isCancelled = purchase?.statusId === AppConstants.PURCHASE_STATUS.CANCELLED;
  const isActive = !isCancelled && purchase?.statusId !== AppConstants.PURCHASE_STATUS.DELIVERED;

  const canMarkInProgress = canUpdate && isPending;
  const canMarkReceived = canUpdate && isActive && !isPending;
  const canEditLines = canUpdate && isActive;
  const canCancel = canUpdate && !isCancelled;

  if (loading) {
    return <PurchaseDetailSkeleton />;
  }

  if (!purchase) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.errorHeader}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack}>
            <ArrowLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{t('purchases.error.title')}</Text>
          <Text style={styles.emptySub}>{t('purchases.error.subtitle')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = getPurchaseStatusConfig(purchase.statusId);
  const subtotal = purchase.purchaseLines.reduce(
    (sum, l) => sum + (l.qty ?? 0) * (l.unitCost ?? 0),
    0,
  );
  const currentStep = PURCHASE_STATUS_TO_STEP[purchase.statusId] ?? 0;

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ backgroundColor: config.bg }} edges={['top']}>
        <View style={styles.heroNav}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack} activeOpacity={0.75}>
            <ArrowLeftIcon size={20} color={config.fg} />
          </TouchableOpacity>
          <View style={styles.heroNavActions}>
            <PdfButton
              onPress={onDossierPdfPress}
              isLoading={isDossierPdfDownloading}
              size={20}
              color={config.fg}
            />
            {canEditLines && (
              <TouchableOpacity
                style={[styles.heroNavBtn, submitting && styles.btnDisabled]}
                onPress={() => onEditPurchase(purchase.id)}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <EditIcon size={20} color={config.fg} />
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={[styles.heroDeleteBtn, submitting && styles.btnDisabled]}
                onPress={onDelete}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <TrashIcon size={20} color={colors.danger} />
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
        {/* Hero body */}
        <View style={[styles.heroBody, { backgroundColor: config.bg }]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroPurchaseId}>{`PUR-${purchase.id}`}</Text>
            <View style={styles.statusPill}>
              {renderStatusIcon(purchase.statusId, config.fg, 13)}
              <Text style={[styles.statusPillText, { color: config.fg }]}>
                {purchase.statusName}
              </Text>
            </View>
          </View>
          <Text style={styles.heroSupplierName} numberOfLines={1}>
            {purchase.supplierName}
          </Text>
          <Text style={styles.heroAmount}>{formatPKR(subtotal)}</Text>
          <Text style={styles.heroAmountLabel}>{t('purchases.detail.totalAmount')}</Text>
        </View>

        {/* Floating stat cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('purchases.detail.subtotal')}</Text>
            <Text style={styles.statValue}>{formatPKR(subtotal)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('purchases.detail.amountPaid')}</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {formatPKR(purchase.amountPaid)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('purchases.detail.payable')}</Text>
            <Text
              style={[
                styles.statValue,
                { color: purchase.payable > 0 ? colors.danger : colors.success },
              ]}
            >
              {formatPKR(purchase.payable)}
            </Text>
          </View>
        </View>

        {/* Progress track or cancelled banner */}
        <View style={styles.progressSection}>
          {isCancelled ? (
            <View style={styles.cancelledBanner}>
              <AlertIcon size={16} color={colors.danger} />
              <Text style={styles.cancelledText}>{t('purchases.detail.cancelledMsg')}</Text>
            </View>
          ) : (
            <AppStepIndicator
              steps={PURCHASE_PROGRESS_STEPS.map((step) => t(step.labelKey as any))}
              current={currentStep}
            />
          )}
        </View>

        {/* Supplier + dates card */}
        <View style={styles.section}>
          <AppCard padding={0}>
            <View style={styles.supplierRowWrap}>
              <AppRow
                leading={<AppIconTile Icon={UserIcon} color={colors.primary} size={40} />}
                primary={purchase.supplierName}
                secondary={purchase.paymentTypeName}
                onPress={() => onSupplierPress(purchase.supplierId)}
                chevron={false}
              />
            </View>
            <View style={styles.dateGrid}>
              <View style={styles.dateCell}>
                <Text style={styles.dateCellLabel}>{t('purchases.detail.purchaseDate')}</Text>
                <Text style={styles.dateCellValue}>{purchase.purchaseDate}</Text>
                <AppHijriDateLabel value={purchase.purchaseDateHijriDisplay} />
              </View>
              <View style={[styles.dateCell, styles.dateCellRight]}>
                <Text style={styles.dateCellLabel}>{t('purchases.detail.paymentMethod')}</Text>
                <Text style={styles.dateCellValue}>{purchase.paymentTypeName}</Text>
              </View>
            </View>
            {!!purchase.billNo && (
              <View style={styles.dateGrid}>
                <View style={styles.dateCell}>
                  <Text style={styles.dateCellLabel}>{t('purchases.detail.billNo')}</Text>
                  <Text style={styles.dateCellValue}>{purchase.billNo}</Text>
                </View>
              </View>
            )}
          </AppCard>
        </View>

        {/* Line items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('purchases.detail.lineItems', { count: purchase.purchaseLines.length })}
          </Text>
          <View style={styles.linesCard}>
            <ScrollView
              nestedScrollEnabled
              style={styles.linesScroll}
              showsVerticalScrollIndicator={false}
            >
              {purchase.purchaseLines.map((line, i) => (
                <PurchaseLineItem
                  key={line.id ?? i}
                  line={line}
                  index={i}
                  isLast={i === purchase.purchaseLines.length - 1}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Notes */}
        {!!purchase.notes?.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('purchases.detail.notes')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{purchase.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {canUpdate && !isCancelled && (
        <AppBottomBar>
          <>
            {(canMarkInProgress || canMarkReceived) && (
              <View style={styles.ghostBtnRow}>
                {canMarkInProgress && (
                  <TouchableOpacity
                    style={[styles.ghostBtn, submitting && styles.btnDisabled]}
                    onPress={onMarkInProgress}
                    disabled={submitting}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.ghostBtnText} numberOfLines={1}>
                      {t('purchases.detail.markInProgress')}
                    </Text>
                  </TouchableOpacity>
                )}
                {canMarkReceived && (
                  <TouchableOpacity
                    style={[styles.ghostBtn, submitting && styles.btnDisabled]}
                    onPress={onMarkReceived}
                    disabled={submitting}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.ghostBtnText} numberOfLines={1}>
                      {t('purchases.detail.markReceived')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {canCancel && (
              <TouchableOpacity
                style={[styles.cancelBtn, submitting && styles.btnDisabled]}
                onPress={onCancelPurchase}
                disabled={submitting}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelBtnText} numberOfLines={1}>
                  {t('purchases.detail.cancelPurchase')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: config.fg },
                submitting && styles.btnDisabled,
              ]}
              onPress={() => onRecordPayment(purchase.id)}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.primaryBtnText} numberOfLines={1}>
                  {t('purchases.detail.recordPayment')}
                </Text>
              )}
            </TouchableOpacity>
          </>
        </AppBottomBar>
      )}
    </View>
  );
};
