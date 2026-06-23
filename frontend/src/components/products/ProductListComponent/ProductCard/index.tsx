import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { BoxIcon } from '@constants/svgAssets';

import type { ProductCardProps } from '../../../../types/products.types';
import { styles } from './styles';

export const ProductCard = ({ product, onPress }: ProductCardProps) => {
  const { t } = useTranslation();

  const iconColor = product.isOut ? colors.danger : product.isLow ? colors.warning : colors.primary;
  const iconBg = product.isOut
    ? colors.dangerLight
    : product.isLow
      ? colors.warningLight
      : colors.primaryLight;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product.id)} activeOpacity={0.7}>
      <View style={[styles.iconTile, { backgroundColor: iconBg }]}>
        <BoxIcon size={20} color={iconColor} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.sku}>{product.sku}</Text>
      </View>

      <View style={styles.right}>
        {product.isOut ? (
          <View style={[styles.badge, { backgroundColor: colors.dangerLight }]}>
            <Text style={[styles.badgeText, { color: colors.danger }]}>
              {t('products.stockBadgeOut')}
            </Text>
          </View>
        ) : product.isLow ? (
          <View style={[styles.badge, { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.badgeText, { color: colors.warning }]}>
              {t('products.stockBadgeLow')}
            </Text>
          </View>
        ) : (
          <Text style={styles.stockQty}>{product.stock.toLocaleString()}</Text>
        )}
        <Text style={styles.subLine}>
          {!product.isOut &&
            `${product.unit} · ${AppConstants.CURRENCY.PREFIX}${product.avgPrice.toLocaleString()}`}
        </Text>
        {!product.isOut && (
          <Text style={styles.availableLine}>
            {t('products.availableLine', { count: product.availableQuantity })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
