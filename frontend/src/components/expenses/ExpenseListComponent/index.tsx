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

import { colors } from '@theme/colors';

import { MenuIcon, PlusIcon, ReceiptIcon, SearchIcon } from '@constants/svgAssets';

import type { ExpenseListComponentProps, ExpenseRow } from '../../../types/expenses.types';
import { ExpenseListSkeleton } from './ExpenseListSkeleton';
import { ExpenseRowCard } from './ExpenseRowCard';
import { ExpenseSummaryCard } from './ExpenseSummaryCard';
import { SkeletonRow } from './SkeletonRow';
import { styles } from './styles';

const EmptyState = ({
  onAddExpense,
  t,
}: {
  onAddExpense: () => void;
  t: (k: string, o?: object) => string;
}) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconBubble}>
      <ReceiptIcon size={58} color={colors.primary} />
      <View style={styles.emptyBadge}>
        <PlusIcon size={20} color={colors.surface} />
      </View>
    </View>
    <View style={styles.emptyTextWrap}>
      <Text style={styles.emptyTitle}>{t('expenses.empty.title')}</Text>
      <Text style={styles.emptySub}>{t('expenses.empty.subtitle')}</Text>
    </View>
    <TouchableOpacity style={styles.emptyCta} onPress={onAddExpense} activeOpacity={0.8}>
      <PlusIcon size={18} color={colors.surface} />
      <Text style={styles.emptyCtaText}>{t('expenses.addExpense')}</Text>
    </TouchableOpacity>
  </View>
);

export const ExpenseListComponent = ({
  expenses,
  totalCount,
  summary,
  summaryLoading,
  loading,
  refreshing,
  isFetchingNextPage,
  search,
  categories,
  activeCategory,
  onPress,
  onRefresh,
  onEndReached,
  onSearchChange,
  onCategoryChange,
  onAddExpense,
  onMenuPress,
  onListPdfPress,
  isPdfDownloading,
}: ExpenseListComponentProps) => {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: ExpenseRow }) => <ExpenseRowCard expense={item} onPress={onPress} />,
    [onPress],
  );

  const renderSeparator = useCallback(() => <View style={styles.gap} />, []);

  const renderFooter = useCallback(
    () => (isFetchingNextPage ? <SkeletonRow /> : null),
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
        <Text style={styles.headerTitle}>{t('expenses.title')}</Text>
        <Text style={styles.headerSub}>
          {totalCount > 0
            ? t('expenses.entriesCount', { count: totalCount })
            : t('expenses.subtitle')}
        </Text>
      </View>

      {!loading && totalCount > 0 && (
        <ExpenseSummaryCard summary={summary} loading={summaryLoading} />
      )}

      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('expenses.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsRow}
        >
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === 'all' && styles.categoryChipActive]}
            onPress={() => onCategoryChange('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === 'all' && styles.categoryChipTextActive,
              ]}
            >
              {t('common.all')}
            </Text>
          </TouchableOpacity>
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => onCategoryChange(category.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ExpenseListSkeleton />
      ) : expenses.length === 0 && !search ? (
        <EmptyState onAddExpense={onAddExpense} t={t} />
      ) : expenses.length === 0 && search ? (
        <View style={styles.noResultsWrap}>
          <Text style={styles.noResultsTitle}>{t('common.noResults')}</Text>
          <Text style={styles.noResultsSub}>{t('common.noResultsSub', { query: search })}</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={renderSeparator}
          ListFooterComponent={renderFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

      <TouchableOpacity style={styles.fab} onPress={onAddExpense} activeOpacity={0.85}>
        <PlusIcon size={24} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
