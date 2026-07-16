import { Inbox } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface EmptyStateProps {
  /** Icon or illustration node. Defaults to a generic inbox icon. */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Optional slot for a call-to-action, e.g. a "Create" button. */
  action?: ReactNode;
  className?: string;
}

const defaultIcon = <Inbox className="h-10 w-10 text-neutral-300" />;

type EmptyStateTone = "secondary" | "primary" | "warning" | "neutral";

const iconTones: Record<EmptyStateTone, { bubble: string; icon: string }> = {
  secondary: { bubble: "bg-secondary-50", icon: "text-secondary-500" },
  primary: { bubble: "bg-primary-50", icon: "text-primary-500" },
  warning: { bubble: "bg-warning-50", icon: "text-warning-500" },
  neutral: { bubble: "bg-neutral-100", icon: "text-neutral-400" },
};

/**
 * Tinted icon bubble for EmptyState's `icon` slot, so feature empty states
 * share one look: `icon={<EmptyStateIcon icon={Users} />}`.
 */
export function EmptyStateIcon({
  icon: Icon,
  tone = "secondary",
}: {
  icon: ComponentType<{ className?: string }>;
  tone?: EmptyStateTone;
}) {
  const tones = iconTones[tone];
  return (
    <span
      className={cn(
        "mb-1 flex h-14 w-14 items-center justify-center rounded-2xl",
        tones.bubble,
      )}
    >
      <Icon className={cn("h-6 w-6", tones.icon)} />
    </span>
  );
}

/**
 * Shared "no data" placeholder for tables and API-backed lists — a
 * consistent box, icon, title, and optional description instead of every
 * feature hand-rolling its own. Pass `icon` to use a custom illustration
 * (e.g. a themed SVG) instead of the default.
 */
export function EmptyState({
  icon = defaultIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 px-6 py-10 text-center",
        className,
      )}
    >
      {icon}
      <p className="text-sm font-semibold text-neutral-800">{title}</p>
      {description && (
        <p className="max-w-[260px] text-xs text-neutral-400">{description}</p>
      )}
      {action}
    </div>
  );
}
