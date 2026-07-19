import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddStockMoveScreen from '@screens/stockMovements/AddStockMove';
import EditStockMoveScreen from '@screens/stockMovements/EditStockMove';
import StockMoveDetailScreen from '@screens/stockMovements/StockMoveDetail';
import StockMoveListScreen from '@screens/stockMovements/StockMoveList';

import { AppConstants } from '@constants/appConstants';

import { StockStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<StockStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const StockStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.STOCK_MOVE_LIST} component={StockMoveListScreen} />
    <Stack.Screen name={S.STOCK_MOVE_DETAIL} component={StockMoveDetailScreen} />
    <Stack.Screen name={S.ADD_STOCK_MOVE} component={AddStockMoveScreen} />
    <Stack.Screen name={S.EDIT_STOCK_MOVE} component={EditStockMoveScreen} />
  </Stack.Navigator>
);
