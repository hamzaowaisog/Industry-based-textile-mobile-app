import { useCallback } from 'react';

import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { TRANS_CATEGORY_FILTERS } from '@utils/helpers/transactionsContent';

import { colors } from '@theme/colors';

import { MenuIcon, SearchIcon, WalletIcon } from '@constants/svgAssets';

import type {
  TransactionListComponentProps,
  TransactionListFilter,
  TransactionRow,
} from '../../../types/transactions.types';
import { NetSummaryCard } from './NetSummaryCard';
import { TransactionListSkeleton } from './TransactionListSkeleton';
import { TransactionRowCard } from './TransactionRowCard';
import { styles } from './styles';

const TYPE_FILTERS: { id: TransactionListFilter; labelKey: string }[] = [
  { id: 'all', labelKey: 'common.all' },
  { id: 'credit', labelKey: 'transactions.filters.credit' },
  { id: 'debit', labelKey: 'transactions.filters.debit' },
];

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconBubble}>
        <WalletIcon size={58} color={colors.primary} />
      </View>
      <View style={styles.emptyTextWrap}>
        <Text style={styles.emptyTitle}>{t('transactions.empty.title')}</Text>
        <Text style={styles.emptySub}>{t('transactions.empty.subtitle')}</Text>
      </View>
    </View>
  );
};

export const TransactionListComponent = ({
  transactions,
  totalCredit,
  totalDebit,
  loading,
  refreshing,
  isFetchingNextPage,
  activeFilter,
  activeCategoryId,
  search,
  onSearchChange,
  onFilterChange,
  onCategoryChange,
  onPress,
  onRefresh,
  onEndReached,
  onMenuPress,
  onListPdfPress,
  isPdfDownloading,
}: TransactionListComponentProps) => {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: TransactionRow }) => (
      <TransactionRowCard transaction={item} onPress={onPress} />
    ),
    [onPress],
  );

  const renderSeparator = useCallback(() => <View style={styles.gap} />, []);

  const renderFooter = useCallback(
    () => (isFetchingNextPage ? <TransactionListSkeleton /> : null),
    [isFetchingNextPage],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onMenuPress} activeOpacity={0.7}>
            <MenuIcon size={23} color={colors.text} />
          </TouchableOpacity>
          <PdfButton
            onPress={onListPdfPress}
            isLoading={isPdfDownloading}
            size={20}
            color={colors.textSecondary}
          />
        </View>
        <Text style={styles.headerTitle}>{t('transactions.title')}</Text>
        <Text style={styles.headerSub}>{t('transactions.subtitle')}</Text>
      </View>

      {!loading && (
        <View style={styles.netCardWrap}>
          <NetSummaryCard totalCredit={totalCredit} totalDebit={totalDebit} />
        </View>
      )}

      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('transactions.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>
        <View style={styles.chipsRow}>
          {TYPE_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => onFilterChange(filter.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {t(filter.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {TRANS_CATEGORY_FILTERS.map((filter) => {
            const isActive = activeCategoryId === filter.id;
            return (
              <TouchableOpacity
                key={filter.id ?? 'all'}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => onCategoryChange(filter.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {t(filter.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <TransactionListSkeleton />
      ) : transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={renderSeparator}
          ListFooterComponent={renderFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};
