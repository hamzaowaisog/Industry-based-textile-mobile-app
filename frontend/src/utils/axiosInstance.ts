import axios, { AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL: string = Constants.expoConfig?.extra?.apiUrl;
console.log('[axiosInstance] API_URL =', API_URL);

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) return Promise.reject(error);
      try {
        const { data } = await axios.post(`${API_URL}/api/Auth/refresh`, { refreshToken });
        await SecureStore.setItemAsync('accessToken', data.data.token);
        await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
        client.defaults.headers.common.Authorization = `Bearer ${data.data.token}`;
        return client(original as AxiosRequestConfig);
      } catch {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }
    return Promise.reject(error);
  },
);

// Named export required by Orval mutator
export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return client(config).then(({ data }) => data);
};
