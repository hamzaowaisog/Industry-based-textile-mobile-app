import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { LoginComponent } from '@components/login';
import { useLogin } from '@hooks/useLogin';

import { LoginNavProp } from '../../types/navigation.types';

export const LoginScreen = () => {
  const navigation = useNavigation<LoginNavProp>();
  const props = useLogin(navigation);

  return <LoginComponent {...props} />;
};
