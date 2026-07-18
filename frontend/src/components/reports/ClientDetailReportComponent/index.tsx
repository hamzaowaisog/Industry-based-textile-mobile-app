import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAmount } from '@components/common/AppAmount';
import { AppAvatar } from '@components/common/AppAvatar';
import { AppCard } from '@components/common/AppCard';
import { AppSelectModal } from '@components/common/AppSelectModal';
import { AppStatCard } from '@components/common/AppStatCard';
import { PdfButton } from '@components/common/PdfButton';
import { ReportScreenHeader } from '@components/common/ReportScreenHeader';

import { formatPKR } from '@utils/helpers/formatCurrency';
import { CLIENT_DETAIL_TABS } from '@utils/helpers/reportsContent';
import { getInitials } from '@utils/helpers/textHelpers';

import { colors } from '@theme/colors';

import { CreditCardIcon, ShoppingBagIcon, TruckIcon, UsersIcon } from '@constants/svgAssets';

import type { ClientDetailReportComponentProps } from '../../../types/reports.types';
import { BalanceTrendChart } from './BalanceTrendChart';
import { ClientDetailTabContent } from './ClientDetailTabContent';
import { Skeleton } from './Skeleton';
import { styles } from './styles';

const CLIENT_TYPE_CUSTOMER = 'Customer';

export const ClientDetailReportComponent = ({
  detail,
  loading,
  clientItems,
  pickerVisible,
  tab,
  onOpenPicker,
  onClosePicker,
  onClientPicked,
  onTabChange,
  onBack,
  onPdfPress,
  isPdfDownloading,
}: ClientDetailReportComponentProps) => {
  const { t } = useTranslation();
  const isCustomer = detail?.clientTypeName === CLIENT_TYPE_CUSTOMER;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ReportScreenHeader
        title={t('reports.clientDetail.title')}
        subtitle={detail?.clientName}
        onBack={onBack}
        right={detail ? <PdfButton onPress={onPdfPress} isLoading={isPdfDownloading} /> : undefined}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Skeleton />
        ) : !detail ? (
          <View style={styles.emptyWrap}>
            <UsersIcon size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>{t('reports.clientDetail.pickClient')}</Text>
            <TouchableOpacity style={styles.pickBtn} onPress={onOpenPicker} activeOpacity={0.75}>
              <Text style={styles.pickBtnText}>{t('reports.clientDetail.selectClient')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.clientCardWrap}>
              <AppCard padding={14}>
                <View style={styles.clientRow}>
                  <AppAvatar
                    label={getInitials(detail.clientName)}
                    color={isCustomer ? colors.success : colors.warning}
                    size={44}
                  />
                  <View style={styles.clientTextWrap}>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {detail.clientName}
                    </Text>
                    <Text style={styles.clientType}>{detail.clientTypeName}</Text>
                  </View>
                  <TouchableOpacity style={styles.changeBtn} onPress={onOpenPicker} activeOpacity={0.75}>
                    <Text style={styles.changeBtnText}>{t('reports.clientDetail.change')}</Text>
                  </TouchableOpacity>
                </View>
              </AppCard>
            </View>

            <View style={styles.heroWrap}>
              <AppCard padding={20}>
                <Text style={styles.heroLabel}>{t('reports.clientDetail.currentBalance')}</Text>
                <AppAmount value={detail.balance} tone={isCustomer ? 'debit' : 'credit'} size={30} />
                <Text style={styles.heroSub}>
                  {isCustomer
                    ? t('reports.clientDetail.owesYou')
                    : t('reports.clientDetail.youOweThem')}
                </Text>
              </AppCard>
            </View>

            <BalanceTrendChart points={detail.balanceHistory} />

            <View style={styles.statsGrid}>
              <AppStatCard
                style={styles.statCard}
                Icon={ShoppingBagIcon}
                tint={colors.primary}
                label={t('reports.clientDetail.totalOrders')}
                value={String(detail.totalOrderCount)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={TruckIcon}
                tint={colors.warning}
                label={t('reports.clientDetail.totalPurchases')}
                value={String(detail.totalPurchaseCount)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={CreditCardIcon}
                tint={colors.success}
                label={t('reports.clientDetail.paymentsIn')}
                value={formatPKR(detail.totalPaymentsIn)}
              />
              <AppStatCard
                style={styles.statCard}
                Icon={CreditCardIcon}
                tint={colors.danger}
                label={t('reports.clientDetail.paymentsOut')}
                value={formatPKR(detail.totalPaymentsOut)}
              />
            </View>

            <View style={styles.tabsRow}>
              {CLIENT_DETAIL_TABS.map((tabConfig) => {
                const isActive = tab === tabConfig.id;
                return (
                  <TouchableOpacity
                    key={tabConfig.id}
                    style={styles.tabBtn}
                    onPress={() => onTabChange(tabConfig.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                      {t(tabConfig.labelKey)}
                    </Text>
                    {isActive && <View style={styles.tabIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <ClientDetailTabContent tab={tab} detail={detail} />
          </>
        )}
      </ScrollView>

      <AppSelectModal
        visible={pickerVisible}
        title={t('reports.clientDetail.selectClient')}
        items={clientItems}
        selectedId={detail?.clientId}
        onSelect={(id) => onClientPicked(id)}
        onClose={onClosePicker}
        searchPlaceholder={t('reports.clientDetail.searchPlaceholder')}
      />
    </SafeAreaView>
  );
};
