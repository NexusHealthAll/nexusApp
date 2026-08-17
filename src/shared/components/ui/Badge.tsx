import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300",
  warning: "bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300",
  error: "bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-300",
  info: "bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
  neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);

Badge.displayName = "Badge";

export { Badge };
