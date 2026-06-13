import React from 'react';

import { Text, View } from 'react-native';

import { formatPKR } from '@utils/helpers/clientMappers';

import type { OrderLineItemProps } from '../../../../types/orders.types';
import { styles } from './styles';

export const OrderLineItem = ({ line, index, isLast }: OrderLineItemProps) => {
  const lineTotal = (line.qty ?? 0) * (line.unitPrice ?? 0);
  const isEven = index % 2 === 0;

  return (
    <View
      style={[styles.row, isEven ? styles.rowEven : styles.rowOdd, !isLast && styles.rowBorder]}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{line.productName ?? `Product #${line.productId}`}</Text>
        <Text style={styles.sub}>{`${line.qty ?? 0} × ${formatPKR(line.unitPrice ?? 0)}`}</Text>
      </View>
      <Text style={styles.total}>{formatPKR(lineTotal)}</Text>
    </View>
  );
};
