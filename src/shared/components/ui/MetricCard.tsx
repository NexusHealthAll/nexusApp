import type { ComponentType, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type MetricTone = "secondary" | "primary" | "success" | "warning" | "error";

interface MetricCardProps {
  /** Small uppercase label, e.g. "WEEKLY REVENUE". */
  label: string;
  value: ReactNode;
  /** Line under the value — plain text or rich node (e.g. trend). */
  sub?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  /** Tint of the icon bubble and optionally the value. */
  tone?: MetricTone;
  /** Tint the value itself (design highlights urgent counts). */
  valueTone?: MetricTone | "default";
  className?: string;
}

const iconTones: Record<MetricTone, string> = {
  secondary: "bg-secondary-50 text-secondary-600",
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  error: "bg-error-50 text-error-600",
};

const valueTones: Record<NonNullable<MetricCardProps["valueTone"]>, string> = {
  default: "text-neutral-900",
  secondary: "text-secondary-600",
  primary: "text-primary-600",
  success: "text-success-600",
  warning: "text-warning-500",
  error: "text-error-600",
};

/**
 * Stat card matching the Figma redesign: uppercase gray label with a tinted
 * icon bubble in the corner, large value, small supporting line.
 */
export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "secondary",
  valueTone = "default",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-100 bg-white p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
              iconTones[tone],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-3xl font-bold tracking-tight",
          valueTones[valueTone],
        )}
      >
        {value}
      </p>
      {sub && <div className="mt-1.5 text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}

/** Small green/red delta line used inside MetricCard subs, e.g. "+12.4% vs last week". */
export function MetricTrend({
  direction,
  label,
  suffix,
}: {
  direction: "up" | "down";
  label: string;
  suffix?: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span
        className={cn(
          "font-semibold",
          direction === "up" ? "text-success-600" : "text-error-600",
        )}
      >
        {direction === "up" ? "↑" : "↓"} {label}
      </span>
      {suffix && <span className="text-neutral-400">{suffix}</span>}
    </span>
  );
}
