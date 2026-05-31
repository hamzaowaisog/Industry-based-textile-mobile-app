import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { AppConstants } from '@constants/appConstants';

import { forgotPasswordAsync } from '../core/auth';
import { ForgotPasswordNavProp } from '../types/navigation.types';
import { ForgotPasswordFormValues } from '../types/forgotPassword.types';
import { forgotPasswordValidationSchema } from '../utils/validation/forgotPasswordValidation';
import { showError, showSuccess } from '../utils/toast';

export const useForgotPassword = (navigation: ForgotPasswordNavProp) => {
  const { t } = useTranslation();

  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: { email: '' },
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: async (values) => {
      const result = await forgotPasswordAsync({ email: values.email });
      if (result.success) {
        showSuccess(t('forgotPassword.successTitle'), t('forgotPassword.successSubtitle'));
        navigation.navigate(AppConstants.SCREENS.AUTH.VERIFY_OTP, {
          email: values.email,
          nextResendAt: result.nextResendAt,
        });
      } else {
        showError(t('forgotPassword.errorTitle'), result.error);
      }
    },
  });

  return {
    formik,
    isPending: formik.isSubmitting,
    onBack: () => navigation.goBack(),
    onSignIn: () => navigation.navigate(AppConstants.SCREENS.AUTH.LOGIN),
  };
};
