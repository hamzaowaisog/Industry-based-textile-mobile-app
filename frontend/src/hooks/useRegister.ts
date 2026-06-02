import { useState } from 'react';

import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { AppConstants } from '@constants/appConstants';

import { registerAsync } from '../core/auth';
import { RegisterNavProp } from '../types/navigation.types';
import { RegisterFormValues } from '../types/register.types';
import { showError, showSuccess } from '../utils/toast';
import { registerValidationSchema } from '../utils/validation/registerValidation';

export const useRegister = (navigation: RegisterNavProp) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      name: '',
      email: '',
      userName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      const result = await registerAsync({
        name: values.name,
        email: values.email,
        userName: values.userName,
        phoneNumber: values.phoneNumber,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      if (result.success) {
        showSuccess(t('register.successTitle'), t('register.successSubtitle'));
        navigation.navigate(AppConstants.SCREENS.AUTH.VERIFY_SIGNUP_OTP, {
          email: values.email,
          nextResendAt: result.nextResendAt,
        });
      } else {
        showError(t('register.errorTitle'), result.error);
      }
    },
  });

  return {
    formik,
    isPending: formik.isSubmitting,
    showPassword,
    showConfirmPassword,
    onTogglePassword: () => setShowPassword((p) => !p),
    onToggleConfirmPassword: () => setShowConfirmPassword((p) => !p),
    onBack: () => navigation.navigate(AppConstants.SCREENS.AUTH.LOGIN),
    onSignIn: () => navigation.navigate(AppConstants.SCREENS.AUTH.LOGIN),
  };
};
