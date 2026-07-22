import React from 'react';

import { ScrollView, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';
import { PdfButton } from '@components/common/PdfButton';
import { ReportPeriodFilter } from '@components/common/ReportPeriodFilter';
import { ReportScreenHeader } from '@components/common/ReportScreenHeader';
import { CalendarToggle } from '@components/dashboard/CalendarToggle';

import { colors } from '@theme/colors';

import type { CreditDebitComponentProps } from '../../../types/reports.types';
import { CreditDebitChart } from './CreditDebitChart';
import { Skeleton } from './Skeleton';
import { styles } from './styles';

export const CreditDebitReportComponent = ({
  rows,
  totals,
  loading,
  filter,
  years,
  onYearChange,
  onMonthChange,
  monthItems,
  calendar,
  onCalendarChange,
  onBack,
  onPdfPress,
  isPdfDownloading,
}: CreditDebitComponentProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ReportScreenHeader
        title={t('reports.creditDebit.title')}
        subtitle={t('reports.creditDebit.subtitle')}
        onBack={onBack}
        right={<PdfButton onPress={onPdfPress} isLoading={isPdfDownloading} />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CalendarToggle calendar={calendar} onChange={onCalendarChange} />
        <ReportPeriodFilter
          filter={filter}
          years={years}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          monthItems={monthItems}
        />

        {loading ? (
          <Skeleton />
        ) : rows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{t('reports.creditDebit.empty')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.chartWrap}>
              <AppCard padding={18}>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                    <Text style={styles.legendLabel}>{t('reports.creditDebit.credit')}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                    <Text style={styles.legendLabel}>{t('reports.creditDebit.debit')}</Text>
                  </View>
                </View>
                <CreditDebitChart rows={rows} />
              </AppCard>
            </View>

            <View style={styles.totalsGrid}>
              <View style={styles.totalTile}>
                <AppCard padding={14}>
                  <Text style={[styles.totalLabel, { color: colors.success }]}>
                    {t('reports.creditDebit.totalCredit')}
                  </Text>
                  <AppAmount value={totals.totalCredit} tone="credit" size={20} />
                </AppCard>
              </View>
              <View style={styles.totalTile}>
                <AppCard padding={14}>
                  <Text style={[styles.totalLabel, { color: colors.danger }]}>
                    {t('reports.creditDebit.totalDebit')}
                  </Text>
                  <AppAmount value={totals.totalDebit} tone="debit" size={20} />
                </AppCard>
              </View>
            </View>

            <View style={styles.tableWrap}>
              <Text style={styles.sectionTitle}>{t('reports.creditDebit.monthlyBreakdown')}</Text>
              <AppCard padding={0}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableHeaderCell}>{t('reports.creditDebit.month')}</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>
                    {t('reports.creditDebit.credit')}
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>
                    {t('reports.creditDebit.debit')}
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>
                    {t('reports.creditDebit.net')}
                  </Text>
                </View>
                {rows.map((row, i) => {
                  const net = row.totalCredit - row.totalDebit;
                  const positive = net >= 0;
                  return (
                    <View
                      key={row.month}
                      style={[
                        styles.tableRow,
                        { backgroundColor: positive ? colors.successLight : colors.dangerLight },
                        i === rows.length - 1 && styles.tableRowLast,
                      ]}
                    >
                      <Text style={styles.tableCell}>{row.month}</Text>
                      <View style={styles.tableCellRightWrap}>
                        <AppAmount value={row.totalCredit} size={12} tone="credit" />
                      </View>
                      <View style={styles.tableCellRightWrap}>
                        <AppAmount value={row.totalDebit} size={12} tone="debit" />
                      </View>
                      <View style={styles.tableCellRightWrap}>
                        <AppAmount value={net} size={13} tone={positive ? 'credit' : 'debit'} />
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
