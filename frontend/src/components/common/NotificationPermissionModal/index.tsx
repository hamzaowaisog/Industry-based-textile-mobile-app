import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { BellIcon } from '@constants/svgAssets';
import { useDeviceStore } from '@stores/deviceStore';
import { colors } from '@theme/colors';

import { styles } from './styles';

export const NotificationPermissionModal = () => {
  const { t } = useTranslation();
  const hasBeenPrompted = useDeviceStore((s) => s.hasBeenPrompted);
  const registerForPush = useDeviceStore((s) => s.registerForPush);
  const declineNotifications = useDeviceStore((s) => s.declineNotifications);

  const visible = !hasBeenPrompted;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.iconWrap}>
            <BellIcon size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('notifications.permissionTitle')}</Text>
          <Text style={styles.body}>{t('notifications.permissionBody')}</Text>
          <TouchableOpacity style={styles.allowBtn} onPress={registerForPush} activeOpacity={0.8}>
            <Text style={styles.allowText}>{t('notifications.permissionAllow')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notNowBtn} onPress={declineNotifications} activeOpacity={0.8}>
            <Text style={styles.notNowText}>{t('notifications.permissionNotNow')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
