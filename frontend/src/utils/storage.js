import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utilities for AsyncStorage
 */

export const setItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error reading data:', error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

export const clear = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

export const multiGet = async (keys) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.map(([key, value]) => [key, value ? JSON.parse(value) : null]);
  } catch (error) {
    console.error('Error reading multiple values:', error);
    return [];
  }
};

export const multiSet = async (keyValuePairs) => {
  try {
    const pairs = keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('Error saving multiple values:', error);
    return false;
  }
};
