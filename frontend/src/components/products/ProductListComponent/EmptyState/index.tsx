import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors } from '@theme/colors';

import { BoxIcon, PlusIcon } from '@constants/svgAssets';

import type { EmptyStateProps } from '../../../../types/products.types';
import { styles } from './styles';

export const EmptyState = ({ onNewProduct }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconBubble}>
        <BoxIcon size={58} color={colors.primary} />
        <View style={styles.badge}>
          <PlusIcon size={20} color={colors.surface} />
        </View>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{t('products.empty.title')}</Text>
        <Text style={styles.sub}>{t('products.empty.subtitle')}</Text>
      </View>
      <TouchableOpacity style={styles.cta} onPress={onNewProduct} activeOpacity={0.8}>
        <PlusIcon size={18} color={colors.surface} />
        <Text style={styles.ctaText}>{t('products.create.title')}</Text>
      </TouchableOpacity>
    </View>
  );
};
