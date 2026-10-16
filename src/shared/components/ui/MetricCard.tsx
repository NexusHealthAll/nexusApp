import type { ComponentType, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Skeleton } from "@/shared/components/ui/Skeleton";

type MetricTone = "secondary" | "primary" | "success" | "warning" | "error";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  tone?: MetricTone;
  valueTone?: MetricTone | "default";
  className?: string;
  /** Keeps the label and icon, and swaps the value and sub line for pulsing placeholders. */
  loading?: boolean;
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
  loading = false,
}: MetricCardProps) {
  return (
    <div
      aria-busy={loading || undefined}
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
      {loading ? (
        <>
          <Skeleton className="mt-3 h-8 w-24" />
          {sub !== undefined && <Skeleton className="mt-2.5 h-3 w-32" />}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

/**
 * Week-over-week delta line for MetricCard subs, e.g. "^ +12.4% vs last week".
 * Green with an up caret for a gain, red with a down caret for a loss, and
 * neutral grey (no caret) when nothing changed.
 */
export function MetricTrend({
  pct,
  suffix = "vs last week",
}: {
  pct: number;
  suffix?: string;
}) {
  const rounded = Math.round(pct * 10) / 10;
  const direction = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  const Caret = direction === "up" ? ChevronUp : ChevronDown;
  const tone =
    direction === "up"
      ? "text-success-600 dark:text-success-400"
      : direction === "down"
        ? "text-error-600 dark:text-error-400"
        : "text-neutral-500 dark:text-neutral-400";

  return (
    <span className={cn("flex items-center gap-1", tone)}>
      {direction !== "flat" && <Caret className="h-3.5 w-3.5" aria-hidden />}
      <span className="font-semibold">
        {rounded > 0 ? "+" : ""}
        {rounded.toFixed(1)}%
      </span>
      <span className="font-normal">{suffix}</span>
    </span>
  );
}
