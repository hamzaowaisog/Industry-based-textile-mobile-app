import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { ClientPaymentSummary } from '@api/models';

import { formatPKR } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import { CreditCardIcon } from '@constants/svgAssets';

import { styles } from './styles';

export const PaymentTabRow = ({ item }: { item: ClientPaymentSummary }) => {
  const { t } = useTranslation();
  const isReceived = item.directionName?.toLowerCase() === 'received';
  return (
    <View style={[styles.tabRow, item.isReversed ? { opacity: 0.5 } : {}]}>
      <View
        style={[
          styles.tabRowIcon,
          { backgroundColor: isReceived ? colors.successLight : colors.warningLight },
        ]}
      >
        <CreditCardIcon size={18} color={isReceived ? colors.success : colors.warning} />
      </View>
      <View style={styles.tabRowInfo}>
        <Text style={styles.tabRowPrimary}>{item.directionName}</Text>
        <Text style={styles.tabRowSub}>
          {item.paymentDate}
          {item.isReversed ? ` · ${t('clients.reversed')}` : ''}
        </Text>
      </View>
      <View style={styles.tabRowRight}>
        <Text style={[styles.tabRowAmount, { color: isReceived ? colors.success : colors.danger }]}>
          {formatPKR(item.amount ?? 0)}
        </Text>
        <View style={[styles.tabBadge, { backgroundColor: colors.bgAlt }]}>
          <Text style={[styles.tabBadgeText, { color: colors.textSecondary }]}>
            {item.modeName}
          </Text>
        </View>
      </View>
    </View>
  );
};
