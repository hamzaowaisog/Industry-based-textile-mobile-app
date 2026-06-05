import { Text, View } from 'react-native';

import { getStatusStyle } from '@utils/helpers/dashboardContent';
import { formatCompactNumber as fmt } from '@utils/helpers/formatNumber';

import { colors } from '@theme/colors';

import { ShoppingBagIcon } from '@constants/svgAssets';

import type { OrderRowProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const OrderRow = ({ order, isLast }: OrderRowProps) => {
  const s = getStatusStyle(order.statusName);
  return (
    <>
      <View style={styles.row}>
        <View style={styles.iconTile}>
          <ShoppingBagIcon size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.client} numberOfLines={1}>
            {order.clientName}
          </Text>
          <Text style={styles.meta}>
            #{order.orderId} · {order.orderDate}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>Rs {fmt(order.total)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.fg }]}>{order.statusName}</Text>
          </View>
        </View>
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};
