import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';
import { useAuthStore } from '@stores/authStore';
import { BiometricScreen } from '@screens/biometric';
import { ForgotPasswordScreen } from '@screens/forgotPassword';
import { LoginScreen } from '@screens/login';
import { OnboardingScreen } from '@screens/onboarding';
import { OtpVerificationScreen } from '@screens/otpVerification';
import { PrivacyScreen } from '@screens/privacy';
import { RegisterScreen } from '@screens/register';
import { ResetPasswordScreen } from '@screens/resetPassword';
import { TermsScreen } from '@screens/terms';
import { VerifySignupOtpScreen } from '@screens/verifySignupOtp';
import { WelcomeScreen } from '@screens/welcome';
import { AuthStackParamList } from '../types/navigation.types';

const S = AppConstants.SCREENS.AUTH;
const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const isBiometricEnabled = useAuthStore((s) => s.isBiometricEnabled);

  const getInitialRoute = (): keyof AuthStackParamList => {
    if (!onboardingCompleted) return S.WELCOME;
    if (isBiometricEnabled) return S.BIOMETRIC;
    return S.LOGIN;
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{ headerShown: false, fullScreenGestureEnabled: false, gestureEnabled: false }}
    >
      <Stack.Screen name={S.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={S.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={S.TERMS} component={TermsScreen} />
      <Stack.Screen name={S.PRIVACY} component={PrivacyScreen} />
      <Stack.Screen name={S.BIOMETRIC} component={BiometricScreen} />
      <Stack.Screen name={S.LOGIN} component={LoginScreen} />
      <Stack.Screen name={S.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      <Stack.Screen name={S.VERIFY_OTP} component={OtpVerificationScreen} />
      <Stack.Screen name={S.RESET_PASSWORD} component={ResetPasswordScreen} />
      <Stack.Screen name={S.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={S.VERIFY_SIGNUP_OTP} component={VerifySignupOtpScreen} />
    </Stack.Navigator>
  );
};
