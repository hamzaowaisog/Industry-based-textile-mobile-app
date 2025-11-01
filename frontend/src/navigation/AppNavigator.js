import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import AddItemScreen from '../screens/AddItemScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Hamza Tex' }}
      />
      <Stack.Screen 
        name="ItemDetails" 
        component={ItemDetailsScreen} 
        options={{ title: 'Item Details' }}
      />
      <Stack.Screen 
        name="AddItem" 
        component={AddItemScreen} 
        options={{ title: 'Add New Item' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
