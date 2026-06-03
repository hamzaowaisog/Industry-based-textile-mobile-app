import { useState } from 'react';

import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { AppConstants } from '@constants/appConstants';

import { loginAsync } from '../core/auth';
import { offerBiometricSetup } from '../hooks/useBiometric';
import { useAuthStore } from '../stores/authStore';
import { useSyncStore } from '../stores/syncStore';
import { LoginFormValues } from '../types/login.types';
import { LoginNavProp } from '../types/navigation.types';
import { showError } from '../utils/toast';
import { loginValidationSchema } from '../utils/validation/loginValidation';

export const useLogin = (navigation: LoginNavProp) => {
  const { t } = useTranslation();
  const isBiometricEnabled = useAuthStore((s) => s.isBiometricEnabled);
  const isOnline = useSyncStore((s) => s.isOnline);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formik = useFormik<LoginFormValues>({
    initialValues: { userName: '', password: '' },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      if (!isOnline) {
        showError(t('sync.offlineTitle'), t('login.requiresConnection'));
        return;
      }
      const result = await loginAsync({ credentials: values, rememberMe });
      if (!result.success) {
        showError(t('login.errorTitle'), result.error ?? t('login.errorSubtitle'));
      } else {
        if (rememberMe) {
          offerBiometricSetup(t).catch((err) => {
            console.error('Biometric setup error:', err);
          });
        }
      }
    },
  });

  return {
    formik,
    showPassword,
    rememberMe,
    isOnline,
    isBiometricEnabled,
    onTogglePassword: () => setShowPassword((p) => !p),
    onToggleRemember: () => setRememberMe((p) => !p),
    onForgotPassword: () => navigation.navigate(AppConstants.SCREENS.AUTH.FORGOT_PASSWORD),
    onBiometric: () => navigation.navigate(AppConstants.SCREENS.AUTH.BIOMETRIC),
    onRequestAccess: () => navigation.navigate(AppConstants.SCREENS.AUTH.REGISTER),
  };
};
