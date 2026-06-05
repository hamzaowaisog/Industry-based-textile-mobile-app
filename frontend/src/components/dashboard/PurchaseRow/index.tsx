import { Text, View } from 'react-native';

import { getStatusStyle } from '@utils/helpers/dashboardContent';
import { formatCompactNumber as fmt } from '@utils/helpers/formatNumber';

import { colors } from '@theme/colors';

import { BoxIcon } from '@constants/svgAssets';

import type { PurchaseRowProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const PurchaseRow = ({ purchase, isLast }: PurchaseRowProps) => {
  const s = getStatusStyle(purchase.statusName);
  return (
    <>
      <View style={styles.row}>
        <View style={styles.iconTile}>
          <BoxIcon size={20} color={colors.warning} />
        </View>
        <View style={styles.info}>
          <Text style={styles.supplier} numberOfLines={1}>
            {purchase.supplierName}
          </Text>
          <Text style={styles.meta}>
            #{purchase.purchaseId} · {purchase.purchaseDate}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>Rs {fmt(purchase.total)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.fg }]}>{purchase.statusName}</Text>
          </View>
        </View>
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};
