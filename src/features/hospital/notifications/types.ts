export type NotificationTone = "success" | "info" | "warning" | "error";

export interface HospitalNotification {
  id: string;
  /** Stable backend event key, e.g. "shift_accepted". */
  kind: string;
  title: string;
  /** Supporting line under the title (may be empty). */
  message: string;
  /** ISO timestamp; relative time is derived at render so it never goes stale. */
  createdAt: string;
  tone: NotificationTone;
  read: boolean;
  /** In-app route the notification relates to, when the payload names a shift. */
  href?: string;
}
