import 'react-native-gesture-handler';
import './src/utils/reactotron';
import './src/utils/i18n';

import notifee, { AndroidImportance } from '@notifee/react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';

import { AppConstants } from './src/constants/appConstants';
import { forceLogout } from './src/utils/forceLogout';
import App from './App';

setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
  const data = remoteMessage.data as Record<string, string>;
  if (!data?.type) return;

  if (data.type === AppConstants.NOTIFICATION_TYPES.ACCOUNT_DEACTIVATED) {
    await forceLogout();
  }

  const channelId = await notifee.createChannel({
    id: 'hamzatex',
    name: 'HamzaTex Alerts',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: data.title ?? 'HamzaTex',
    body: data.body ?? '',
    android: {
      channelId,
      pressAction: { id: 'default' },
    },
  });
});

registerRootComponent(App);
