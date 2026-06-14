import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { formatPKR, resolveClientBalanceColor } from '@utils/helpers/clientMappers';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { ClientRowCardProps } from '../../../../types/clients.types';
import { styles } from './styles';

export const ClientRowCard = ({ item, onPress }: ClientRowCardProps) => {
  const { t } = useTranslation();
  const avatarBg =
    item.clientTypeId === AppConstants.CLIENT_TYPE.CUSTOMER ? colors.primary : colors.warning;
  const balanceColor = resolveClientBalanceColor(item.balanceDirection);
  const balanceLabel =
    item.balanceDirection === 'receivable'
      ? t('clients.balanceReceivable')
      : item.balanceDirection === 'payable'
        ? t('clients.balancePayable')
        : null;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item.id)} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={styles.avatarText}>{item.initials}</Text>
      </View>

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
            <Text style={[styles.balanceAmount, { color: balanceColor }]}>
              {formatPKR(item.balance)}
            </Text>
            {balanceLabel ? (
              <Text style={[styles.balanceLabel, { color: balanceColor }]}>{balanceLabel}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.settledText}>{t('clients.settled')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
