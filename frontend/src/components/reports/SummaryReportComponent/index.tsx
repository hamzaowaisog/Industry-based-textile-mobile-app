import React from 'react';

import { ScrollView, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';
import { AppStatCard } from '@components/common/AppStatCard';
import { PdfButton } from '@components/common/PdfButton';
import { ReportScreenHeader } from '@components/common/ReportScreenHeader';

import { formatPKR } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import { ReceiptIcon, TrendIcon, TruckIcon, UsersIcon } from '@constants/svgAssets';

import type { SummaryReportComponentProps } from '../../../types/reports.types';
import { ExpenseBreakdownCard } from './ExpenseBreakdownCard';
import { Skeleton } from './Skeleton';
import { styles } from './styles';
import { TrendsList } from './TrendsList';

export const SummaryReportComponent = ({
  totals,
  expenseCategories,
  trends,
  loading,
  onBack,
  onPdfPress,
  isPdfDownloading,
}: SummaryReportComponentProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ReportScreenHeader
        title={t('reports.summary.title')}
        subtitle={t('reports.summary.subtitle')}
        onBack={onBack}
        right={<PdfButton onPress={onPdfPress} isLoading={isPdfDownloading} />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Skeleton />
        ) : !totals ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.emptyText}>{t('common.errorGeneric')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.heroWrap}>
              <AppCard padding={20}>
                <Text style={styles.heroLabel}>{t('reports.summary.netProfit')}</Text>
                <AppAmount
                  value={
                    totals.totalSalesAmount - totals.totalPurchasesAmount - totals.totalExpensesAmount
                  }
                  tone={
                    totals.totalSalesAmount - totals.totalPurchasesAmount - totals.totalExpensesAmount >= 0
                      ? 'credit'
                      : 'debit'
                  }
                  size={30}
                />
              </AppCard>
            </View>

            <View style={styles.statsGrid}>
              <AppStatCard
                style={styles.statCard}
                Icon={TrendIcon}
                tint={colors.primary}
                label={t('reports.summary.totalSales')}
                value={formatPKR(totals.totalSalesAmount)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={TruckIcon}
                tint={colors.warning}
                label={t('reports.summary.totalPurchases')}
                value={formatPKR(totals.totalPurchasesAmount)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={ReceiptIcon}
                tint={colors.danger}
                label={t('reports.summary.totalExpenses')}
                value={formatPKR(totals.totalExpensesAmount)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={UsersIcon}
                tint={colors.success}
                label={t('reports.summary.totalClients')}
                value={String(totals.totalClientsCount)}
              />
            </View>

            <View style={styles.tableWrap}>
              <Text style={styles.sectionTitle}>{t('reports.summary.volumeCounts')}</Text>
              <AppCard padding={16}>
                <View style={styles.volumeRow}>
                  <View style={styles.volumeItem}>
                    <Text style={styles.volumeValue}>{totals.totalOrderCount}</Text>
                    <Text style={styles.volumeLabel}>{t('reports.summary.orders')}</Text>
                  </View>
                  <View style={styles.volumeItem}>
                    <Text style={styles.volumeValue}>{totals.totalPurchaseCount}</Text>
                    <Text style={styles.volumeLabel}>{t('reports.summary.purchases')}</Text>
                  </View>
                  <View style={styles.volumeItem}>
                    <Text style={styles.volumeValue}>{totals.totalClientsCount}</Text>
                    <Text style={styles.volumeLabel}>{t('reports.summary.clients')}</Text>
                  </View>
                </View>
              </AppCard>
            </View>

            <ExpenseBreakdownCard categories={expenseCategories} />

            <TrendsList trends={trends} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
