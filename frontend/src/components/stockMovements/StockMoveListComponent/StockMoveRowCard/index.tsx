import React from 'react';

import { Text, View } from 'react-native';

import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';

import { formatAmount } from '@utils/helpers/formatCurrency';
import {
  getMovementTypeColor,
  getMovementTypeSign,
  MOVEMENT_TYPE_ICONS,
} from '@utils/helpers/stockMovementsContent';

import { BoxIcon } from '@constants/svgAssets';

import type { StockMoveRowCardProps } from '../../../../types/stockMovements.types';
import { styles } from './styles';

export const StockMoveRowCard = React.memo(({ movement, onPress }: StockMoveRowCardProps) => {
  const color = getMovementTypeColor(movement.movementTypeId);
  const sign = getMovementTypeSign(movement.movementTypeId);
  const Icon = MOVEMENT_TYPE_ICONS[movement.movementTypeId] ?? BoxIcon;

  return (
    <AppCard onPress={() => onPress(movement.id)} padding={14}>
      <View style={styles.row}>
        <AppIconTile Icon={Icon} color={color} size={40} />
        <View style={styles.info}>
          <Text style={styles.primary} numberOfLines={1}>
            {movement.productName}
          </Text>
          <Text style={styles.secondary} numberOfLines={1}>
            {`${movement.movementSourceName} · ${movement.movementDate}`}
          </Text>
        </View>
        <Text style={[styles.qty, { color }]}>
          {sign}
          {formatAmount(movement.qty)}
          {movement.unitName ? ` ${movement.unitName}` : ''}
        </Text>
      </View>
    </AppCard>
  );
});
