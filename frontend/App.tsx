import 'react-native-get-random-values';

import React, { useEffect } from 'react';

import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BootSplash from 'react-native-bootsplash';
import Toast from 'react-native-toast-message';
import { enableScreens } from 'react-native-screens';

import { toastConfig } from '@components/common/AppToast';
import { RootNavigator } from '@navigation/RootNavigator';
import { useAuthStore } from '@stores/authStore';
import { useSyncStore } from '@stores/syncStore';

enableScreens();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const setIsOnline = useSyncStore((s) => s.setIsOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
    });
    return () => unsubscribe();
  }, [setIsOnline]);

  useEffect(() => {
    void (async () => {
      await hydrate();
      await BootSplash.hide({ fade: true });
    })();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <Toast config={toastConfig} position="bottom" bottomOffset={40} />
    </QueryClientProvider>
  );
}
