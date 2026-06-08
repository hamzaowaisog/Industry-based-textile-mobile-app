import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { formatRelativeTime } from '@utils/helpers/formatRelativeTime';
import { getNotificationIcon } from '@utils/helpers/notificationMappers';

import { colors } from '@theme/colors';

import { TrashIcon } from '@constants/svgAssets';

import type { NotificationRowProps } from '../../../types/notifications.types';
import { styles } from './styles';

export const NotificationRow = ({ item, onPress, onDelete }: NotificationRowProps) => {
  const { Icon, color } = getNotificationIcon(item.type);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.rowContent}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(item.id)}
        activeOpacity={0.7}
      >
        <TrashIcon size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
};
