import 'react-native-gesture-handler';
import './src/utils/reactotron';
import './src/utils/i18n';

import notifee, { AndroidImportance } from '@notifee/react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';

import { AppConstants } from './src/constants/appConstants';
import { ensurePushChannel } from './src/core/pushChannel';
import { forceLogout } from './src/utils/forceLogout';
import App from './App';

void ensurePushChannel();

setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
  const data = remoteMessage.data as Record<string, string>;
  if (!data?.type) return;

  if (data.type === AppConstants.NOTIFICATION_TYPES.ACCOUNT_DEACTIVATED) {
    await forceLogout();
  }

  // Alert+data messages are shown by the OS when backgrounded/killed.
  // Only display via Notifee for legacy data-only payloads.
  if (remoteMessage.notification?.title || remoteMessage.notification?.body) {
    return;
  }

  const channelId = await ensurePushChannel();

  await notifee.displayNotification({
    title: data.title ?? 'HamzaTex',
    body: data.body ?? '',
    android: {
      channelId,
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
    },
  });
});

registerRootComponent(App);
