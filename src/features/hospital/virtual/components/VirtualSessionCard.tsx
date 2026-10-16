import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { cn } from "@/shared/utils/cn";
import { shiftStatusDisplay } from "@/features/hospital/shifts/shiftStatusDisplay";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { getCallWindowInfo } from "../callWindow";

const SESSION_STEPS = [
  "Checked In",
  "Device Connected",
  "Doctor Joined",
  "Completed",
] as const;

/** How many of the four visit steps are done, derived from real shift state. */
function sessionProgress(shift: ApiShift): number {
  if (shift.status === "completed") return 4;
  if (shift.status === "in_progress") return 3;
  return getCallWindowInfo(shift).state === "open" ? 1 : 0;
}

interface VirtualSessionCardProps {
  shift: ApiShift;
  href: string;
}

export function VirtualSessionCard({ shift, href }: VirtualSessionCardProps) {
  const status = shiftStatusDisplay[shift.status];
  const done = sessionProgress(shift);
  const callWindow = getCallWindowInfo(shift);
  const scheduledLabel = new Date(shift.scheduled_start).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const subtitle = [shift.department ?? "Virtual Visit", scheduledLabel].join(" · ");

  return (
    <Link
      to={href}
      className="block rounded-2xl border border-neutral-100 bg-white p-5 transition-shadow hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600 dark:bg-secondary-950 dark:text-secondary-400">
          <Video className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-neutral-900 dark:text-neutral-50">
            {shift.role_title}
            {shift.specialty ? ` · ${shift.specialty}` : ""}
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-400 dark:text-neutral-500">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          <Badge variant={status.variant}>{status.label}</Badge>
          {callWindow.state === "open" && (
            <Badge variant="success" className="uppercase tracking-wide">
              Ready to Join
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-5">
        <ol className="flex items-center justify-between gap-2">
          {SESSION_STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-semibold",
                i < done
                  ? "text-secondary-700 dark:text-secondary-300"
                  : "text-neutral-300 dark:text-neutral-600",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i < done ? "bg-secondary-500" : "bg-neutral-200 dark:bg-neutral-700",
                )}
              />
              <span className="hidden sm:inline">{label}</span>
            </li>
          ))}
        </ol>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={done}
          className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
        >
          <div
            className="h-full rounded-full bg-secondary-500 transition-all"
            style={{ width: `${(done / SESSION_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
