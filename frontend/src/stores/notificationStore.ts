import { create } from 'zustand';

import { notificationGetUnreadCount } from '@api/generated/notification/notification';

import type { BannerPayload, NotificationStore } from '../types/notifications.types';

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  banner: null,

  hydrate: async () => {
    try {
      const res = await notificationGetUnreadCount();
      const r = res as unknown as { success?: boolean; data?: { count?: number } };
      const count = r?.data?.count ?? 0;
      set({ unreadCount: count });
    } catch {
      // silent failure — badge will show 0
    }
  },

  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

  decrementUnread: (n: number) => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - n) })),

  resetUnread: () => set({ unreadCount: 0 }),

  showBanner: (payload: BannerPayload) => set({ banner: payload }),

  hideBanner: () => set({ banner: null }),
}));
