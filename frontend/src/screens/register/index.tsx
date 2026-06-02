import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { RegisterComponent } from '@components/register';
import { useRegister } from '@hooks/useRegister';

import { RegisterNavProp } from '../../types/navigation.types';

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const props = useRegister(navigation);

  return <RegisterComponent {...props} />;
};
