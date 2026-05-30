import React, { useEffect } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BootSplash from 'react-native-bootsplash';
import { enableScreens } from 'react-native-screens';

import { useAuthStore } from '@stores/authStore';

import { RootNavigator } from '@navigation/RootNavigator';

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

  useEffect(() => {
    void (async () => {
      await hydrate();
      await BootSplash.hide({ fade: true });
    })();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
