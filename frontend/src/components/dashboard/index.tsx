import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuIcon } from '@constants/svgAssets';
import { formatCompactNumber as fmt } from '@utils/helpers/formatNumber';

import type { DashboardComponentProps } from '../../types/dashboard.types';
import { styles } from './styles';

export const DashboardComponent = ({
  isOnline,
  isLoading,
  summary,
  monthlyOverview,
  onLogout,
  onOpenDrawer,
}: DashboardComponentProps) => {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SafeAreaView edges={['top', 'bottom']}>
        {/* Header + Online indicator */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onOpenDrawer} activeOpacity={0.7} style={styles.hamburger}>
              <MenuIcon />
            </TouchableOpacity>
            <Text style={styles.title}>{t('dashboard.title')}</Text>
          </View>
          <View style={styles.onlineRow}>
            <View style={[styles.onlineDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={[styles.onlineText, !isOnline && styles.onlineTextOffline]}>
              {isOnline ? t('dashboard.online') : t('dashboard.offline')}
            </Text>
          </View>
        </View>

        {/* Loading */}
        {isLoading && <ActivityIndicator size="large" style={styles.loader} />}

        {summary && !isLoading && (
          <>
            {/* Financials */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('dashboard.summary')}</Text>
              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{fmt(summary.thisMonthRevenue)}</Text>
                  <Text style={styles.statLabel}>{t('dashboard.totalSales')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{fmt(summary.lastMonthRevenue)}</Text>
                  <Text style={styles.statLabel}>{t('dashboard.lastMonthSales')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{fmt(summary.thisMonthPurchases)}</Text>
                  <Text style={styles.statLabel}>{t('dashboard.totalPurchases')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{fmt(summary.thisMonthExpenses)}</Text>
                  <Text style={styles.statLabel}>{t('dashboard.totalExpenses')}</Text>
                </View>
                <View style={[styles.statItem, styles.statHighlight]}>
                  <Text style={[styles.statValue, styles.profitValue]}>
                    {fmt(summary.thisMonthNetProfit)}
                  </Text>
                  <Text style={styles.statLabel}>{t('dashboard.netProfit')}</Text>
                </View>
                <View style={[styles.statItem, styles.statWarn]}>
                  <Text style={[styles.statValue, styles.warnValue]}>
                    {fmt(summary.totalOutstanding)}
                  </Text>
                  <Text style={styles.statLabel}>{t('dashboard.totalOutstanding')}</Text>
                </View>
              </View>
            </View>

            {/* Operations */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('dashboard.operations')}</Text>
              <View style={styles.opsGrid}>
                <Text style={styles.rowText}>
                  {t('dashboard.todayOrders', {
                    count: summary.todayOrdersCount,
                    total: fmt(summary.todayOrdersTotal),
                  })}
                </Text>
                <Text style={styles.rowText}>
                  {t('dashboard.pendingOrders', { count: summary.pendingOrdersCount })}
                </Text>
                <Text style={styles.rowText}>
                  {t('dashboard.unallocatedPayments', { count: summary.unallocatedPaymentsCount })}
                </Text>
              </View>
            </View>

            {/* Alerts */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('dashboard.alerts')}</Text>
              <View style={styles.opsGrid}>
                <View style={styles.alertRow}>
                  <View
                    style={[
                      styles.alertDot,
                      summary.lowStockCount > 0 ? styles.alertDotWarn : styles.alertDotOk,
                    ]}
                  />
                  <Text style={styles.rowText}>
                    {t('dashboard.lowStockCount', { count: summary.lowStockCount })}
                  </Text>
                </View>
                <View style={styles.alertRow}>
                  <View
                    style={[
                      styles.alertDot,
                      summary.overdueInvoicesCount > 0 ? styles.alertDotWarn : styles.alertDotOk,
                    ]}
                  />
                  <Text style={styles.rowText}>
                    {t('dashboard.overdueInvoices', { count: summary.overdueInvoicesCount })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Monthly Overview */}
            {monthlyOverview.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('dashboard.monthlyOverview')}</Text>
                {monthlyOverview.map((m) => (
                  <View key={m.month} style={styles.monthRow}>
                    <Text style={styles.monthLabel}>{m.month}</Text>
                    <Text style={styles.monthSales}>{fmt(m.totalSales)}</Text>
                    <Text style={styles.monthPurchases}>{fmt(m.totalPurchases)}</Text>
                    <Text style={[styles.monthProfit, m.netProfit < 0 && styles.monthLoss]}>
                      {fmt(m.netProfit)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Orders */}
            {summary.recentOrders.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('dashboard.recentOrders')}</Text>
                {summary.recentOrders.map((order) => (
                  <View key={order.orderId} style={styles.orderRow}>
                    <Text style={styles.orderClient}>{order.clientName}</Text>
                    <Text style={styles.orderMeta}>
                      #{order.orderId} · {fmt(order.total)} · {order.statusName}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
};
