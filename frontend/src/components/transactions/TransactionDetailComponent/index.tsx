import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { formatAmount, formatPKR } from '@utils/helpers/formatCurrency';
import {
  TRANS_CATEGORY_ICONS,
  getTransTypeColor,
  getTransTypeLightColor,
  getTransTypeSign,
} from '@utils/helpers/transactionsContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, WalletIcon } from '@constants/svgAssets';

import type { TransactionDetailComponentProps } from '../../../types/transactions.types';
import { TransactionDetailSkeleton } from './TransactionDetailSkeleton';
import { styles } from './styles';

export const TransactionDetailComponent = ({
  transaction,
  loading,
  onBack,
  onDossierPdfPress,
  isDossierPdfDownloading,
}: TransactionDetailComponentProps) => {
  const { t } = useTranslation();

  if (loading) return <TransactionDetailSkeleton />;

  if (!transaction) {
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

  const typeColor = getTransTypeColor(transaction.transTypeId);
  const typeLightColor = getTransTypeLightColor(transaction.transTypeId);
  const sign = getTransTypeSign(transaction.transTypeId);
  const Icon = TRANS_CATEGORY_ICONS[transaction.transCategoryId] ?? WalletIcon;

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
              {t('transactions.detail.reference', { id: transaction.id })}
            </Text>
            <View style={styles.statusPill}>
              <Icon size={13} color={typeColor} />
              <Text style={[styles.statusPillText, { color: typeColor }]}>
                {transaction.transTypeName}
              </Text>
            </View>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {transaction.clientName || transaction.transCategoryName}
          </Text>
          <Text style={[styles.heroAmount, { color: typeColor }]}>
            {sign}
            {formatPKR(transaction.amount)}
          </Text>
          <Text style={styles.heroMeta}>
            {`${transaction.transCategoryName} · ${transaction.transDate}`}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('transactions.detail.category')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {transaction.transCategoryName}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('transactions.detail.mode')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {transaction.transModeName}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('transactions.detail.source')}</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {transaction.source}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('transactions.detail.details')}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('transactions.detail.client')}</Text>
              <Text style={styles.infoValue}>{transaction.clientName || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('transactions.detail.billNo')}</Text>
              <Text style={styles.infoValue}>{transaction.billNo || '—'}</Text>
            </View>
            {transaction.unallocatedAmount != null && transaction.unallocatedAmount > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('transactions.unallocatedDetail')}</Text>
                <Text style={[styles.infoValue, { color: colors.warning }]}>
                  {`${AppConstants.APP.CURRENCY} ${formatAmount(transaction.unallocatedAmount)}`}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('transactions.detail.recordedBy')}</Text>
              <Text style={styles.infoValue}>{transaction.userName || '—'}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>{t('transactions.detail.notes')}</Text>
              <Text style={styles.infoValue}>{transaction.notes || '—'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
