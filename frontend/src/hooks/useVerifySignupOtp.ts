import { useCallback, useEffect, useRef, useState } from 'react';

import { BackHandler, TextInput } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import { AppConstants } from '@constants/appConstants';

import { resendSignupOtpAsync, verifySignupOtpAsync } from '../core/auth';
import { VerifySignupOtpNavProp } from '../types/navigation.types';
import { OtpVerificationFormValues } from '../types/otpVerification.types';
import { secondsUntil } from '../utils/helpers/otpHelpers';
import { showError, showSuccess } from '../utils/toast';
import { otpVerificationValidationSchema } from '../utils/validation/otpVerificationValidation';

export const useVerifySignupOtp = (
  navigation: VerifySignupOtpNavProp,
  email: string,
  nextResendAt?: string,
) => {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(
    () => secondsUntil(nextResendAt) || AppConstants.OTP.RESEND_COOLDOWN_SECONDS,
  );

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
  const [isResending, setIsResending] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>(Array(AppConstants.OTP.LENGTH).fill(null));

  useEffect(() => {
    if (secondsLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, AppConstants.TIME.MS_PER_SECOND);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsLeft]);

  const startCountdown = (resendAt?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(secondsUntil(resendAt) || AppConstants.OTP.RESEND_COOLDOWN_SECONDS);
  };

  const formik = useFormik<OtpVerificationFormValues>({
    initialValues: { code: '' },
    validationSchema: otpVerificationValidationSchema,
    onSubmit: async (values) => {
      const result = await verifySignupOtpAsync({ email, code: values.code });
      if (result.success) {
        showSuccess(
          t('otpVerification.verifySuccessTitle'),
          t('otpVerification.verifySuccessSubtitle'),
        );
        goToLogin();
      } else {
        showError(t('otpVerification.verifyErrorTitle'), result.error);
      }
    },
  });

  const digits = formik.values.code
    .split('')
    .concat(Array(AppConstants.OTP.LENGTH).fill(''))
    .slice(0, AppConstants.OTP.LENGTH);

  const handleDigitChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    void formik.setFieldValue('code', next.join(''));
    if (digit && index < AppConstants.OTP.LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      void formik.setFieldValue('code', next.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    const result = await resendSignupOtpAsync(email);
    setIsResending(false);
    if (result.success) {
      showSuccess(
        t('otpVerification.resendSuccessTitle'),
        t('otpVerification.resendSuccessSubtitle'),
      );
      startCountdown(result.nextResendAt);
    } else {
      showError(t('otpVerification.resendErrorTitle'), result.error);
    }
  };

  return {
    formik,
    isPending: formik.isSubmitting,
    digits,
    focusedIndex,
    inputRefs,
    secondsLeft,
    canResend: secondsLeft === 0,
    isResending,
    onDigitChange: handleDigitChange,
    onKeyPress: handleKeyPress,
    onFocus: (i: number) => setFocusedIndex(i),
    onBlur: () => setFocusedIndex(null),
    onResend: handleResend,
    onBack: goToLogin,
  };
};
