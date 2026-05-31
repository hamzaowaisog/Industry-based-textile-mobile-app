import { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { loginAsync } from '../core/auth';
import { LoginFormValues } from '../types/login.types';
import { AuthStackParamList } from '../types/navigation.types';
import { showError } from '../utils/toast';
import { loginValidationSchema } from '../utils/validation/loginValidation';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const useLogin = (navigation: LoginNavProp) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formik = useFormik<LoginFormValues>({
    initialValues: { userName: '', password: '' },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      const result = await loginAsync({ credentials: values, rememberMe });
      if (!result.success) {
        showError('Login failed', result.error);
      }
    },
  });

  return {
    formik,
    showPassword,
    rememberMe,
    onTogglePassword: () => setShowPassword((p) => !p),
    onToggleRemember: () => setRememberMe((p) => !p),
    onForgotPassword: () => navigation.navigate('ForgotPassword'),
    onBiometric: () => {},
  };
};
