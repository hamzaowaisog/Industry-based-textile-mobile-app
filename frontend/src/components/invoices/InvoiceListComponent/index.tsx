import { useCallback } from 'react';

import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { formatPKR } from '@utils/helpers/formatCurrency';
import { INVOICE_STATUS_TABS } from '@utils/helpers/invoiceContent';

import { colors } from '@theme/colors';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  FileTextIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
} from '@constants/svgAssets';

import type { InvoiceListComponentProps, InvoiceRow } from '../../../types/invoices.types';
import { InvoiceCard } from './InvoiceCard';
import { InvoiceListSkeleton } from './InvoiceListSkeleton';
import { SkeletonRow } from './SkeletonRow';
import { styles } from './styles';

const EmptyState = ({
  // onCreateInvoice,
  t,
}: {
  // onCreateInvoice: () => void;
  t: (k: string, o?: object) => string;
}) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconBubble}>
      <FileTextIcon size={58} color={colors.primary} />
      <View style={styles.emptyBadge}>
        <PlusIcon size={20} color={colors.surface} />
      </View>
    </View>
    <View style={styles.emptyTextWrap}>
      <Text style={styles.emptyTitle}>{t('invoices.empty.title')}</Text>
      <Text style={styles.emptySub}>{t('invoices.empty.subtitle')}</Text>
    </View>
    {/* Manual invoice creation is disabled — standalone invoices can't be marked Paid yet.
    <TouchableOpacity style={styles.emptyCta} onPress={onCreateInvoice} activeOpacity={0.8}>
      <PlusIcon size={18} color={colors.surface} />
      <Text style={styles.emptyCtaText}>{t('invoices.createInvoice')}</Text>
    </TouchableOpacity>
    */}
  </View>
);

export const InvoiceListComponent = ({
  invoices,
  totalCount,
  totalReceivable,
  totalPayable,
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
  // onCreateInvoice,
  onMenuPress,
  onListPdfPress,
  isPdfDownloading,
  onViewPdf,
  onSharePdf,
  activePdfId,
  activeAction,
}: InvoiceListComponentProps) => {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: InvoiceRow }) => (
      <InvoiceCard
        invoice={item}
        onPress={onPress}
        onViewPdf={onViewPdf}
        onSharePdf={onSharePdf}
        isViewing={activePdfId === item.id && activeAction === 'view'}
        isSharing={activePdfId === item.id && activeAction === 'share'}
      />
    ),
    [onPress, onViewPdf, onSharePdf, activePdfId, activeAction],
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
        <Text style={styles.headerTitle}>{t('invoices.title')}</Text>
        <Text style={styles.headerSub}>
          {totalCount > 0 ? t('invoices.thisMonth', { count: totalCount }) : t('invoices.subtitle')}
        </Text>
      </View>

      {!loading && totalCount > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.successLight }]}>
            <View style={styles.summaryLabelRow}>
              <ArrowDownIcon size={16} color={colors.success} />
              <Text style={[styles.summaryLabel, { color: colors.success }]}>
                {t('invoices.received').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.success }]}>
              {formatPKR(totalReceivable)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.warningLight }]}>
            <View style={styles.summaryLabelRow}>
              <ArrowUpIcon size={16} color={colors.warning} />
              <Text style={[styles.summaryLabel, { color: colors.warning }]}>
                {t('invoices.paidOut').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.warning }]}>
              {formatPKR(totalPayable)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('invoices.title')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>

        <View style={styles.chipsRow}>
          {INVOICE_STATUS_TABS.map((tab) => {
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
                  {t(tab.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <InvoiceListSkeleton />
      ) : invoices.length === 0 && !search ? (
        <EmptyState t={t} />
      ) : invoices.length === 0 && search ? (
        <View style={styles.noResultsWrap}>
          <Text style={styles.noResultsTitle}>{t('common.noResults')}</Text>
          <Text style={styles.noResultsSub}>{t('common.noResultsSub', { query: search })}</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
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

      {/* Manual invoice creation is disabled — standalone invoices can't be marked Paid yet.
      <TouchableOpacity style={styles.fab} onPress={onCreateInvoice} activeOpacity={0.85}>
        <PlusIcon size={24} color={colors.surface} />
      </TouchableOpacity>
      */}
    </SafeAreaView>
  );
};
