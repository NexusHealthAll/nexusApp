import { useEffect } from "react";
import { Link } from "react-router-dom";
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
  success: { icon: CheckCircle2, className: "bg-success-50 text-success-600" },
  info: { icon: Clock, className: "bg-primary-50 text-primary-600" },
  warning: { icon: AlertTriangle, className: "bg-warning-50 text-warning-600" },
  error: { icon: AlertTriangle, className: "bg-error-50 text-error-600" },
};

/**
 * Dashboard "Recent Activity" feed — reads the same store as the
 * Notification Center so both stay in sync.
 */
export function RecentActivityCard() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const fetch = useNotificationsStore((s) => s.fetch);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const items = notifications.slice(0, 4);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-100 bg-white p-5">
      <h3 className="text-base font-bold text-neutral-900">Recent Activity</h3>

      {items.length === 0 && (
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
        className={cn("mt-4 flex-1 space-y-5", items.length === 0 && "hidden")}
      >
        {items.map((item) => {
          const tone =
            item.tone === "success" && item.message.toLowerCase().includes("payment")
              ? { icon: CircleDollarSign, className: "bg-success-50 text-success-600" }
              : toneIcon[item.tone];
          const Icon = tone.icon;
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  tone.className,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-neutral-800">
                  {item.message}
                </p>
                <p className="mt-1 text-xs text-neutral-400">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <Link
        to={PATHS.hospital.notifications}
        className="mt-5 flex items-center justify-center gap-1 border-t border-neutral-100 pt-4 text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
      >
        View all activity
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
