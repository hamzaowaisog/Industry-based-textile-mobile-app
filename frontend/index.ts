import 'react-native-gesture-handler';
import './src/utils/reactotron';
import './src/utils/i18n';

import notifee, { AndroidImportance } from '@notifee/react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';

import { insertNotification } from './src/db/queries/notifications';
import { generateUUID } from './src/utils/helpers/uuid';

import App from './App';

setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
  const data = remoteMessage.data as Record<string, string>;
  if (!data?.type) return;

  await insertNotification({
    id: generateUUID(),
    type: data.type,
    title: data.title ?? '',
    body: data.body ?? '',
    entityId: data.entityId ? Number(data.entityId) : undefined,
    isRead: false,
    createdAt: data.timestamp ?? new Date().toISOString(),
  });

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
