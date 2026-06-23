import React from 'react';

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomBar } from '@components/common/AppBottomBar';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';
import { AppStepIndicator } from '@components/common/AppStepIndicator';

import { formatPKR } from '@utils/helpers/formatCurrency';
import {
  ORDER_PROGRESS_STEPS,
  ORDER_STATUS_ICONS,
  ORDER_STATUS_TO_STEP,
  getOrderStatusConfig,
} from '@utils/helpers/orderContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import {
  AlertIcon,
  ArrowLeftIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  UserIcon,
} from '@constants/svgAssets';

import type { OrderDetailComponentProps } from '../../../types/orders.types';
import { OrderDetailSkeleton } from './OrderDetailSkeleton';
import { OrderLineItem } from './OrderLineItem';
import { styles } from './styles';

const renderStatusIcon = (statusId: number, color: string, size: number): React.ReactNode => {
  const Icon = ORDER_STATUS_ICONS[statusId];
  return Icon ? <Icon size={size} color={color} /> : null;
};

export const OrderDetailComponent = ({
  order,
  loading,
  submitting,
  canUpdate,
  canDelete,
  onBack,
  onClientPress,
  onMarkInProgress,
  onMarkDelivered,
  onCancelOrder,
  onRecordPayment,
  onEditOrder,
  onDelete,
}: OrderDetailComponentProps) => {
  const { t } = useTranslation();

  const isPending = order?.statusId === AppConstants.ORDER_STATUS.PENDING;
  const isCancelled = order?.statusId === AppConstants.ORDER_STATUS.CANCELLED;
  const isActive = !isCancelled && order?.statusId !== AppConstants.ORDER_STATUS.DELIVERED;

  const canMarkInProgress = canUpdate && isPending;
  const canMarkDelivered = canUpdate && isActive && !isPending;
  const canEditLines = canUpdate && isActive;
  const canCancel = canUpdate && !isCancelled;

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.errorHeader}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack}>
            <ArrowLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{t('orders.error.title')}</Text>
          <Text style={styles.emptySub}>{t('orders.error.subtitle')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = getOrderStatusConfig(order.statusId);
  const subtotal = order.orderLines.reduce((sum, l) => sum + (l.qty ?? 0) * (l.unitPrice ?? 0), 0);
  const currentStep = ORDER_STATUS_TO_STEP[order.statusId] ?? 0;

  return (
    <View style={styles.root}>
      {/* Top edge only — hero color fills the status bar safe area */}
      <SafeAreaView style={{ backgroundColor: config.bg }} edges={['top']}>
        <View style={styles.heroNav}>
          <TouchableOpacity style={styles.heroNavBtn} onPress={onBack} activeOpacity={0.75}>
            <ArrowLeftIcon size={20} color={config.fg} />
          </TouchableOpacity>
          {(canEditLines || canDelete) && (
            <View style={styles.heroNavActions}>
              {canEditLines && (
                <TouchableOpacity
                  style={[styles.heroNavBtn, submitting && styles.btnDisabled]}
                  onPress={() => onEditOrder(order.id)}
                  activeOpacity={0.75}
                  disabled={submitting}
                >
                  <EditIcon size={20} color={config.fg} />
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity
                  style={[styles.heroDeleteBtn, submitting && styles.btnDisabled]}
                  onPress={onDelete}
                  activeOpacity={0.75}
                  disabled={submitting}
                >
                  <TrashIcon size={20} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero body — colored, scrolls away */}
        <View style={[styles.heroBody, { backgroundColor: config.bg }]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroOrderId}>{`ORD-${order.id}`}</Text>
            <View style={styles.statusPill}>
              {renderStatusIcon(order.statusId, config.fg, 13)}
              <Text style={[styles.statusPillText, { color: config.fg }]}>{order.statusName}</Text>
            </View>
          </View>
          <Text style={styles.heroClientName} numberOfLines={1}>
            {order.clientName}
          </Text>
          <Text style={styles.heroAmount}>{formatPKR(subtotal)}</Text>
          <Text style={styles.heroAmountLabel}>{t('orders.detail.totalAmount')}</Text>
        </View>

        {/* Floating stat cards — overlap hero bottom via negative margin */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('orders.detail.subtotal')}</Text>
            <Text style={styles.statValue}>{formatPKR(subtotal)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('orders.detail.amountPaid')}</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {formatPKR(order.amountPaid)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('orders.detail.outstanding')}</Text>
            <Text
              style={[
                styles.statValue,
                { color: order.outstanding > 0 ? colors.danger : colors.success },
              ]}
            >
              {formatPKR(order.outstanding)}
            </Text>
          </View>
        </View>

        {/* Progress track or cancelled state */}
        <View style={styles.progressSection}>
          {isCancelled ? (
            <View style={styles.cancelledBanner}>
              <AlertIcon size={16} color={colors.danger} />
              <Text style={styles.cancelledText}>{t('orders.detail.cancelledMsg')}</Text>
            </View>
          ) : (
            <AppStepIndicator
              steps={ORDER_PROGRESS_STEPS.map((step) => t(step.labelKey as any))}
              current={currentStep}
            />
          )}
        </View>

        {/* Client + dates card */}
        <View style={styles.section}>
          <AppCard padding={0}>
            <View style={styles.clientRowWrap}>
              <AppRow
                leading={<AppIconTile Icon={UserIcon} color={colors.primary} size={40} />}
                primary={order.clientName}
                secondary={order.paymentTypeName}
                onPress={() => onClientPress(order.clientId)}
                chevron={false}
              />
            </View>
            <View style={styles.dateGrid}>
              <View style={styles.dateCell}>
                <Text style={styles.dateCellLabel}>{t('orders.detail.orderDate')}</Text>
                <Text style={styles.dateCellValue}>{order.orderDate}</Text>
              </View>
              <View style={[styles.dateCell, styles.dateCellRight]}>
                <Text style={styles.dateCellLabel}>{t('orders.detail.paymentMethod')}</Text>
                <Text style={styles.dateCellValue}>{order.paymentTypeName}</Text>
              </View>
            </View>
          </AppCard>
        </View>

        {/* Line items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('orders.detail.lineItems', { count: order.orderLines.length })}
          </Text>
          <View style={styles.linesCard}>
            <ScrollView
              nestedScrollEnabled
              style={styles.linesScroll}
              showsVerticalScrollIndicator={false}
            >
              {order.orderLines.map((line, i) => (
                <OrderLineItem
                  key={line.id ?? i}
                  line={line}
                  index={i}
                  isLast={i === order.orderLines.length - 1}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Notes (only when present) */}
        {!!order.notes?.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orders.detail.notes')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar — hidden for cancelled orders */}
      {canUpdate && !isCancelled && (
        <AppBottomBar>
          <>
            {(canMarkInProgress || canMarkDelivered) && (
              <View style={styles.ghostBtnRow}>
                {canMarkInProgress && (
                  <TouchableOpacity
                    style={[styles.ghostBtn, submitting && styles.btnDisabled]}
                    onPress={onMarkInProgress}
                    disabled={submitting}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.ghostBtnText} numberOfLines={1}>
                      {t('orders.detail.markInProgress')}
                    </Text>
                  </TouchableOpacity>
                )}
                {canMarkDelivered && (
                  <TouchableOpacity
                    style={[styles.ghostBtn, submitting && styles.btnDisabled]}
                    onPress={onMarkDelivered}
                    disabled={submitting}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.ghostBtnText} numberOfLines={1}>
                      {t('orders.detail.markDelivered')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {canCancel && (
              <TouchableOpacity
                style={[styles.cancelBtn, submitting && styles.btnDisabled]}
                onPress={onCancelOrder}
                disabled={submitting}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelBtnText} numberOfLines={1}>
                  {t('orders.detail.cancelOrder')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: config.fg },
                submitting && styles.btnDisabled,
              ]}
              onPress={() => onRecordPayment(order.id)}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.primaryBtnText} numberOfLines={1}>
                  {t('orders.detail.recordPayment')}
                </Text>
              )}
            </TouchableOpacity>
          </>
        </AppBottomBar>
      )}
    </View>
  );
};
