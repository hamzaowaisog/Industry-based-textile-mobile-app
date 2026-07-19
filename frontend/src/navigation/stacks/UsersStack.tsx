import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import CreateUserScreen from '../../screens/users/CreateUser';
import UserDetailScreen from '../../screens/users/UserDetail';
import UserListScreen from '../../screens/users/UserList';
import { UserStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<UserStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const UsersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.USER_LIST} component={UserListScreen} />
    <Stack.Screen name={S.USER_DETAIL} component={UserDetailScreen} />
    <Stack.Screen name={S.CREATE_USER} component={CreateUserScreen} />
  </Stack.Navigator>
);
