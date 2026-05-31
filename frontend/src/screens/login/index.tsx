import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LoginComponent } from '@components/login';

import { useLogin } from '@hooks/useLogin';

import { AuthStackParamList } from '../../types/navigation.types';

export const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const props = useLogin(navigation);

  return <LoginComponent {...props} />;
};
