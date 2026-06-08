import React from 'react';

import { Text, View } from 'react-native';

import type { ClientPurchaseSummary } from '@api/models';

import { formatPKR } from '@utils/helpers/clientMappers';
import { getStatusStyle } from '@utils/helpers/clientDetailContent';

import { colors } from '@theme/colors';

import { TruckIcon } from '@constants/svgAssets';

import { styles } from './styles';

export const PurchaseTabRow = ({ item }: { item: ClientPurchaseSummary }) => {
  const s = getStatusStyle(item.statusName);
  return (
    <View style={styles.tabRow}>
      <View style={[styles.tabRowIcon, { backgroundColor: colors.warningLight }]}>
        <TruckIcon size={18} color={colors.warning} />
      </View>
      <View style={styles.tabRowInfo}>
        <Text style={styles.tabRowPrimary}>#{item.purchaseId}</Text>
        <Text style={styles.tabRowSub}>{item.purchaseDate}</Text>
      </View>
      <View style={styles.tabRowRight}>
        <Text style={styles.tabRowAmount}>{formatPKR(item.total ?? 0)}</Text>
        <View style={[styles.tabBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.tabBadgeText, { color: s.fg }]}>{item.statusName}</Text>
        </View>
      </View>
    </View>
  );
};
