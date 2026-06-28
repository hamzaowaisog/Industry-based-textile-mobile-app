import React from 'react';

import { Text, View } from 'react-native';

import { AppAmount } from '@components/common/AppAmount';
import { AppAvatar } from '@components/common/AppAvatar';

import { formatPKR } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import type { OrderLineItemProps } from '../../../../types/orders.types';
import { styles } from './styles';

export const OrderLineItem = ({ line, index, isLast }: OrderLineItemProps) => {
  const lineTotal = (line.qty ?? 0) * (line.unitPrice ?? 0);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <AppAvatar label={String(index + 1)} color={colors.primary} size={28} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {line.productName ?? `Product #${line.productId}`}
        </Text>
        <Text style={styles.sub}>{`${line.qty ?? 0} × ${formatPKR(line.unitPrice ?? 0)}`}</Text>
      </View>
      <AppAmount value={lineTotal} size={14} />
    </View>
  );
};
