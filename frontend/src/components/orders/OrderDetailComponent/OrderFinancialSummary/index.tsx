import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';

import type { OrderFinancialSummaryProps } from '../../../../types/orders.types';
import { styles } from './styles';

export const OrderFinancialSummary = ({
  subtotal,
  amountPaid,
  outstanding,
}: OrderFinancialSummaryProps) => {
  const { t } = useTranslation();

  return (
    <AppCard>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('orders.detail.subtotal')}</Text>
          <AppAmount value={subtotal} size={14} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('orders.detail.amountPaid')}</Text>
          <AppAmount value={amountPaid} tone="credit" size={14} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.labelBold}>{t('orders.detail.outstanding')}</Text>
          <AppAmount value={outstanding} tone={outstanding > 0 ? 'debit' : 'neutral'} size={18} />
        </View>
      </View>
    </AppCard>
  );
};
