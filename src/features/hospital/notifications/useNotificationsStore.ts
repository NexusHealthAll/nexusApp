import { create } from "zustand";
import { NotificationsService } from "./notificationsService";
import type { HospitalNotification } from "./types";

interface NotificationsState {
  notifications: HospitalNotification[];
  hasFetched: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

/**
 * Shared notification feed — powers both the top-bar bell badge and the
 * Notification Center page so the unread count stays in sync between them.
 */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  hasFetched: false,
  fetch: async () => {
    if (get().hasFetched) return;
    const notifications = await NotificationsService.getNotifications();
    set({ notifications, hasFetched: true });
  },
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));

export function useUnreadNotificationCount(): number {
  return useNotificationsStore(
    (s) => s.notifications.filter((n) => !n.read).length,
  );
}
