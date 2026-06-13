import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@theme/colors';

import type { AppPermissionModalProps } from '@types/common.types';

import { styles } from './styles';

export const AppPermissionModal = ({
  visible,
  Icon,
  iconColor = colors.primary,
  title,
  body,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: AppPermissionModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
            <Icon size={40} color={iconColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: iconColor }]}
            onPress={onPrimary}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onSecondary} activeOpacity={0.8}>
            <Text style={styles.secondaryText}>{secondaryLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
