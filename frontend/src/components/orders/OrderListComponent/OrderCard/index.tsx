import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';

import { formatPKR } from '@utils/helpers/formatCurrency';
import { getOrderStatusConfig } from '@utils/helpers/orderContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { OrderCardProps } from '../../../../types/orders.types';
import { styles } from './styles';

export const OrderCard = React.memo(({ order, onPress }: OrderCardProps) => {
  const { t } = useTranslation();
  const statusConfig = getOrderStatusConfig(order.statusId);
  const paidRatio = order.total > 0 ? Math.min(order.amountPaid / order.total, 1) : 0;
  const isCancelled = order.statusId === AppConstants.ORDER_STATUS.CANCELLED;

  return (
    <AppCard onPress={() => onPress(order.id)}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.orderId}>{`ORD-${order.id}`}</Text>
          <Text style={styles.clientName}>{order.clientName}</Text>
          <Text style={styles.date}>{order.orderDate}</Text>
        </View>
        <View style={styles.right}>
          <AppAmount value={order.total} size={17} />
          <AppBadge label={order.statusName} bg={statusConfig.bg} fg={statusConfig.fg} />
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
    </AppCard>
  );
});
