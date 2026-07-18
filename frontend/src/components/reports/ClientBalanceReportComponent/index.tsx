import React, { useCallback } from 'react';

import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';
import { PdfButton } from '@components/common/PdfButton';
import { ReportScreenHeader } from '@components/common/ReportScreenHeader';

import { colors } from '@theme/colors';

import { SearchIcon, UsersIcon } from '@constants/svgAssets';

import type {
  ClientBalanceComponentProps,
  ClientBalanceRow,
  ClientBalanceTab,
} from '../../../types/reports.types';
import { ClientBalanceRowCard } from './ClientBalanceRowCard';
import { Skeleton } from './Skeleton';
import { styles } from './styles';
import { TopBalanceBars } from './TopBalanceBars';

const TABS: { id: ClientBalanceTab; labelKey: string }[] = [
  { id: 'customers', labelKey: 'reports.clientBalance.tabs.customers' },
  { id: 'suppliers', labelKey: 'reports.clientBalance.tabs.suppliers' },
];

export const ClientBalanceReportComponent = ({
  rows,
  loading,
  tab,
  onTabChange,
  search,
  onSearchChange,
  onRowPress,
  onBack,
  onPdfPress,
  isPdfDownloading,
}: ClientBalanceComponentProps) => {
  const { t } = useTranslation();
  const total = rows.reduce((s, r) => s + r.balance, 0);
  const tone = tab === 'customers' ? 'credit' : 'debit';
  const chartColor = tab === 'customers' ? colors.success : colors.warning;

  const renderItem = useCallback(
    ({ item }: { item: ClientBalanceRow }) => (
      <ClientBalanceRowCard row={item} onPress={onRowPress} />
    ),
    [onRowPress],
  );

  const renderSeparator = useCallback(() => <View style={styles.gap} />, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ReportScreenHeader
        title={t('reports.clientBalance.title')}
        subtitle={t('reports.clientBalance.subtitle')}
        onBack={onBack}
        right={<PdfButton onPress={onPdfPress} isLoading={isPdfDownloading} />}
      />

      <View style={styles.summaryWrap}>
        <AppCard padding={14}>
          <Text style={styles.summaryLabel}>
            {tab === 'customers'
              ? t('reports.clientBalance.customersOweYou')
              : t('reports.clientBalance.youOweSuppliers')}
          </Text>
          <AppAmount value={total} tone={tone} size={22} />
          <Text style={styles.summarySub}>
            {t('reports.clientBalance.clientCount', { count: rows.length })}
          </Text>
        </AppCard>
      </View>

      <View style={styles.tabsWrap}>
        {TABS.map((tabConfig) => {
          const isActive = tab === tabConfig.id;
          return (
            <TouchableOpacity
              key={tabConfig.id}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              onPress={() => onTabChange(tabConfig.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                {t(tabConfig.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchWrap}>
        <SearchIcon size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('reports.clientBalance.searchPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <View style={styles.emptyWrap}>
          <UsersIcon size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>{t('reports.clientBalance.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.clientId)}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.chartWrap}>
              <AppCard padding={18}>
                <Text style={styles.chartTitle}>{t('reports.clientBalance.topByBalance')}</Text>
                <TopBalanceBars rows={rows} color={chartColor} />
              </AppCard>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
