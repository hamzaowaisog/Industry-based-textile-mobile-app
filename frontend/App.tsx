import React, { useCallback, useEffect } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@stores/authStore';
import { useDeviceStore } from '@stores/deviceStore';
import { useNotificationStore } from '@stores/notificationStore';
import { useSyncStore } from '@stores/syncStore';

import { RootNavigator } from '@navigation/RootNavigator';

import { toastConfig } from '@components/common/AppToast';
import { AppBanner } from '@components/common/AppBanner';
import { AppPermissionModal } from '@components/common/AppPermissionModal';

import { useNotificationListeners } from '@hooks/useNotificationListeners';

import { BellIcon } from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { markAsRead } from '@db/queries/notifications';
import { handleDeepLink } from '@utils/helpers/notificationDeepLink';
import { getNotificationIcon } from '@utils/helpers/notificationMappers';

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
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const banner = useNotificationStore((s) => s.banner);
  const { hideBanner, decrementUnread, hydrate: hydrateNotifications } = useNotificationStore();

  const { hasBeenPrompted, registerForPush, declineNotifications, hydratePromptedFlag } = useDeviceStore();

  useNotificationListeners();

  useEffect(() => {
    if (isAuthenticated) {
      void hydrateNotifications();
      void hydratePromptedFlag();
    }
  }, [isAuthenticated, hydrateNotifications, hydratePromptedFlag]);

  const handleBannerPress = useCallback(async () => {
    if (!banner) return;
    hideBanner();
    await markAsRead(banner.id);
    decrementUnread(1);
    handleDeepLink(banner.type, banner.entityId);
  }, [banner, hideBanner, decrementUnread]);

  const bannerIcon = banner ? getNotificationIcon(banner.type) : null;

  return (
    <>
      <RootNavigator />
      <AppBanner
        visible={!!banner}
        title={banner?.title ?? ''}
        body={banner?.body ?? ''}
        Icon={bannerIcon?.Icon ?? BellIcon}
        iconColor={bannerIcon?.color ?? colors.primary}
        onPress={handleBannerPress}
        onDismiss={hideBanner}
      />
      {isAuthenticated && (
        <AppPermissionModal
          visible={!hasBeenPrompted}
          Icon={BellIcon}
          title={t('notifications.permissionTitle')}
          body={t('notifications.permissionBody')}
          primaryLabel={t('notifications.permissionAllow')}
          secondaryLabel={t('notifications.permissionNotNow')}
          onPrimary={registerForPush}
          onSecondary={declineNotifications}
        />
      )}
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
