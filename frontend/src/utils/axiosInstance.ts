import axios, { AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { AppConstants } from '@constants/appConstants';

import { forceLogout } from './forceLogout';

const API_URL: string = Constants.expoConfig?.extra?.apiUrl;
console.log('[axiosInstance] API_URL =', API_URL);

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN);
  if (!refreshToken) throw new Error('No refresh token available');

  const { data } = await axios.post(`${API_URL}/api/Auth/refresh`, { refreshToken });
  await SecureStore.setItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN, data.data.token);
  await SecureStore.setItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN, data.data.refreshToken);
  client.defaults.headers.common.Authorization = `Bearer ${data.data.token}`;
  return data.data.token;
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config;
    if (error.response?.status === AppConstants.HTTP.UNAUTHORIZED && !original._retry) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return client(original as AxiosRequestConfig);
      } catch {
        await forceLogout();
      }
    }
    return Promise.reject(error);
  },
);

// Named export required by Orval mutator
export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return client(config).then(({ data }) => data);
};
