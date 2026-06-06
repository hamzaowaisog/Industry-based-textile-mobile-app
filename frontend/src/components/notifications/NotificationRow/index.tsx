import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { formatRelativeTime } from '@utils/helpers/formatRelativeTime';
import { getNotificationIcon } from '@utils/helpers/notificationMappers';

import { colors } from '@theme/colors';

import type { NotificationRowProps } from '../../../types/notifications.types';
import { styles } from './styles';

export const NotificationRow = ({ item, onPress, onDelete }: NotificationRowProps) => {
  const { t } = useTranslation();
  const { Icon, color } = getNotificationIcon(item.type);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => onDelete(item.id)}
      activeOpacity={0.8}
    >
      <Text style={styles.deleteText}>{t('notifications.deleteAction')}</Text>
    </TouchableOpacity>
  );

  return (
    <ReanimatedSwipeable friction={2} rightThreshold={40} renderRightActions={renderRightActions}>
      <TouchableOpacity style={styles.row} onPress={() => onPress(item)} activeOpacity={0.7}>
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
    </ReanimatedSwipeable>
  );
};
