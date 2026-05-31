import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFormik } from 'formik';

import { forgotPasswordAsync } from '../core/auth';
import { AuthStackParamList } from '../types/navigation.types';
import { ForgotPasswordFormValues } from '../types/forgotPassword.types';
import { forgotPasswordValidationSchema } from '../utils/validation/forgotPasswordValidation';
import { showError, showSuccess } from '../utils/toast';

type ForgotPasswordNavProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const useForgotPassword = (navigation: ForgotPasswordNavProp) => {
  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: { email: '' },
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: async (values) => {
      const result = await forgotPasswordAsync({ email: values.email });
      if (result.success) {
        showSuccess('Email sent', 'Check your inbox for a password reset link.');
        navigation.navigate('Login');
      } else {
        showError('Failed to send email', result.error);
      }
    },
  });

  return {
    formik,
    isPending: formik.isSubmitting,
    onBack: () => navigation.goBack(),
    onSignIn: () => navigation.navigate('Login'),
  };
};
