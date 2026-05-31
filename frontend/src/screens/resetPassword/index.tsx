import React from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';

import { ResetPasswordComponent } from '@components/resetPassword';
import { useResetPassword } from '@hooks/useResetPassword';

import { ResetPasswordNavProp, ResetPasswordRouteProp } from '../../types/navigation.types';

export const ResetPasswordScreen = () => {
  const navigation = useNavigation<ResetPasswordNavProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { email, resetToken } = route.params;

  const handlers = useResetPassword(navigation, email, resetToken);

  return <ResetPasswordComponent {...handlers} />;
};
