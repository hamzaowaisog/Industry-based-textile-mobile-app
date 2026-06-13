import React from 'react';

import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  formatPKR,
  getInitials,
  resolveClientBalanceColor,
  resolveClientBalanceDirection,
} from '@utils/helpers/clientMappers';
import { CUSTOMER_TABS, SUPPLIER_TABS } from '@utils/helpers/clientDetailContent';

import { colors } from '@theme/colors';

import {
  ArrowLeftIcon,
  CoinsIcon,
  CreditCardIcon,
  EditIcon,
  FileTextIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  WalletIcon,
  WeavePattern,
} from '@constants/svgAssets';
import { AppConstants } from '@constants/appConstants';

import type { ClientDetailComponentProps } from '../../../types/clients.types';
import { InvoiceTabRow } from './InvoiceTabRow';
import { OrderTabRow } from './OrderTabRow';
import { PaymentTabRow } from './PaymentTabRow';
import { PurchaseTabRow } from './PurchaseTabRow';
import { SkeletonDetail } from './SkeletonDetail';
import { TransactionTabRow } from './TransactionTabRow';
import { styles } from './styles';

export const ClientDetailComponent = ({
  client,
  loading,
  refreshing,
  tab,
  onTabChange,
  onRefresh,
  onBack,
  onEdit,
  onPrimaryAction,
  onSecondaryAction,
}: ClientDetailComponentProps) => {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const tabContentMaxHeight = Math.max(240, windowHeight * 0.4);

  if (loading || !client) return <SkeletonDetail />;

  const isSupplier = client.clientTypeId === AppConstants.CLIENT_TYPE.SUPPLIER;
  const initials = getInitials(client.clientName);
  const balanceDirection = resolveClientBalanceDirection(
    client.clientTypeId,
    client.outstanding,
  );
  const balanceColor = resolveClientBalanceColor(balanceDirection);
  const balanceSub =
    balanceDirection === 'settled'
      ? t('clients.settled')
      : balanceDirection === 'receivable'
        ? t('clients.balanceReceivable')
        : t('clients.balancePayable');

  const tabs = isSupplier ? SUPPLIER_TABS : CUSTOMER_TABS;

  const renderTabContent = () => {
    let rows: React.ReactNode[] = [];
    switch (tab) {
      case 'orders':
        rows = (client.orders ?? []).map((o) => <OrderTabRow key={o.orderId} item={o} />);
        break;
      case 'purchases':
        rows = (client.purchases ?? []).map((p) => <PurchaseTabRow key={p.purchaseId} item={p} />);
        break;
      case 'payments':
        rows = (client.payments ?? []).map((p) => <PaymentTabRow key={p.paymentId} item={p} />);
        break;
      case 'invoices':
        rows = (client.invoices ?? []).map((inv) => (
          <InvoiceTabRow key={inv.invoiceId} item={inv} />
        ));
        break;
      case 'transactions':
        rows = (client.recentTransactions ?? []).map((tx) => (
          <TransactionTabRow key={tx.transactionId} item={tx} />
        ));
        break;
    }
    if (rows.length === 0) {
      return (
        <View style={styles.tabEmpty}>
          <Text style={styles.tabEmptyText}>{t('common.noData')}</Text>
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <WeavePattern />
          <View style={styles.headerNav}>
            <TouchableOpacity style={styles.headerBackBtn} onPress={onBack} activeOpacity={0.7}>
              <ArrowLeftIcon size={22} color={colors.surface} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerActionBtn} onPress={onEdit} activeOpacity={0.7}>
                <EditIcon size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerIdentity}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName}>{client.clientName}</Text>
              <View style={styles.headerBadgeRow}>
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{client.clientTypeName}</Text>
                </View>
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{t('clients.active')}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.balanceCardWrap}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>{t('clients.outstandingBalance')}</Text>
            <Text style={[styles.balanceAmount, { color: balanceColor }]}>
              {formatPKR(client.balance)}
            </Text>
            <Text style={[styles.balanceSub, { color: balanceColor }]}>{balanceSub}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={onPrimaryAction}
                activeOpacity={0.8}
              >
                <CreditCardIcon size={16} color={colors.surface} />
                <Text style={styles.actionBtnText}>
                  {isSupplier ? t('clients.paySupplier') : t('clients.receivePayment')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnGhost}
                onPress={onSecondaryAction}
                activeOpacity={0.8}
              >
                <PlusIcon size={16} color={colors.text} />
                <Text style={styles.actionBtnGhostText}>
                  {isSupplier ? t('clients.newPurchase') : t('clients.newOrder')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statRow}>
              {!isSupplier && (
                <View style={styles.statChip}>
                  <Text style={styles.statChipLabel}>{t('clients.statsOrders')}</Text>
                  <Text style={styles.statChipValue}>
                    {client.totalOrderCount} · {formatPKR(client.totalOrderAmount)}
                  </Text>
                </View>
              )}
              {isSupplier && (
                <View style={styles.statChip}>
                  <Text style={styles.statChipLabel}>{t('clients.statsPurchases')}</Text>
                  <Text style={styles.statChipValue}>
                    {client.totalPurchaseCount} · {formatPKR(client.totalPurchaseAmount)}
                  </Text>
                </View>
              )}
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>{t('clients.statsPaymentsIn')}</Text>
                <Text style={styles.statChipValue}>{formatPKR(client.totalPaymentsIn)}</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>{t('clients.statsPaymentsOut')}</Text>
                <Text style={styles.statChipValue}>{formatPKR(client.totalPaymentsOut)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>{t('clients.contactSection')}</Text>
          <View style={styles.infoCard}>
            {[
              {
                icon: <PhoneIcon size={18} color={colors.primary} />,
                key: t('clients.phone'),
                val: client.phone ?? '—',
              },
              {
                icon: <MapPinIcon size={18} color={colors.primary} />,
                key: t('clients.address'),
                val: client.address ?? '—',
              },
              {
                icon: <WalletIcon size={18} color={colors.primary} />,
                key: t('clients.creditLimit'),
                val: client.creditLimit != null ? formatPKR(client.creditLimit) : '—',
              },
              {
                icon: <CoinsIcon size={18} color={colors.primary} />,
                key: t('clients.openingBalance'),
                val: client.openingBalance != null ? formatPKR(client.openingBalance) : '—',
              },
              ...(client.notes
                ? [
                    {
                      icon: <FileTextIcon size={18} color={colors.primary} />,
                      key: t('clients.notes'),
                      val: client.notes,
                    },
                  ]
                : []),
            ].map((row, i, arr) => (
              <View key={i}>
                <View style={styles.infoRow}>
                  <View style={[styles.iconTile, { backgroundColor: colors.primaryLight }]}>
                    {row.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoKey}>{row.key}</Text>
                    <Text style={styles.infoVal}>{row.val}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={styles.infoDivider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tabsWrap}>
          <View style={styles.tabBar}>
            {tabs.map((tb) => (
              <TouchableOpacity
                key={tb.id}
                style={[styles.tabBtn, tab === tb.id && styles.tabBtnActive]}
                onPress={() => onTabChange(tb.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, tab === tb.id && styles.tabTextActive]}>
                  {t(tb.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView
            style={[styles.tabContentScroll, { maxHeight: tabContentMaxHeight }]}
            contentContainerStyle={styles.tabContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {renderTabContent()}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
