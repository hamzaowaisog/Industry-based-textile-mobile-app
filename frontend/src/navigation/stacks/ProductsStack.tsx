import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProductDetailScreen } from '@screens/products/ProductDetail';
import { ProductFormScreen } from '@screens/products/ProductForm';
import { ProductListScreen } from '@screens/products/ProductList';

import { AppConstants } from '@constants/appConstants';

import { ProductStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<ProductStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const ProductsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.PRODUCT_LIST} component={ProductListScreen} />
    <Stack.Screen name={S.PRODUCT_DETAIL} component={ProductDetailScreen} />
    <Stack.Screen name={S.PRODUCT_FORM} component={ProductFormScreen} />
  </Stack.Navigator>
);
