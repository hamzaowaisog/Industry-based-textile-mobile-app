import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors } from '@theme/colors';

import { PlusIcon, UsersIcon } from '@constants/svgAssets';

import type { ClientListEmptyStateProps } from '../../../../types/clients.types';
import { styles } from './styles';

export const EmptyState = ({ onAddFirstClient }: ClientListEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconBubble}>
        <UsersIcon size={58} color={colors.success} />
        <View style={styles.badge}>
          <PlusIcon size={20} color={colors.surface} />
        </View>
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{t('clients.emptyTitle')}</Text>
        <Text style={styles.sub}>{t('clients.emptySubtext')}</Text>
      </View>

      <TouchableOpacity style={styles.cta} onPress={onAddFirstClient} activeOpacity={0.8}>
        <PlusIcon size={18} color={colors.surface} />
        <Text style={styles.ctaText}>{t('clients.emptyCtaLabel')}</Text>
      </TouchableOpacity>

      <Text style={styles.secondary}>{t('clients.emptySecondary')}</Text>
    </View>
  );
};
