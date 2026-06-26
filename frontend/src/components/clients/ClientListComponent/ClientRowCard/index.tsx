import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAmount } from '@components/common/AppAmount';
import { AppAvatar } from '@components/common/AppAvatar';
import { AppCard } from '@components/common/AppCard';

import { resolveClientBalanceColor } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { ClientRowCardProps } from '../../../../types/clients.types';
import { styles } from './styles';

const BALANCE_TONE = {
  receivable: 'credit',
  payable: 'debit',
  settled: 'neutral',
} as const;

export const ClientRowCard = React.memo(({ item, onPress }: ClientRowCardProps) => {
  const { t } = useTranslation();
  const avatarColor =
    item.clientTypeId === AppConstants.CLIENT_TYPE.CUSTOMER ? colors.primary : colors.warning;
  const balanceColor = resolveClientBalanceColor(item.balanceDirection);
  const balanceLabel =
    item.balanceDirection === 'receivable'
      ? t('clients.balanceReceivable')
      : item.balanceDirection === 'payable'
        ? t('clients.balancePayable')
        : null;

  return (
    <AppCard onPress={() => onPress(item.id)} padding={14}>
      <View style={styles.row}>
        <AppAvatar label={item.initials} color={avatarColor} size={44} />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.phone ? (
            <Text style={styles.sub} numberOfLines={1}>
              {item.phone}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {item.balanceDirection !== 'settled' ? (
            <>
              <AppAmount value={item.balance} tone={BALANCE_TONE[item.balanceDirection]} />
              {balanceLabel ? (
                <Text style={[styles.balanceLabel, { color: balanceColor }]}>{balanceLabel}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.settledText}>{t('clients.settled')}</Text>
          )}
        </View>
      </View>
    </AppCard>
  );
});
