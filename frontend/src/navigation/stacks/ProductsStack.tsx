import React from 'react';

import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import { ProductStackParamList } from '../../types/navigation.types';
import { placeholderStyles } from './placeholderStyles';

const Stack = createNativeStackNavigator<ProductStackParamList>();
const S = AppConstants.SCREENS.MAIN;

const Placeholder = () => <View style={placeholderStyles.container} />;

export const ProductsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.PRODUCT_LIST} component={Placeholder} />
    <Stack.Screen name={S.PRODUCT_DETAIL} component={Placeholder} />
    <Stack.Screen name={S.PRODUCT_FORM} component={Placeholder} />
  </Stack.Navigator>
);
