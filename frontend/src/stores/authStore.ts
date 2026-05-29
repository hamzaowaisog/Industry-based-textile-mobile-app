import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { AuthState } from '@types/store.types';

interface AuthStore extends AuthState {
  setAuth: (user: Omit<AuthState, 'isAuthenticated'>) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  roleId: null,
  userName: null,
  isAuthenticated: false,

  setAuth: (user) =>
    set({
      ...user,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      userId: null,
      roleId: null,
      userName: null,
      isAuthenticated: false,
    }),

  hydrate: async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const userId = await SecureStore.getItemAsync('userId');
    const roleId = await SecureStore.getItemAsync('roleId');
    const userName = await SecureStore.getItemAsync('userName');

    if (accessToken && userId && roleId && userName) {
      set({
        userId: Number(userId),
        roleId: Number(roleId),
        userName,
        isAuthenticated: true,
      });
    }
  },
}));
