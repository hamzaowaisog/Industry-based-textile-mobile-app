import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TermsComponent } from '@components/terms';
import { AuthStackParamList } from '@types/navigation.types';

export const TermsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Terms'>>();

  return <TermsComponent onBack={() => navigation.goBack()} />;
};
