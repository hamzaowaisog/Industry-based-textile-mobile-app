import React from 'react';

import { Text, View } from 'react-native';

import type { ClientTransactionSummary } from '@api/models';

import { formatPKR } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import { TagIcon } from '@constants/svgAssets';

import { styles } from './styles';

export const TransactionTabRow = ({ item }: { item: ClientTransactionSummary }) => {
  const isCredit = item.typeName?.toLowerCase() === 'credit';
  return (
    <View style={styles.tabRow}>
      <View
        style={[
          styles.tabRowIcon,
          { backgroundColor: isCredit ? colors.successLight : colors.dangerLight },
        ]}
      >
        <TagIcon size={18} color={isCredit ? colors.success : colors.danger} />
      </View>
      <View style={styles.tabRowInfo}>
        <Text style={styles.tabRowPrimary}>{item.categoryName}</Text>
        <Text style={styles.tabRowSub}>{item.transDate}</Text>
      </View>
      <Text style={[styles.tabRowAmount, { color: isCredit ? colors.success : colors.danger }]}>
        {isCredit ? '+' : '-'}
        {formatPKR(item.amount ?? 0)}
      </Text>
    </View>
  );
};
