import React from 'react';

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, MoreIcon, UserIcon } from '@constants/svgAssets';

import type { OrderDetailComponentProps } from '../../../types/orders.types';
import { OrderFinancialSummary } from './OrderFinancialSummary';
import { OrderLineItem } from './OrderLineItem';
import { OrderStatusBanner } from './OrderStatusBanner';
import { styles } from './styles';

export const OrderDetailComponent = ({
  order,
  loading,
  submitting,
  canUpdate,
  canDelete,
  onBack,
  onMore,
  onClientPress,
  onMarkDelivered,
  onCancelOrder,
  onRecordPayment,
}: OrderDetailComponentProps) => {
  const { t } = useTranslation();

  const canMarkDelivered =
    canUpdate &&
    order?.statusId !== AppConstants.ORDER_STATUS.DELIVERED &&
    order?.statusId !== AppConstants.ORDER_STATUS.CANCELLED;

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ArrowLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
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

  const subtotal = order.orderLines.reduce((sum, l) => sum + (l.qty ?? 0) * (l.unitPrice ?? 0), 0);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{`ORD-${order.id}`}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {order.clientName}
          </Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={onMore}>
          <MoreIcon size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status banner */}
        <View style={styles.section}>
          <OrderStatusBanner statusId={order.statusId} statusName={order.statusName} />
        </View>

        {/* Client + dates */}
        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.clientRow}
              onPress={() => onClientPress(order.clientId)}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <UserIcon size={18} color={colors.primary} />
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{order.clientName}</Text>
                <Text style={styles.clientSub}>{order.paymentTypeName}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.dateGrid}>
              <View style={styles.dateCell}>
                <Text style={styles.dateCellLabel}>{t('orders.detail.orderDate')}</Text>
                <Text style={styles.dateCellValue}>{order.orderDate}</Text>
              </View>
              <View style={[styles.dateCell, styles.dateCellRight]}>
                <Text style={styles.dateCellLabel}>{t('orders.detail.dueDate')}</Text>
                <Text style={styles.dateCellValue}>{order.createdAt ?? '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Line items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('orders.detail.lineItems', { count: order.orderLines.length })}
          </Text>
          <View style={styles.linesCard}>
            {order.orderLines.map((line, i) => (
              <OrderLineItem
                key={line.id ?? i}
                line={line}
                index={i}
                isLast={i === order.orderLines.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Financial summary */}
        <View style={styles.section}>
          <OrderFinancialSummary
            subtotal={subtotal}
            amountPaid={order.amountPaid}
            outstanding={order.outstanding}
          />
        </View>
      </ScrollView>

      {/* Bottom bar */}
      {canUpdate && (
        <View style={styles.bottomBar}>
          {canMarkDelivered && (
            <TouchableOpacity
              style={[styles.ghostBtn, submitting && styles.btnDisabled]}
              onPress={onMarkDelivered}
              disabled={submitting}
              activeOpacity={0.75}
            >
              <Text style={styles.ghostBtnText}>{t('orders.detail.markDelivered')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.btnDisabled]}
            onPress={() => onRecordPayment(order.id)}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>{t('orders.detail.recordPayment')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
