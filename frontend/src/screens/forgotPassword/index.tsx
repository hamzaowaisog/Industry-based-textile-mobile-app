import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ForgotPasswordComponent } from '@components/forgotPassword';
import { useForgotPassword } from '@hooks/useForgotPassword';

import { AuthStackParamList } from '../../types/navigation.types';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>>();
  const forgotPasswordProps = useForgotPassword(navigation);

  return <ForgotPasswordComponent {...forgotPasswordProps} />;
};
