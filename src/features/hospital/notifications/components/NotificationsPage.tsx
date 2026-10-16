import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BellRing, CheckCheck, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { cn } from "@/shared/utils/cn";
import { formatRelativeTime } from "@/shared/utils/date";
import {
  useNotificationsStore,
  useUnreadNotificationCount,
} from "../useNotificationsStore";
import type { HospitalNotification, NotificationTone } from "../types";

type NotificationTab = "all" | "unread" | "read";

const PAGE_SIZE = 8;

const toneDot: Record<NotificationTone, { dot: string; bg: string }> = {
  success: { dot: "bg-success-500", bg: "bg-success-50 dark:bg-success-950" },
  info: { dot: "bg-primary-400", bg: "bg-primary-50 dark:bg-primary-950" },
  warning: { dot: "bg-warning-400", bg: "bg-warning-50 dark:bg-warning-950" },
  error: { dot: "bg-error-500", bg: "bg-error-50 dark:bg-error-950" },
};

function dayGroup(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(today) - startOfDay(d)) / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

function NotificationsSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading notifications" className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 px-1 py-5">
          <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-56 max-w-full" />
            <Skeleton className="h-3 w-80 max-w-full" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Notification Center: live feed with tabs, day grouping, pagination and mark-as-read. */
export function NotificationsPage() {
  const navigate = useNavigate();
  const notifications = useNotificationsStore((s) => s.notifications);
  const status = useNotificationsStore((s) => s.status);
  const isRefreshing = useNotificationsStore((s) => s.isRefreshing);
  const isMarkingAll = useNotificationsStore((s) => s.isMarkingAll);
  const fetch = useNotificationsStore((s) => s.fetch);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const unreadCount = useUnreadNotificationCount();

  const [tab, setTab] = useState<NotificationTab>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

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

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const groups = useMemo(() => {
    const out: { label: string; items: HospitalNotification[] }[] = [];
    for (const n of pageRows) {
      const label = dayGroup(n.createdAt);
      const last = out[out.length - 1];
      if (last?.label === label) last.items.push(n);
      else out.push({ label, items: [n] });
    }
    return out;
  }, [pageRows]);

  const open = (n: HospitalNotification) => {
    void markRead(n.id);
    if (n.href) navigate(n.href);
  };

  const isLoading = status === "idle" || status === "loading";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl dark:text-neutral-50">
          Notification Center
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetch({ force: true })}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh notifications"
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              disabled={isMarkingAll}
              className="flex items-center gap-1.5 text-sm font-semibold"
            >
              <CheckCheck className="h-4 w-4" />
              {isMarkingAll ? "Marking…" : "Mark all as read"}
            </Button>
          )}
        </div>
      </div>

      <UnderlineTabs<NotificationTab>
        className="mt-6"
        options={[
          { label: "All", value: "all" },
          {
            label: "Unread",
            value: "unread",
            count: isLoading ? undefined : unreadCount,
          },
          { label: "Read", value: "read" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {isLoading ? (
        <NotificationsSkeleton />
      ) : status === "error" ? (
        <div className="mt-10">
          <EmptyState
            icon={<EmptyStateIcon icon={AlertCircle} tone="warning" />}
            title="Couldn't load notifications"
            description="Check your connection and try again."
            action={
              <Button size="sm" onClick={() => fetch({ force: true })}>
                Try again
              </Button>
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<EmptyStateIcon icon={BellRing} tone="primary" />}
            title={
              notifications.length === 0
                ? "You're all caught up"
                : tab === "unread"
                  ? "No unread notifications"
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
        <>
          {groups.map((group) => (
            <section key={group.label} className="mt-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {group.label}
              </h2>
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {group.items.map((notification) => {
                  const tone = toneDot[notification.tone];
                  return (
                    <li key={notification.id}>
                      <button
                        onClick={() => open(notification)}
                        className="flex w-full items-center gap-4 px-1 py-5 text-left transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/60"
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                            tone.bg,
                          )}
                        >
                          <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm leading-snug",
                              notification.read
                                ? "text-neutral-500 dark:text-neutral-500"
                                : "font-semibold text-neutral-900 dark:text-neutral-50",
                            )}
                          >
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="mt-0.5 text-sm leading-snug text-neutral-500 dark:text-neutral-400">
                              {notification.message}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </span>
                        {!notification.read && (
                          <span
                            aria-label="Unread"
                            className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-600"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <Pagination
            className="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800"
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
            summary={`Showing ${pageRows.length} of ${visible.length} notification${visible.length === 1 ? "" : "s"}`}
          />
        </>
      )}
    </div>
  );
}
