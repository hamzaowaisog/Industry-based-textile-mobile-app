import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppCard } from '@components/common/AppCard';

import { formatPKR } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import { styles } from './styles';

export const NetSummaryCard = ({
  totalCredit,
  totalDebit,
}: {
  totalCredit: number;
  totalDebit: number;
}) => {
  const { t } = useTranslation();
  const net = totalCredit - totalDebit;

  return (
    <AppCard padding={18}>
      <Text style={styles.label}>{t('transactions.netForPeriod')}</Text>
      <Text style={[styles.netValue, { color: net >= 0 ? colors.success : colors.danger }]}>
        {net < 0 ? '−' : ''}
        {formatPKR(Math.abs(net))}
      </Text>
      <View style={styles.chipRow}>
        <Text style={[styles.chipText, { color: colors.success }]}>
          {`▲ ${t('transactions.filters.credit')} · ${formatPKR(totalCredit)}`}
        </Text>
        <Text style={[styles.chipText, { color: colors.danger }]}>
          {`▼ ${t('transactions.filters.debit')} · ${formatPKR(totalDebit)}`}
        </Text>
      </View>
    </AppCard>
  );
};
