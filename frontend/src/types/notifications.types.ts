import type { ComponentType } from 'react';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  entityId?: number;
  isRead: boolean;
  createdAt: string;
};

export type BannerPayload = {
  id: string;
  type: string;
  title: string;
  body: string;
  entityId?: number;
};

export type NotificationStore = {
  unreadCount: number;
  banner: BannerPayload | null;
  hydrate: () => Promise<void>;
  incrementUnread: () => void;
  decrementUnread: (n: number) => void;
  resetUnread: () => void;
  showBanner: (payload: BannerPayload) => void;
  hideBanner: () => void;
};

export type DeviceStore = {
  pushToken: string | null;
  notificationsEnabled: boolean;
  hasBeenPrompted: boolean;
  registerForPush: () => Promise<void>;
  declineNotifications: () => Promise<void>;
  unregisterFromPush: () => Promise<void>;
  unregisterAllDevices: () => Promise<void>;
  checkPermissionStatus: () => Promise<void>;
  hydratePromptedFlag: () => Promise<void>;
};

export type IconProps = { size?: number; color?: string; strokeWidth?: number };

export type NotificationIconConfig = {
  Icon: ComponentType<IconProps>;
  color: string;
};

export type NotificationRowProps = {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  onDelete: (id: string) => void;
};

export type NotificationCenterComponentProps = {
  items: NotificationItem[];
  isLoading: boolean;
  unreadCount: number;
  onBack: () => void;
  onMarkAllRead: () => void;
  onRowPress: (item: NotificationItem) => void;
  onRowDelete: (id: string) => void;
};

export type MoreItemConfig = {
  key: string;
  labelKey: string;
  Icon: ComponentType<IconProps>;
  color: string;
  destination: string;
  adminOnly?: boolean;
  tag?: string;
};

export type MoreTileProps = {
  item: MoreItemConfig;
  onPress: (destination: string) => void;
  badge?: number;
};

export type MoreProfileData = {
  initials: string;
  name: string;
  email: string;
  roleName: string;
};

export type MoreComponentProps = {
  items: MoreItemConfig[];
  profile: MoreProfileData;
  unreadCount: number;
  onBack: () => void;
  onTilePress: (destination: string) => void;
};
