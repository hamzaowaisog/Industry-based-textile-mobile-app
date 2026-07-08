import { useCallback } from 'react';

import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { formatAmount } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
} from '@constants/svgAssets';

import type {
  StockMoveListComponentProps,
  StockMoveListFilter,
  StockMoveRow,
} from '../../../types/stockMovements.types';
import { SkeletonRow } from './SkeletonRow';
import { StockMoveListSkeleton } from './StockMoveListSkeleton';
import { StockMoveRowCard } from './StockMoveRowCard';
import { styles } from './styles';

const FILTERS: { id: StockMoveListFilter; labelKey: string }[] = [
  { id: 'all', labelKey: 'common.all' },
  { id: 'in', labelKey: 'stockMovements.filters.in' },
  { id: 'out', labelKey: 'stockMovements.filters.out' },
  { id: 'adj', labelKey: 'stockMovements.filters.adjustments' },
];

const EmptyState = ({ onAddStockMove }: { onAddStockMove: () => void }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconBubble}>
        <BoxIcon size={58} color={colors.primary} />
        <View style={styles.emptyBadge}>
          <PlusIcon size={20} color={colors.surface} />
        </View>
      </View>
      <View style={styles.emptyTextWrap}>
        <Text style={styles.emptyTitle}>{t('stockMovements.empty.title')}</Text>
        <Text style={styles.emptySub}>{t('stockMovements.empty.subtitle')}</Text>
      </View>
      <TouchableOpacity style={styles.emptyCta} onPress={onAddStockMove} activeOpacity={0.8}>
        <PlusIcon size={18} color={colors.surface} />
        <Text style={styles.emptyCtaText}>{t('stockMovements.addStockMove')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const StockMoveListComponent = ({
  movements,
  totalIn,
  totalOut,
  totalInUnitLabel,
  totalOutUnitLabel,
  loading,
  refreshing,
  isFetchingNextPage,
  activeFilter,
  search,
  onSearchChange,
  onPress,
  onRefresh,
  onEndReached,
  onFilterChange,
  onAddStockMove,
  onMenuPress,
  onListPdfPress,
  isPdfDownloading,
}: StockMoveListComponentProps) => {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: StockMoveRow }) => <StockMoveRowCard movement={item} onPress={onPress} />,
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
        <Text style={styles.headerTitle}>{t('stockMovements.title')}</Text>
        <Text style={styles.headerSub}>{t('stockMovements.subtitle')}</Text>
      </View>

      {!loading && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardIn]}>
            <View style={styles.summaryLabelRow}>
              <ArrowDownIcon size={16} color={colors.success} />
              <Text style={[styles.summaryLabel, { color: colors.success }]}>
                {t('stockMovements.stockIn')}
              </Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatAmount(totalIn)}
              {totalInUnitLabel ? ` ${totalInUnitLabel}` : ''}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardOut]}>
            <View style={styles.summaryLabelRow}>
              <ArrowUpIcon size={16} color={colors.danger} />
              <Text style={[styles.summaryLabel, { color: colors.danger }]}>
                {t('stockMovements.stockOut')}
              </Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              {formatAmount(totalOut)}
              {totalOutUnitLabel ? ` ${totalOutUnitLabel}` : ''}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('stockMovements.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>
        <View style={styles.chipsRow}>
          {FILTERS.map((filter) => {
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
      </View>

      {loading ? (
        <StockMoveListSkeleton />
      ) : movements.length === 0 ? (
        <EmptyState onAddStockMove={onAddStockMove} />
      ) : (
        <FlatList
          data={movements}
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

      <TouchableOpacity style={styles.fab} onPress={onAddStockMove} activeOpacity={0.85}>
        <PlusIcon size={24} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
