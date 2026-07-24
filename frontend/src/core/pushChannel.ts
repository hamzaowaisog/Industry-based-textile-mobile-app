import notifee, { AndroidImportance } from '@notifee/react-native';

import { AppConstants } from '@constants/appConstants';

/** Ensure the Android channel exists before any notification is delivered to the tray. */
export const ensurePushChannel = async (): Promise<string> => {
  return notifee.createChannel({
    id: AppConstants.PUSH.ANDROID_CHANNEL_ID,
    name: AppConstants.PUSH.ANDROID_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
  });
};

/** Displays a local system-tray notification via Notifee — used to show an OS banner while the app is foregrounded, since neither platform auto-displays FCM alerts in that state. */
export const displayLocalNotification = async (title: string, body: string): Promise<void> => {
  const channelId = await ensurePushChannel();
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
    },
  });
};
