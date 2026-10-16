import { useEffect } from "react";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Button } from "@/shared/components/ui/Button";
import { formatRelativeTime } from "@/shared/utils/date";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
} from "lucide-react";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import { useNotificationsStore } from "@/features/hospital/notifications/useNotificationsStore";
import type { NotificationTone } from "@/features/hospital/notifications/types";

const toneIcon: Record<
  NotificationTone,
  { icon: typeof CheckCircle2; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className:
      "bg-success-50 text-success-600 dark:bg-success-950 dark:text-success-300",
  },
  info: {
    icon: Clock,
    className:
      "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "bg-warning-50 text-warning-600 dark:bg-warning-950 dark:text-warning-300",
  },
  error: {
    icon: AlertTriangle,
    className:
      "bg-error-50 text-error-600 dark:bg-error-950 dark:text-error-300",
  },
};

/**
 * Dashboard "Recent Activity" feed — reads the same store as the
 * Notification Center so both stay in sync.
 */
export function RecentActivityCard() {
  const navigate = useNavigate();
  const notifications = useNotificationsStore((s) => s.notifications);
  const status = useNotificationsStore((s) => s.status);
  const fetch = useNotificationsStore((s) => s.fetch);
  const markRead = useNotificationsStore((s) => s.markRead);
  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    fetch();
  }, [fetch]);

  const items = notifications.slice(0, 4);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
        Recent Activity
      </h3>

      {isLoading && (
        <ul
          aria-busy="true"
          aria-label="Loading activity"
          className="mt-4 flex-1 space-y-5"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-start gap-3">
              <Skeleton className="mt-0.5 h-8 w-8 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-16" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {status === "error" && (
        <div className="mt-4 flex-1">
          <EmptyState
            icon={<EmptyStateIcon icon={AlertTriangle} tone="warning" />}
            title="Couldn't load activity"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetch({ force: true })}
              >
                Try again
              </Button>
            }
            className="min-h-[160px] border-0"
          />
        </div>
      )}

      {status === "ready" && items.length === 0 && (
        <div className="mt-4 flex-1">
          <EmptyState
            icon={<EmptyStateIcon icon={Bell} tone="primary" />}
            title="No activity yet"
            description="Shift acceptances, clock-ins, and payments will show up here as your shifts run."
            className="min-h-[160px] border-0"
          />
        </div>
      )}

      <ul
        className={cn(
          "mt-4 flex-1 space-y-5",
          (status !== "ready" || items.length === 0) && "hidden",
        )}
      >
        {items.map((item) => {
          const tone =
            item.tone === "success" &&
            `${item.title} ${item.message}`.toLowerCase().includes("payment")
              ? {
                  icon: CircleDollarSign,
                  className:
                    "bg-success-50 text-success-600 dark:bg-success-950 dark:text-success-300",
                }
              : toneIcon[item.tone];
          const Icon = tone.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  void markRead(item.id);
                  if (item.href) navigate(item.href);
                }}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                    tone.className,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm leading-snug text-neutral-800 dark:text-neutral-200",
                      item.read ? "font-normal" : "font-semibold",
                    )}
                  >
                    {item.title}
                  </p>
                  {item.message && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <Link
        to={PATHS.hospital.notifications}
        className="mt-5 flex items-center justify-center gap-1 border-t border-neutral-100 pt-4 text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-50"
      >
        View all activity
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
