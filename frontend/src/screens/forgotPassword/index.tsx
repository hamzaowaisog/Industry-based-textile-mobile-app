import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { ForgotPasswordComponent } from '@components/forgotPassword';
import { useForgotPassword } from '@hooks/useForgotPassword';

import { ForgotPasswordNavProp } from '../../types/navigation.types';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordNavProp>();
  const forgotPasswordProps = useForgotPassword(navigation);

  return <ForgotPasswordComponent {...forgotPasswordProps} />;
};
