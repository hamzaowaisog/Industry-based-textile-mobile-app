import React from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';

import { OtpVerificationComponent } from '@components/otpVerification';
import { useOtpVerification } from '@hooks/useOtpVerification';

import { VerifyOtpNavProp, VerifyOtpRouteProp } from '../../types/navigation.types';

export const OtpVerificationScreen = () => {
  const navigation = useNavigation<VerifyOtpNavProp>();
  const route = useRoute<VerifyOtpRouteProp>();
  const { email, nextResendAt } = route.params;

  const handlers = useOtpVerification(navigation, email, nextResendAt);

  return <OtpVerificationComponent {...handlers} email={email} />;
};
