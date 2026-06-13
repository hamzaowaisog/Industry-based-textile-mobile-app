import React from 'react';

import { NotificationsComponent } from '@components/notifications';
import { useNotifications } from '@hooks/useNotifications';

export const NotificationCenterScreen = () => {
  const hook = useNotifications();
  return (
    <NotificationsComponent
      items={hook.items}
      isLoading={hook.isLoading}
      unreadCount={hook.unreadCount}
      onBack={hook.onBack}
      onMarkAllRead={hook.onMarkAllRead}
      onRowPress={hook.onRowPress}
      onRowDelete={hook.onRowDelete}
    />
  );
};
