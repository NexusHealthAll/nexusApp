export type NotificationTone = "success" | "info" | "warning" | "error";

export interface HospitalNotification {
  id: string;
  message: string;
  /** Human-readable relative time, e.g. "8 minutes ago". */
  time: string;
  tone: NotificationTone;
  read: boolean;
}
