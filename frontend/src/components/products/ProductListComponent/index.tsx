import React, { useCallback } from 'react';

import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { PRODUCT_STOCK_TABS } from '@utils/helpers/productContent';

import { colors } from '@theme/colors';

import { MenuIcon, PlusIcon, SearchIcon } from '@constants/svgAssets';

import type { ProductListComponentProps, ProductRow } from '../../../types/products.types';
import { EmptyState } from './EmptyState';
import { ProductCard } from './ProductCard';
import { ProductListSkeleton } from './ProductListSkeleton';
import { SkeletonRow } from './SkeletonRow';
import { styles } from './styles';

export const ProductListComponent = ({
  products,
  totalCount,
  loading,
  refreshing,
  isFetchingNextPage,
  activeTab,
  search,
  tabCounts,
  onTabChange,
  onPress,
  onRefresh,
  onEndReached,
  onSearchChange,
  onNewProduct,
  onMenuPress,
  onListPdfPress,
  isPdfDownloading,
}: ProductListComponentProps & { tabCounts: { all: number; low: number; out: number } }) => {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: ProductRow }) => <ProductCard product={item} onPress={onPress} />,
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
        <Text style={styles.headerTitle}>{t('products.title')}</Text>
        <Text style={styles.headerSub}>
          {totalCount > 0 ? t('products.skuCount', { count: totalCount }) : t('products.noSkus')}
        </Text>
      </View>

      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('products.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>

        <View style={styles.chipsRow}>
          {PRODUCT_STOCK_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id];
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
                  {t(tab.labelKey)}
                  {count > 0 ? ` ${count}` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.skeletonWrap}>
          <ProductListSkeleton />
        </View>
      ) : products.length === 0 && !search ? (
        <EmptyState onNewProduct={onNewProduct} />
      ) : products.length === 0 ? (
        <View style={styles.noResultsWrap}>
          <Text style={styles.noResultsTitle}>{t('common.noResults')}</Text>
          <Text style={styles.noResultsSub}>{t('common.noResultsSub', { query: search })}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
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

      <TouchableOpacity style={styles.fab} onPress={onNewProduct} activeOpacity={0.85}>
        <PlusIcon size={24} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
