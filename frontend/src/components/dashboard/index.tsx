import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppStatCard } from '@components/common/AppStatCard';

import { QUICK_ACTION_CONFIGS, getStatCardConfigs } from '@utils/helpers/dashboardContent';
import { computeRevenueTrend } from '@utils/helpers/dashboardMappers';
import { formatCompactNumber as fmt } from '@utils/helpers/formatNumber';
import { getGreetingKey } from '@utils/helpers/greetingHelpers';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { BellIcon, MenuIcon, ShoppingBagIcon, TruckIcon } from '@constants/svgAssets';

import type { DashboardComponentProps } from '../../types/dashboard.types';
import { BarChart } from './BarChart';
import { CalendarToggle } from './CalendarToggle';
import { DashboardSkeleton } from './DashboardSkeleton';
import { FinancialCell } from './FinancialCell';
import { OrderRow } from './OrderRow';
import { PurchaseRow } from './PurchaseRow';
import { styles } from './styles';

export const DashboardComponent = ({
  isLoading,
  summary,
  monthlyOverview,
  calendar,
  onCalendarChange,
  userName,
  onOpenDrawer,
  onNewOrder,
  onViewAllOrders,
  onViewAllPurchases,
  unreadCount,
  onBell,
  onSeeAll,
}: DashboardComponentProps) => {
  const { t } = useTranslation();

  const today = new Date().toLocaleDateString(AppConstants.LOCALE.DATE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const greetingKey = getGreetingKey();
  const revenueTrend = summary
    ? computeRevenueTrend(summary.thisMonthRevenue, summary.lastMonthRevenue)
    : null;
  const statCards = summary ? getStatCardConfigs(summary, t) : [];
  const quickActionCallbacks = [onNewOrder, () => {}, () => {}, () => {}];

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.hamburger}
            onPress={onOpenDrawer}
            activeOpacity={0.7}
            hitSlop={10}
          >
            <MenuIcon size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.greetingBlock}>
            <Text style={styles.greetingDate}>{today}</Text>
            <Text style={styles.hijriDateText}>{summary?.todayHijri}</Text>
            <Text style={styles.greetingName} numberOfLines={2}>
              {t(greetingKey)}, {userName}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onBell}
              activeOpacity={0.7}
              hitSlop={10}
            >
              <BellIcon size={20} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{badgeLabel}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {isLoading && <DashboardSkeleton />}

      {!isLoading && !summary && (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{t('dashboard.loadError')}</Text>
          <Text style={styles.errorSub}>{t('dashboard.loadErrorSub')}</Text>
        </View>
      )}

      {!isLoading && summary && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statScrollContent}
          >
            {statCards.map((card) => (
              <AppStatCard
                key={card.label}
                tint={card.tint}
                Icon={card.Icon as any}
                label={card.label}
                value={card.value}
                sub={card.sub}
              />
            ))}
          </ScrollView>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('dashboard.thisMonthFinancials')}</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.financialsGrid}>
                <View style={styles.financialsRow}>
                  <FinancialCell
                    label={t('dashboard.finRevenue')}
                    value={`${AppConstants.CURRENCY.PREFIX}${fmt(summary.thisMonthRevenue)}`}
                    borderRight
                    borderBottom
                    trend={revenueTrend}
                    trendVsLabel={t('dashboard.vsLastMonth')}
                  />
                  <FinancialCell
                    label={t('dashboard.finLastMonth')}
                    value={`${AppConstants.CURRENCY.PREFIX}${fmt(summary.lastMonthRevenue)}`}
                    borderBottom
                    padLeft
                  />
                </View>
                <View style={styles.financialsRow}>
                  <FinancialCell
                    label={t('dashboard.finPurchases')}
                    value={`${AppConstants.CURRENCY.PREFIX}${fmt(summary.thisMonthPurchases)}`}
                    borderRight
                    padTop
                  />
                  <FinancialCell
                    label={t('dashboard.finExpenses')}
                    value={`${AppConstants.CURRENCY.PREFIX}${fmt(summary.thisMonthExpenses)}`}
                    padLeft
                    padTop
                  />
                </View>
                <View
                  style={[
                    styles.financialNetProfitRow,
                    {
                      backgroundColor:
                        summary.thisMonthNetProfit >= 0
                          ? `${colors.success}15`
                          : `${colors.danger}15`,
                    },
                  ]}
                >
                  <Text style={styles.financialNetProfitLabel}>{t('dashboard.finNetProfit')}</Text>
                  <Text
                    style={[
                      styles.financialNetProfitValue,
                      { color: summary.thisMonthNetProfit >= 0 ? colors.success : colors.danger },
                    ]}
                  >
                    {AppConstants.CURRENCY.PREFIX}
                    {fmt(summary.thisMonthNetProfit)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('dashboard.monthlyOverview')}</Text>
              <CalendarToggle calendar={calendar} onChange={onCalendarChange} />
            </View>
            <View style={styles.card}>
              {monthlyOverview.length > 0 ? (
                <BarChart data={monthlyOverview} />
              ) : (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>{t('dashboard.noMonthlyData')}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
              <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} hitSlop={10}>
                <Text style={styles.sectionAction}>{t('dashboard.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.quickGrid}>
              {QUICK_ACTION_CONFIGS.map((cfg, i) => (
                <TouchableOpacity
                  key={cfg.labelKey}
                  style={styles.quickBtn}
                  onPress={quickActionCallbacks[i]}
                  activeOpacity={0.7}
                  hitSlop={10}
                >
                  <View style={[styles.quickActionTile, { backgroundColor: `${cfg.color}22` }]}>
                    <cfg.Icon size={18} color={cfg.color} />
                  </View>
                  <Text style={styles.quickLabel}>{t(cfg.labelKey)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('dashboard.recentOrders')}</Text>
              <TouchableOpacity onPress={onViewAllOrders} activeOpacity={0.7} hitSlop={10}>
                <Text style={styles.sectionAction}>{t('dashboard.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {summary.recentOrders.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <ShoppingBagIcon size={28} color={colors.divider} />
                  <Text style={styles.emptyText}>{t('dashboard.noRecentOrders')}</Text>
                </View>
              ) : (
                summary.recentOrders
                  .slice(0, AppConstants.DASHBOARD.RECENT_ITEMS)
                  .map((order, i, arr) => (
                    <OrderRow key={order.orderId} order={order} isLast={i === arr.length - 1} />
                  ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('dashboard.recentPurchases')}</Text>
              <TouchableOpacity onPress={onViewAllPurchases} activeOpacity={0.7} hitSlop={10}>
                <Text style={styles.sectionAction}>{t('dashboard.viewAllPurchases')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {summary.recentPurchases.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <TruckIcon size={28} color={colors.divider} />
                  <Text style={styles.emptyText}>{t('dashboard.noRecentPurchases')}</Text>
                </View>
              ) : (
                summary.recentPurchases
                  .slice(0, AppConstants.DASHBOARD.RECENT_ITEMS)
                  .map((purchase, i, arr) => (
                    <PurchaseRow
                      key={purchase.purchaseId}
                      purchase={purchase}
                      isLast={i === arr.length - 1}
                    />
                  ))
              )}
            </View>
          </View>
        </ScrollView>
      )}

      <SafeAreaView edges={['bottom']} />
    </View>
  );
};
