import { create } from "zustand";
import { appToast } from "@/shared/components/feedback/toast";
import { NotificationsService } from "./notificationsService";
import type { HospitalNotification } from "./types";

type FeedStatus = "idle" | "loading" | "ready" | "error";

interface NotificationsState {
  notifications: HospitalNotification[];
  /** Server-side unread count (can exceed the loaded list). */
  unreadCount: number;
  status: FeedStatus;
  /** A background refetch is running while existing items stay on screen. */
  isRefreshing: boolean;
  isMarkingAll: boolean;
  /** Loads the feed once; pass `force` to refetch. */
  fetch: (opts?: { force?: boolean }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

/**
 * Shared notification feed — powers the top-bar bell badge, the dashboard
 * Recent Activity card and the Notification Center so they stay in sync.
 */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  status: "idle",
  isRefreshing: false,
  isMarkingAll: false,

  fetch: async ({ force = false } = {}) => {
    const { status, isRefreshing } = get();
    if (status === "loading" || isRefreshing) return;
    if (status === "ready" && !force) return;

    const hasData = status === "ready";
    set(hasData ? { isRefreshing: true } : { status: "loading" });
    try {
      const feed = await NotificationsService.getNotifications();
      set({
        notifications: feed.notifications,
        unreadCount: feed.unreadCount,
        status: "ready",
        isRefreshing: false,
      });
    } catch (err) {
      // A failed background refresh keeps what's on screen; only a first load errors out.
      set({ status: hasData ? "ready" : "error", isRefreshing: false });
      if (hasData) appToast.fromError(err, "Couldn't refresh notifications");
    }
  },

  markRead: async (id) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target || target.read) return;
    const apply = (read: boolean, delta: number) =>
      set((s) => ({
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read } : n)),
        unreadCount: Math.max(0, s.unreadCount + delta),
      }));
    apply(true, -1);
    try {
      await NotificationsService.markRead(id);
    } catch (err) {
      apply(false, 1);
      appToast.fromError(err, "Couldn't mark as read");
    }
  },

  markAllRead: async () => {
    const unread = get().notifications.filter((n) => !n.read);
    if (unread.length === 0 || get().isMarkingAll) return;
    set((s) => ({
      isMarkingAll: true,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: Math.max(0, s.unreadCount - unread.length),
    }));
    const results = await Promise.allSettled(
      unread.map((n) => NotificationsService.markRead(n.id)),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    set({ isMarkingAll: false });
    if (failed > 0) {
      appToast.error(
        "Some notifications weren't updated",
        `${failed} of ${unread.length} couldn't be marked as read.`,
      );
    }
    // Reconcile with the server (restores any that failed, picks up new ones).
    await get().fetch({ force: true });
  },
}));

export function useUnreadNotificationCount(): number {
  return useNotificationsStore((s) => s.unreadCount);
}
