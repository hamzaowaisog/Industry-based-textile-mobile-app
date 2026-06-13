import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { ClientOrderSummary } from '@api/models';

import { getStatusStyle } from '@utils/helpers/clientDetailContent';
import { formatPKR } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import { ShoppingBagIcon as OrderIcon } from '@constants/svgAssets';

import { styles } from './styles';

export const OrderTabRow = ({ item }: { item: ClientOrderSummary }) => {
  const { t } = useTranslation();
  const s = getStatusStyle(item.statusName);
  return (
    <View style={styles.tabRow}>
      <View style={[styles.tabRowIcon, { backgroundColor: colors.primaryLight }]}>
        <OrderIcon size={18} color={colors.primary} />
      </View>
      <View style={styles.tabRowInfo}>
        <Text style={styles.tabRowPrimary}>#{item.orderId}</Text>
        <Text style={styles.tabRowSub}>{item.orderDate}</Text>
      </View>
      <View style={styles.tabRowRight}>
        <Text style={styles.tabRowAmount}>{formatPKR(item.total ?? 0)}</Text>
        {(item.amountPaid ?? 0) > 0 && (
          <Text style={styles.tabRowSub}>
            {t('orders.paid', { amount: formatPKR(item.amountPaid ?? 0) })}
          </Text>
        )}
        <View style={[styles.tabBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.tabBadgeText, { color: s.fg }]}>{item.statusName}</Text>
        </View>
      </View>
    </View>
  );
};
