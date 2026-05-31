import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { BiometricComponent } from '@components/biometric';

import { useBiometric } from '@hooks/useBiometric';

import { BiometricNavProp } from '../../types/navigation.types';

export const BiometricScreen = () => {
  const navigation = useNavigation<BiometricNavProp>();
  const hookValues = useBiometric(navigation);

  return <BiometricComponent {...hookValues} />;
};
