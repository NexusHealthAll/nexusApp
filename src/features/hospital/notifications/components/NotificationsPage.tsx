import { useEffect, useMemo, useState } from "react";
import { BellRing } from "lucide-react";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { cn } from "@/shared/utils/cn";
import {
  useNotificationsStore,
  useUnreadNotificationCount,
} from "../useNotificationsStore";
import type { NotificationTone } from "../types";

type NotificationTab = "all" | "unread" | "read";

const toneDot: Record<NotificationTone, { dot: string; bg: string }> = {
  success: { dot: "bg-success-500", bg: "bg-success-50" },
  info: { dot: "bg-primary-400", bg: "bg-primary-50" },
  warning: { dot: "bg-warning-400", bg: "bg-warning-50" },
  error: { dot: "bg-error-500", bg: "bg-error-50" },
};

/** Notification Center page per the Figma "Preliminaries" frames. */
export function NotificationsPage() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const fetch = useNotificationsStore((s) => s.fetch);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const unreadCount = useUnreadNotificationCount();

  const [tab, setTab] = useState<NotificationTab>("all");

  useEffect(() => {
    fetch();
  }, [fetch]);

  const visible = useMemo(() => {
    switch (tab) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "read":
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }, [notifications, tab]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
          Notification Center
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      <UnderlineTabs<NotificationTab>
        className="mt-6"
        options={[
          { label: "All", value: "all" },
          {
            label: unreadCount > 0 ? `Unread (${unreadCount})` : "Unread",
            value: "unread",
          },
          { label: "Read", value: "read" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {visible.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<EmptyStateIcon icon={BellRing} tone="primary" />}
            title={
              notifications.length === 0
                ? "You're all caught up"
                : "Nothing here"
            }
            description={
              notifications.length === 0
                ? "Shift applications, clock-ins, payments, and system updates will land here."
                : "Notifications matching this filter will appear here."
            }
          />
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {visible.map((notification) => {
            const tone = toneDot[notification.tone];
            return (
              <li key={notification.id}>
                <button
                  onClick={() => markRead(notification.id)}
                  className="flex w-full items-center gap-4 px-1 py-5 text-left transition-colors hover:bg-neutral-50/60"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                      tone.bg,
                    )}
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full", tone.dot)}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        notification.read
                          ? "text-neutral-500"
                          : "font-semibold text-neutral-900",
                      )}
                    >
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {notification.time}
                    </p>
                  </span>
                  {!notification.read && (
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
