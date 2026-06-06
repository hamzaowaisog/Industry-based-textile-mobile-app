import React, { useEffect } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';

import { useAuthStore } from '@stores/authStore';
import { useDeviceStore } from '@stores/deviceStore';
import { useNotificationStore } from '@stores/notificationStore';
import { useSyncStore } from '@stores/syncStore';

import { RootNavigator } from '@navigation/RootNavigator';

import { toastConfig } from '@components/common/AppToast';
import { NotificationBanner } from '@components/common/NotificationBanner';
import { NotificationPermissionModal } from '@components/common/NotificationPermissionModal';

import { useNotificationListeners } from '@hooks/useNotificationListeners';

enableScreens();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const AppInner = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrateNotifications = useNotificationStore((s) => s.hydrate);
  const hydratePromptedFlag = useDeviceStore((s) => s.hydratePromptedFlag);

  useNotificationListeners();

  useEffect(() => {
    if (isAuthenticated) {
      void hydrateNotifications();
      void hydratePromptedFlag();
    }
  }, [isAuthenticated, hydrateNotifications, hydratePromptedFlag]);

  return (
    <>
      <RootNavigator />
      <NotificationBanner />
      {isAuthenticated && <NotificationPermissionModal />}
      <Toast config={toastConfig} position="bottom" bottomOffset={40} />
    </>
  );
};

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <AppInner />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
