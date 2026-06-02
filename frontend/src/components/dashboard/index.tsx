import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/authStore';
import { styles } from './styles';

export type DashboardComponentProps = {
  onLogout: () => void;
};

export const DashboardComponent = ({ onLogout }: DashboardComponentProps) => {
  const { t } = useTranslation();
  const userName = useAuthStore((s) => s.userName);
  const roleId = useAuthStore((s) => s.roleId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('dashboard.title')}</Text>
      <Text style={styles.subtitle}>Welcome, {userName}!</Text>
      <Text style={styles.subtitle}>Role ID: {roleId}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>{t('auth.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};
