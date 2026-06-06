import { create } from 'zustand';

import { getUnreadCount } from '@db/queries/notifications';
import type { BannerPayload, NotificationStore } from '../types/notifications.types';

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  banner: null,

  hydrate: async () => {
    const count = await getUnreadCount();
    set({ unreadCount: count });
  },

  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

  decrementUnread: (n: number) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - n) })),

  resetUnread: () => set({ unreadCount: 0 }),

  showBanner: (payload: BannerPayload) => set({ banner: payload }),

  hideBanner: () => set({ banner: null }),
}));
