import type { ComponentType, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type MetricTone = "secondary" | "primary" | "success" | "warning" | "error";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  tone?: MetricTone;
  valueTone?: MetricTone | "default";
  className?: string;
}

const iconTones: Record<MetricTone, string> = {
  secondary:
    "bg-secondary-50 text-secondary-600 dark:bg-secondary-950 dark:text-secondary-300",
  primary:
    "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300",
  success:
    "bg-success-50 text-success-600 dark:bg-success-950 dark:text-success-300",
  warning:
    "bg-warning-50 text-warning-600 dark:bg-warning-950 dark:text-warning-300",
  error: "bg-error-50 text-error-600 dark:bg-error-950 dark:text-error-300",
};

const valueTones: Record<NonNullable<MetricCardProps["valueTone"]>, string> = {
  default: "text-neutral-900 dark:text-neutral-50",
  secondary: "text-secondary-600 dark:text-secondary-400",
  primary: "text-primary-600 dark:text-primary-400",
  success: "text-success-600 dark:text-success-400",
  warning: "text-warning-500 dark:text-warning-400",
  error: "text-error-600 dark:text-error-400",
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
        "rounded-2xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
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
      {sub && (
        <div className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {sub}
        </div>
      )}
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
          direction === "up"
            ? "text-success-600 dark:text-success-400"
            : "text-error-600 dark:text-error-400",
        )}
      >
        {direction === "up" ? "↑" : "↓"} {label}
      </span>
      {suffix && (
        <span className="text-neutral-400 dark:text-neutral-500">{suffix}</span>
      )}
    </span>
  );
}
