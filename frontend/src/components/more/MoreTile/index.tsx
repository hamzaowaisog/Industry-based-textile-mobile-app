import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { MoreTileProps } from '../../../types/notifications.types';

import { styles } from './styles';

export const MoreTile = ({ item, onPress, badge }: MoreTileProps) => {
  const { t } = useTranslation();
  const showBadge = badge !== undefined && badge > 0;
  const badgeLabel = badge && badge > 99 ? '99+' : String(badge ?? 0);

  return (
    <TouchableOpacity style={styles.tile} onPress={() => onPress(item.destination)} activeOpacity={0.7}>
      {item.tag && (
        <View style={styles.adminTag}>
          <Text style={styles.adminTagText}>{item.tag.toUpperCase()}</Text>
        </View>
      )}
      {showBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      )}
      <View style={[styles.iconWrap, { backgroundColor: `${item.color}18` }]}>
        <item.Icon size={22} color={item.color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>{t(item.labelKey)}</Text>
    </TouchableOpacity>
  );
};
