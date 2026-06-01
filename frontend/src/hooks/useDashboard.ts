import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { logoutAsync } from '../core/auth';
import { showError, showSuccess } from '../utils/toast';

export type DashboardNavProp = ReturnType<typeof useNavigation>;

export const useDashboard = (navigation: DashboardNavProp) => {
  const { t } = useTranslation();

  const onLogout = async () => {
    const result = await logoutAsync();
    if (!result.success) {
      showError(t('auth.logout'), result.error ?? 'Logout failed');
    } else {
      showSuccess(t('auth.logout'), 'Logged out successfully');
    }
  };

  return {
    onLogout,
  };
};
