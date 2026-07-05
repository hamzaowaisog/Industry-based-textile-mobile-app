import { useCallback } from 'react';

import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { formatPKR } from '@utils/helpers/formatCurrency';
import { PAYMENT_DIRECTION_TABS } from '@utils/helpers/paymentContent';

import { colors } from '@theme/colors';

import { ArrowDownIcon, ArrowUpIcon, CreditCardIcon, MenuIcon, PlusIcon, SearchIcon } from '@constants/svgAssets';

import type { PaymentListComponentProps, PaymentRow } from '../../../types/payments.types';
import { PaymentCard } from './PaymentCard';
import { PaymentListSkeleton } from './PaymentListSkeleton';
import { SkeletonRow } from './SkeletonRow';
import { styles } from './styles';

const EmptyState = ({
  onRecordPayment,
  t,
}: {
  onRecordPayment: () => void;
  t: (k: string, o?: object) => string;
}) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconBubble}>
      <CreditCardIcon size={58} color={colors.primary} />
      <View style={styles.emptyBadge}>
        <PlusIcon size={20} color={colors.surface} />
      </View>
    </View>
    <View style={styles.emptyTextWrap}>
      <Text style={styles.emptyTitle}>{t('payments.empty.title')}</Text>
      <Text style={styles.emptySub}>{t('payments.empty.subtitle')}</Text>
    </View>
    <TouchableOpacity style={styles.emptyCta} onPress={onRecordPayment} activeOpacity={0.8}>
      <PlusIcon size={18} color={colors.surface} />
      <Text style={styles.emptyCtaText}>{t('payments.recordPayment')}</Text>
    </TouchableOpacity>
  </View>
);

export const PaymentListComponent = ({
  payments,
  totalCount,
  totalReceived,
  totalPaid,
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
  onRecordPayment,
  onMenuPress,
  onListPdfPress,
  isPdfDownloading,
}: PaymentListComponentProps) => {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: PaymentRow }) => <PaymentCard payment={item} onPress={onPress} />,
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
        <Text style={styles.headerTitle}>{t('payments.title')}</Text>
        <Text style={styles.headerSub}>
          {totalCount > 0
            ? t('payments.thisMonth', { count: totalCount })
            : t('payments.subtitle')}
        </Text>
      </View>

      {!loading && totalCount > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.successLight }]}>
            <View style={styles.summaryLabelRow}>
              <ArrowDownIcon size={16} color={colors.success} />
              <Text style={[styles.summaryLabel, { color: colors.success }]}>
                {t('payments.received').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.success }]}>
              {formatPKR(totalReceived)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.warningLight }]}>
            <View style={styles.summaryLabelRow}>
              <ArrowUpIcon size={16} color={colors.warning} />
              <Text style={[styles.summaryLabel, { color: colors.warning }]}>
                {t('payments.paidOut').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.summaryAmount, { color: colors.warning }]}>
              {formatPKR(totalPaid)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('payments.tabs.all')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>

        <View style={styles.chipsRow}>
          {PAYMENT_DIRECTION_TABS.map((tab) => {
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
        <PaymentListSkeleton />
      ) : payments.length === 0 && !search ? (
        <EmptyState onRecordPayment={onRecordPayment} t={t} />
      ) : payments.length === 0 && search ? (
        <View style={styles.noResultsWrap}>
          <Text style={styles.noResultsTitle}>{t('common.noResults')}</Text>
          <Text style={styles.noResultsSub}>{t('common.noResultsSub', { query: search })}</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
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

      <TouchableOpacity style={styles.fab} onPress={onRecordPayment} activeOpacity={0.85}>
        <PlusIcon size={24} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
