import { useCallback } from 'react';

import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { PURCHASE_STATUS_TABS } from '@utils/helpers/purchaseContent';

import { colors } from '@theme/colors';

import { MenuIcon, PlusIcon, SearchIcon, TruckIcon } from '@constants/svgAssets';

import type { PurchaseListComponentProps, PurchaseRow } from '../../../types/purchases.types';
import { PurchaseCard } from './PurchaseCard';
import { PurchaseListSkeleton } from './PurchaseListSkeleton';
import { SkeletonRow } from './SkeletonRow';
import { styles } from './styles';

const EmptyState = ({
  onNewPurchase,
  t,
}: {
  onNewPurchase: () => void;
  t: (k: string) => string;
}) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconBubble}>
      <TruckIcon size={58} color={colors.primary} />
      <View style={styles.emptyBadge}>
        <PlusIcon size={20} color={colors.surface} />
      </View>
    </View>
    <View style={styles.emptyTextWrap}>
      <Text style={styles.emptyTitle}>{t('purchases.empty.title')}</Text>
      <Text style={styles.emptySub}>{t('purchases.empty.subtitle')}</Text>
    </View>
    <TouchableOpacity style={styles.emptyCta} onPress={onNewPurchase} activeOpacity={0.8}>
      <PlusIcon size={18} color={colors.surface} />
      <Text style={styles.emptyCtaText}>{t('purchases.newPurchase')}</Text>
    </TouchableOpacity>
  </View>
);

export const PurchaseListComponent = ({
  purchases,
  totalCount,
  loading,
  refreshing,
  isFetchingNextPage,
  activeTab,
  search,
  onTabChange,
  onPress,
  onRefresh,
  onEndReached,
  onSearchChange,
  onNewPurchase,
  onMenuPress,
  onListPdfPress,
  isPdfDownloading,
}: PurchaseListComponentProps) => {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: PurchaseRow }) => <PurchaseCard purchase={item} onPress={onPress} />,
    [onPress],
  );

  const renderSeparator = useCallback(() => <View style={styles.gap} />, []);

  const renderFooter = useCallback(
    () => (isFetchingNextPage ? <SkeletonRow /> : null),
    [isFetchingNextPage],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>{t('purchases.title')}</Text>
        <Text style={styles.headerSub}>
          {totalCount > 0
            ? t('purchases.totalCount', { count: totalCount })
            : t('purchases.empty.title')}
        </Text>
      </View>

      {/* Filter area */}
      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('purchases.tabs.all')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>

        <View style={styles.chipsRow}>
          {PURCHASE_STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                  numberOfLines={1}
                >
                  {t(tab.labelKey as any)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <PurchaseListSkeleton />
      ) : purchases.length === 0 && !search ? (
        <EmptyState onNewPurchase={onNewPurchase} t={t} />
      ) : purchases.length === 0 && search ? (
        <View style={styles.noResultsWrap}>
          <Text style={styles.noResultsTitle}>{t('common.noResults')}</Text>
          <Text style={styles.noResultsSub}>{t('common.noResultsSub', { query: search })}</Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
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

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onNewPurchase} activeOpacity={0.85}>
        <PlusIcon size={24} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
