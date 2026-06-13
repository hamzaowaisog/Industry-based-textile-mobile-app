import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { formatPKR } from '@utils/helpers/clientMappers';
import { getOrderStatusConfig } from '@utils/helpers/orderContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { OrderCardProps } from '../../../../types/orders.types';
import { styles } from './styles';

export const OrderCard = ({ order, onPress }: OrderCardProps) => {
  const { t } = useTranslation();
  const statusConfig = getOrderStatusConfig(order.statusId);
  const paidRatio = order.total > 0 ? Math.min(order.amountPaid / order.total, 1) : 0;
  const isCancelled = order.statusId === AppConstants.ORDER_STATUS.CANCELLED;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(order.id)} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.orderId}>{`ORD-${order.id}`}</Text>
          <Text style={styles.clientName}>{order.clientName}</Text>
          <Text style={styles.date}>{order.orderDate}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>{formatPKR(order.total)}</Text>
          <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.badgeText, { color: statusConfig.fg }]}>{order.statusName}</Text>
          </View>
        </View>
      </View>

      {!isCancelled && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${paidRatio * 100}%` as any,
                  backgroundColor: paidRatio >= 1 ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              {t('orders.paid', { amount: formatPKR(order.amountPaid) })}
            </Text>
            <Text style={styles.progressLabel}>{`${Math.round(paidRatio * 100)}%`}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
