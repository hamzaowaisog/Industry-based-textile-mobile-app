import { View } from 'react-native';

import { AppAmount } from '@components/common/AppAmount';
import { AppBadge } from '@components/common/AppBadge';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';

import { getStatusStyle } from '@utils/helpers/dashboardContent';

import { colors } from '@theme/colors';

import { ShoppingBagIcon } from '@constants/svgAssets';

import type { OrderRowProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const OrderRow = ({ order, isLast }: OrderRowProps) => {
  const s = getStatusStyle(order.statusName);
  return (
    <>
      <View style={styles.row}>
        <AppRow
          leading={<AppIconTile Icon={ShoppingBagIcon} color={colors.primary} size={40} />}
          primary={order.clientName}
          secondary={`#${order.orderId} · ${order.orderDate}`}
          right={
            <>
              <AppAmount value={order.total} size={14} />
              <AppBadge label={order.statusName} bg={s.bg} fg={s.fg} size="sm" />
            </>
          }
        />
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};
