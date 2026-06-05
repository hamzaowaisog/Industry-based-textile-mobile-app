import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { AppConstants } from '@constants/appConstants';

import { resetPasswordAsync } from '../core/auth';
import { ResetPasswordNavProp } from '../types/navigation.types';
import { ResetPasswordFormValues } from '../types/resetPassword.types';
import { resetPasswordValidationSchema } from '../utils/validation/resetPasswordValidation';
import { showError, showSuccess } from '../utils/toast';

export const useResetPassword = (
  navigation: ResetPasswordNavProp,
  email: string,
  resetToken: string,
) => {
  const { t } = useTranslation();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const goToLogin = useCallback(
    () => navigation.reset({ index: 0, routes: [{ name: AppConstants.SCREENS.AUTH.LOGIN }] }),
    [navigation],
  );

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goToLogin();
        return true;
      });
      return () => sub.remove();
    }, [goToLogin]),
  );

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (values) => {
      const result = await resetPasswordAsync({
        email,
        resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      if (result.success) {
        showSuccess(t('resetPassword.successTitle'), t('resetPassword.successSubtitle'));
        goToLogin();
      } else {
        showError(t('resetPassword.errorTitle'), result.error);
      }
    },
  });

  return {
    formik,
    isPending: formik.isSubmitting,
    showNew,
    showConfirm,
    onToggleNew: () => setShowNew((v) => !v),
    onToggleConfirm: () => setShowConfirm((v) => !v),
    onBack: goToLogin,
  };
};
