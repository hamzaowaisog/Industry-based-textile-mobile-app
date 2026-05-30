import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PrivacyComponent } from '@components/privacy';
import { AuthStackParamList } from '@types/navigation.types';

export const PrivacyScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Privacy'>>();

  return <PrivacyComponent onBack={() => navigation.goBack()} />;
};
