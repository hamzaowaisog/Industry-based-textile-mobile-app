import { useCallback, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { showError, showSuccess } from '@utils/toast';
import { changePasswordValidationSchema } from '@utils/validation/changePasswordValidation';

import { changePasswordAsync } from '../core/auth';
import type { SettingsStackParamList } from '../types/navigation.types';
import type { ChangePasswordFormValues } from '../types/changePassword.types';

const DEFAULT_VALUES: ChangePasswordFormValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export const useChangePassword = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      const result = await changePasswordAsync(values);
      if (result.success) {
        showSuccess(t('changePassword.successTitle'), t('changePassword.successSubtitle'));
        navigation.goBack();
      } else {
        showError(t('changePassword.errorTitle'), result.error ?? t('common.errorGeneric'));
      }
    },
    [navigation, t],
  );

  const formik = useFormik<ChangePasswordFormValues>({
    initialValues: DEFAULT_VALUES,
    validationSchema: changePasswordValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  const onToggleOldPassword = useCallback(() => setShowOldPassword((v) => !v), []);
  const onToggleNewPassword = useCallback(() => setShowNewPassword((v) => !v), []);
  const onToggleConfirmPassword = useCallback(() => setShowConfirmPassword((v) => !v), []);
  const onCancel = useCallback(() => navigation.goBack(), [navigation]);

  return {
    values: formik.values,
    errors: formik.errors as Record<string, string | undefined>,
    touched: formik.touched as Record<string, boolean | undefined>,
    submitting: formik.isSubmitting,
    showOldPassword,
    showNewPassword,
    showConfirmPassword,
    onToggleOldPassword,
    onToggleNewPassword,
    onToggleConfirmPassword,
    setFieldValue: formik.setFieldValue,
    setFieldTouched: formik.setFieldTouched,
    handleSubmit: formik.handleSubmit,
    onCancel,
  };
};
