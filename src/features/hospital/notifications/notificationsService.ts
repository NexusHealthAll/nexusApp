import apiClient from "@/lib/apiClient";
import { PATHS } from "@/routes/paths";
import type { HospitalNotification, NotificationTone } from "./types";

/** Mirror of nexus-backend `models::notification::Notification`. */
interface ApiNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

interface ApiNotificationPage {
  notifications: ApiNotification[];
  unread_count: number;
}

export interface NotificationFeed {
  notifications: HospitalNotification[];
  unreadCount: number;
}

/** The backend clamps `limit` to 100. */
const FEED_LIMIT = 100;

function toneForKind(kind: string): NotificationTone {
  const k = kind.toLowerCase();
  if (/(fail|error|reject|reversal|cancel)/.test(k)) return "error";
  if (/(declin|dispute|reminder|expire|late|no_show)/.test(k)) return "warning";
  if (/(accept|clockin|clock_in|approved|paid|payout|payment|complete|released)/.test(k)) {
    return "success";
  }
  return "info";
}

function hrefFor(kind: string, data: Record<string, unknown> | null): string | undefined {
  const shiftId = typeof data?.shift_id === "string" ? data.shift_id : null;
  if (!shiftId) return undefined;
  return kind.toLowerCase().includes("handover")
    ? PATHS.hospital.handoverReportDetail(shiftId)
    : PATHS.hospital.shiftDetail(shiftId);
}

function toNotification(n: ApiNotification): HospitalNotification {
  return {
    id: n.id,
    kind: n.kind,
    title: n.title,
    message: n.body,
    createdAt: n.created_at,
    tone: toneForKind(n.kind),
    read: n.read_at !== null,
    href: hrefFor(n.kind, n.data),
  };
}

/**
 * Notification feed for the Notification Center, the dashboard's Recent
 * Activity card and the top-bar bell — backed by `GET /api/v1/notifications`
 * (newest first, with the server-side unread badge count) and
 * `POST /api/v1/notifications/{id}/read`. The backend has no "mark all read"
 * endpoint, so that is done per notification.
 */
export const NotificationsService = {
  async getNotifications(): Promise<NotificationFeed> {
    const res = await apiClient.get<ApiNotificationPage>("/api/v1/notifications", {
      params: { limit: FEED_LIMIT, offset: 0 },
    });
    return {
      notifications: res.data.notifications.map(toNotification),
      unreadCount: res.data.unread_count,
    };
  },

  async markRead(id: string): Promise<void> {
    await apiClient.post(`/api/v1/notifications/${encodeURIComponent(id)}/read`);
  },
};
