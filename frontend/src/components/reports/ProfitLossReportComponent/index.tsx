import React from 'react';

import { ScrollView, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarChart } from '@components/dashboard/BarChart';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';
import { AppStatCard } from '@components/common/AppStatCard';
import { PdfButton } from '@components/common/PdfButton';
import { ReportPeriodFilter } from '@components/common/ReportPeriodFilter';
import { ReportScreenHeader } from '@components/common/ReportScreenHeader';

import { formatPKR } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import { ReceiptIcon, TrendIcon, TruckIcon, WalletIcon } from '@constants/svgAssets';

import type { ProfitLossComponentProps } from '../../../types/reports.types';
import { Skeleton } from './Skeleton';
import { styles } from './styles';

export const ProfitLossReportComponent = ({
  rows,
  totals,
  loading,
  filter,
  years,
  onYearChange,
  onMonthChange,
  onBack,
  onPdfPress,
  isPdfDownloading,
}: ProfitLossComponentProps) => {
  const { t } = useTranslation();
  const netPositive = totals.netProfit >= 0;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ReportScreenHeader
        title={t('reports.profitLoss.title')}
        subtitle={t('reports.profitLoss.subtitle')}
        onBack={onBack}
        right={<PdfButton onPress={onPdfPress} isLoading={isPdfDownloading} />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ReportPeriodFilter filter={filter} years={years} onYearChange={onYearChange} onMonthChange={onMonthChange} />

        {loading ? (
          <Skeleton />
        ) : rows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{t('reports.profitLoss.empty')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.heroWrap}>
              <AppCard padding={20}>
                <Text style={styles.heroLabel}>{t('reports.profitLoss.netProfitLabel')}</Text>
                <AppAmount
                  value={totals.netProfit}
                  tone={netPositive ? 'credit' : 'debit'}
                  size={30}
                />
              </AppCard>
            </View>

            <View style={styles.chartWrap}>
              <AppCard padding={18}>
                <BarChart data={rows} />
              </AppCard>
            </View>

            <View style={styles.statsGrid}>
              <AppStatCard
                style={styles.statCard}
                Icon={TrendIcon}
                tint={colors.primary}
                label={t('reports.profitLoss.totalSales')}
                value={formatPKR(totals.totalSales)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={TruckIcon}
                tint={colors.warning}
                label={t('reports.profitLoss.totalPurchases')}
                value={formatPKR(totals.totalPurchases)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={ReceiptIcon}
                tint={colors.danger}
                label={t('reports.profitLoss.totalExpenses')}
                value={formatPKR(totals.totalExpenses)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={WalletIcon}
                tint={colors.success}
                label={t('reports.profitLoss.grossProfit')}
                value={formatPKR(totals.grossProfit)}
              />
            </View>

            <View style={styles.tableWrap}>
              <Text style={styles.sectionTitle}>{t('reports.profitLoss.monthlyBreakdown')}</Text>
              <AppCard padding={0}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableHeaderCell}>{t('reports.profitLoss.month')}</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>
                    {t('reports.profitLoss.sales')}
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>
                    {t('reports.profitLoss.net')}
                  </Text>
                </View>
                {rows.map((row, i) => {
                  const net = row.totalSales - row.totalPurchases - row.totalExpenses;
                  return (
                    <View
                      key={row.month}
                      style={[styles.tableRow, i === rows.length - 1 && styles.tableRowLast]}
                    >
                      <Text style={styles.tableCell}>{row.month}</Text>
                      <View style={styles.tableCellRightWrap}>
                        <AppAmount value={row.totalSales} size={13} />
                      </View>
                      <View style={styles.tableCellRightWrap}>
                        <AppAmount value={net} size={13} tone={net >= 0 ? 'credit' : 'debit'} />
                      </View>
                    </View>
                  );
                })}
              </AppCard>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
