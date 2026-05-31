import React from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';

import { OtpVerificationComponent } from '@components/otpVerification';
import { useVerifySignupOtp } from '@hooks/useVerifySignupOtp';

import { VerifySignupOtpNavProp, VerifySignupOtpRouteProp } from '../../types/navigation.types';

export const VerifySignupOtpScreen = () => {
  const navigation = useNavigation<VerifySignupOtpNavProp>();
  const route = useRoute<VerifySignupOtpRouteProp>();
  const { email, nextResendAt } = route.params;
  const props = useVerifySignupOtp(navigation, email, nextResendAt);

  return <OtpVerificationComponent email={email} {...props} />;
};
