import type { HospitalNotification } from "./types";

/**
 * Notification feed for the Notification Center and the top-bar bell.
 *
 * The backend currently exposes no notifications endpoint (see nexus-backend
 * routes), so this returns a real empty list — the UI shows empty states —
 * until one exists. Swap `getNotifications` for the real API call then; the
 * store and UI only depend on the `HospitalNotification` shape.
 */
export const NotificationsService = {
  async getNotifications(): Promise<HospitalNotification[]> {
    return [];
  },
};
