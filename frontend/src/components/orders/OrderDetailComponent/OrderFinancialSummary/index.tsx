import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { formatPKR } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import type { OrderFinancialSummaryProps } from '../../../../types/orders.types';
import { styles } from './styles';

export const OrderFinancialSummary = ({
  subtotal,
  amountPaid,
  outstanding,
}: OrderFinancialSummaryProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>{t('orders.detail.subtotal')}</Text>
        <Text style={styles.value}>{formatPKR(subtotal)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('orders.detail.amountPaid')}</Text>
        <Text style={[styles.value, { color: colors.success }]}>{formatPKR(amountPaid)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.labelBold}>{t('orders.detail.outstanding')}</Text>
        <Text style={[styles.valueBold, { color: outstanding > 0 ? colors.danger : colors.text }]}>
          {formatPKR(outstanding)}
        </Text>
      </View>
    </View>
  );
};
